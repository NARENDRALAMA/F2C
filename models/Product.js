import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    unit: { type: String, required: [true, 'Unit is required'], default: 'kg' },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: {
      type: String,
      enum: ['Vegetables', 'Fruit', 'Dairy & Eggs', 'Meat'],
      required: true,
    },
    meatType: {
      type: String,
      enum: ['', 'Chicken', 'Lamb', 'Beef', 'Goat', 'Pork'],
      default: '',
    },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.virtual('averageRating', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

// Always re-register in dev so schema changes (enum updates etc.) take effect without restart
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}
export default mongoose.model('Product', ProductSchema);
