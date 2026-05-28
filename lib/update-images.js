import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
  name: String, image: String, category: String, meatType: String,
}, { strict: false });

// Verified raw meat images from Unsplash
const IMAGE_MAP = {
  // Chicken - raw, uncooked
  'Free-Range Chicken Breast':      'https://images.unsplash.com/photo-1682991136736-a2b44623eeba?w=500&h=350&fit=crop',
  'Whole Free-Range Chicken':       'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&h=350&fit=crop',
  'Chicken Thighs — Bone In':       'https://images.unsplash.com/photo-1589372545389-bb4d9d138bdb?w=500&h=350&fit=crop',

  // Beef - raw
  'Grass-Fed Beef Mince':           'https://images.unsplash.com/photo-1623047437095-27418540c288?w=500&h=350&fit=crop',
  'Beef Rump Steak':                'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&h=350&fit=crop',
  'Beef Sausages':                  'https://images.unsplash.com/photo-1624772398061-bbfa87ec6b5a?w=500&h=350&fit=crop',

  // Goat - raw
  'Goat Leg — Bone In':             'https://images.unsplash.com/photo-1690983323238-0b91789e1b5a?w=500&h=350&fit=crop',
  'Goat Mince':                     'https://images.unsplash.com/photo-1611059263765-f57653f3bba3?w=500&h=350&fit=crop',

  // Pork - raw
  'Pork Belly Slices':              'https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?w=500&h=350&fit=crop',
  'Pork Sausages':                  'https://images.unsplash.com/photo-1624772398061-bbfa87ec6b5a?w=500&h=350&fit=crop',
};

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');

  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  let updated = 0;
  for (const [name, image] of Object.entries(IMAGE_MAP)) {
    const res = await Product.updateMany({ name }, { $set: { image } });
    if (res.modifiedCount > 0) {
      console.log(`  ✓ Updated: ${name}`);
      updated += res.modifiedCount;
    } else {
      console.log(`  ✗ Not found: ${name}`);
    }
  }

  console.log(`\n✅ Done — updated ${updated} products`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error('Failed:', err.message); process.exit(1); });
