import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String, description: String, price: Number, unit: String,
  stock: Number, category: String, meatType: { type: String, default: '' },
  image: String, isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({ name: String, email: String, role: String, farmName: String });

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  const farmer1 = await User.findOne({ email: 'john@farm.com' });
  const farmer2 = await User.findOne({ email: 'mary@farm.com' });

  const f1 = farmer1._id;
  const f2 = farmer2._id;

  const newProducts = [
    // ── MEAT ──
    {
      farmer: f1, name: 'Free-Range Chicken Breast', meatType: 'Chicken',
      description: 'Tender, juicy free-range chicken breast. No hormones, no antibiotics — raised on open pasture with natural feed.',
      price: 12.99, unit: 'kg', stock: 40, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d11d36?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Whole Free-Range Chicken', meatType: 'Chicken',
      description: 'A whole pasture-raised chicken perfect for roasting. Rich flavour from slow, natural growth on open farmland.',
      price: 18.50, unit: 'each', stock: 25, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Chicken Thighs — Bone In', meatType: 'Chicken',
      description: 'Juicy bone-in chicken thighs from free-range birds. Perfect for curries, braises, and BBQ.',
      price: 9.99, unit: 'kg', stock: 35, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Grass-Fed Beef Mince', meatType: 'Beef',
      description: 'Premium 100% grass-fed beef mince. Rich in omega-3 and natural flavour. Perfect for burgers, bolognese, and meatballs.',
      price: 14.99, unit: 'kg', stock: 30, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Beef Rump Steak', meatType: 'Beef',
      description: 'Full-flavoured grass-fed rump steak. Aged for tenderness, perfect on the grill or pan-seared with garlic butter.',
      price: 22.00, unit: 'kg', stock: 20, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Beef Sausages', meatType: 'Beef',
      description: 'Traditional beef sausages made with grass-fed beef and natural herbs. No fillers, no preservatives.',
      price: 11.50, unit: 'kg', stock: 28, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Goat Leg — Bone In', meatType: 'Goat',
      description: 'Free-range goat leg, ideal for slow roasting or curries. Lean, tender, and full of rich flavour.',
      price: 16.99, unit: 'kg', stock: 15, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Goat Mince', meatType: 'Goat',
      description: 'Lean free-range goat mince. Low in fat, high in protein — great for keema, pies, and pasta.',
      price: 13.99, unit: 'kg', stock: 20, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Pork Belly Slices', meatType: 'Pork',
      description: 'Slow-grown pork belly slices from heritage breed pigs raised on pasture. Perfect for BBQ, roasting, or Asian-style braises.',
      price: 13.50, unit: 'kg', stock: 22, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1607116667981-ff3c852b576b?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Pork Sausages', meatType: 'Pork',
      description: 'Handmade pork sausages using heritage breed pigs. Seasoned with fresh herbs — ideal for the BBQ or breakfast.',
      price: 10.99, unit: 'kg', stock: 30, category: 'Meat',
      image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=500&h=350&fit=crop',
    },

    // ── VEGETABLES ──
    {
      farmer: f1, name: 'Fresh Broccoli', category: 'Vegetables',
      description: 'Crisp, dark-green broccoli heads harvested fresh. High in fibre and vitamins — perfect steamed, roasted, or stir-fried.',
      price: 3.50, unit: 'head', stock: 50, meatType: '',
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Sweet Potato', category: 'Vegetables',
      description: 'Naturally sweet and creamy orange-flesh sweet potatoes. Great for roasting, mashing, or soups.',
      price: 3.99, unit: 'kg', stock: 60, meatType: '',
      image: 'https://images.unsplash.com/photo-1596097635121-14b38c5d7c06?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Lebanese Cucumbers', category: 'Vegetables',
      description: 'Crisp, thin-skinned Lebanese cucumbers grown without pesticides. Fresh and mild — perfect for salads and snacking.',
      price: 2.50, unit: 'bunch', stock: 45, meatType: '',
      image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Red Capsicum', category: 'Vegetables',
      description: 'Sweet, vibrant red capsicums grown in rich soil. Perfect for roasting, stir-fries, and fresh salads.',
      price: 4.99, unit: 'kg', stock: 40, meatType: '',
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Kent Pumpkin', category: 'Vegetables',
      description: 'Dense, sweet Kent pumpkin ideal for soups, roasting, and curries. Grown slowly for deep, rich flavour.',
      price: 5.99, unit: 'kg', stock: 35, meatType: '',
      image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Zucchini', category: 'Vegetables',
      description: 'Tender, fresh zucchini picked young for the best texture. Great grilled, baked, or in pasta dishes.',
      price: 3.29, unit: 'kg', stock: 50, meatType: '',
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Corn on the Cob', category: 'Vegetables',
      description: 'Sweet, juicy corn cobs freshly picked. Perfect on the BBQ, boiled, or roasted with butter.',
      price: 1.50, unit: 'each', stock: 80, meatType: '',
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&h=350&fit=crop',
    },

    // ── FRUITS ──
    {
      farmer: f2, name: 'Strawberries', category: 'Fruit',
      description: 'Plump, sun-ripened strawberries bursting with sweetness. Hand-picked at peak ripeness from the orchard.',
      price: 6.99, unit: 'punnet', stock: 40, meatType: '',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Mangoes', category: 'Fruit',
      description: 'Luscious, fleshy mangoes with a rich tropical flavour. Tree-ripened for maximum sweetness.',
      price: 4.50, unit: 'each', stock: 50, meatType: '',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Navel Oranges', category: 'Fruit',
      description: 'Juicy, seedless navel oranges packed with vitamin C. Great for eating fresh or juicing.',
      price: 5.99, unit: 'kg', stock: 60, meatType: '',
      image: 'https://images.unsplash.com/photo-1582979512210-f69fddf94fc1?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Watermelon', category: 'Fruit',
      description: 'Crisp, sweet seedless watermelon grown in warm conditions. The perfect summer fruit — refreshing and hydrating.',
      price: 8.99, unit: 'each', stock: 25, meatType: '',
      image: 'https://images.unsplash.com/photo-1571575173700-afb9492437d3?w=500&h=350&fit=crop',
    },
    {
      farmer: f2, name: 'Blueberries', category: 'Fruit',
      description: 'Fresh, antioxidant-rich blueberries picked daily. Plump and naturally sweet — great for breakfast or baking.',
      price: 7.50, unit: 'punnet', stock: 35, meatType: '',
      image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500&h=350&fit=crop',
    },
    {
      farmer: f1, name: 'Bananas', category: 'Fruit',
      description: 'Ripe, naturally sweet bananas from small-scale growers. Perfect for snacking, smoothies, and baking.',
      price: 3.49, unit: 'kg', stock: 70, meatType: '',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=350&fit=crop',
    },
  ];

  const result = await Product.insertMany(newProducts);
  console.log(`✅ Added ${result.length} new products:`);
  result.forEach(p => console.log(`  - [${p.category}${p.meatType ? '/' + p.meatType : ''}] ${p.name}`));

  await mongoose.disconnect();
}

run().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
