import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

FeedbackSchema.index({ product: 1, consumer: 1 }, { unique: true });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
