import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/f2c';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const { default: User } = await import('../models/User.js');
  const { default: Product } = await import('../models/Product.js');
  const { default: Order } = await import('../models/Order.js');
  const { default: Payment } = await import('../models/Payment.js');
  const { default: Feedback } = await import('../models/Feedback.js');

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Feedback.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@f2c.com',
    password: 'password123',
    role: 'admin',
  });

  const farmer1 = await User.create({
    name: 'John Smith',
    email: 'john@farm.com',
    password: 'password123',
    role: 'farmer',
    farmName: 'Green Valley Farm',
    phone: '0412 345 678',
    address: 'Hunter Valley, NSW',
  });

  const farmer2 = await User.create({
    name: 'Mary Johnson',
    email: 'mary@farm.com',
    password: 'password123',
    role: 'farmer',
    farmName: 'Sunrise Orchards',
    phone: '0423 456 789',
    address: 'Blue Mountains, NSW',
  });

  const consumer = await User.create({
    name: 'Alice Chen',
    email: 'alice@email.com',
    password: 'password123',
    role: 'consumer',
    phone: '0434 567 890',
    address: '123 Pitt St, Sydney NSW 2000',
  });

  console.log('Created users:', { admin: admin._id, farmer1: farmer1._id, farmer2: farmer2._id, consumer: consumer._id });

  const products = await Product.insertMany([
    {
      farmer: farmer1._id,
      name: 'Organic Tomatoes',
      description: 'Fresh, vine-ripened organic tomatoes perfect for salads, sauces, and cooking.',
      price: 4.99,
      unit: 'kg',
      stock: 50,
      category: 'Vegetables',
      image: 'https://i0.wp.com/katiespring.com/wp-content/uploads/2018/02/P1130463.jpg?resize=1024%2C682&ssl=1',
    },
    {
      farmer: farmer1._id,
      name: 'Organic Carrots',
      description: 'Sweet, crunchy organic carrots grown in rich, organic soil. Great for snacking or cooking.',
      price: 2.99,
      unit: 'kg',
      stock: 60,
      category: 'Vegetables',
      image: 'https://happyharvestfarms.com/blog/wp-content/uploads/2024/01/Health-Benefits-of-Carrots.jpg',
    },
    {
      farmer: farmer1._id,
      name: 'Baby Spinach',
      description: 'Tender organic spinach leaves. Perfect for salads, smoothies, and cooking.',
      price: 3.99,
      unit: 'bunch',
      stock: 40,
      category: 'Vegetables',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzkvRQewafke20hSOOxPZFDcff_5ZNhkjhEw&s',
    },
    {
      farmer: farmer2._id,
      name: 'Honeycrisp Apples',
      description: 'Crisp, sweet Honeycrisp apples picked at peak ripeness. Perfect for snacking or baking.',
      price: 3.49,
      unit: 'kg',
      stock: 75,
      category: 'Fruit',
      image: 'https://www.trees.com/wp-content/uploads/products/medium/1000/HoneycrispAppleTree2.webp',
    },
    {
      farmer: farmer2._id,
      name: 'Fresh Whole Milk',
      description: 'Fresh, creamy whole milk from grass-fed cows. Pasteurized but not homogenized.',
      price: 6.99,
      unit: 'litre',
      stock: 30,
      category: 'Dairy & Eggs',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpKo0rI5YOmSLtUx91UsQObxAcHKtp6MAsBw&s',
    },
    {
      farmer: farmer2._id,
      name: 'Free Range Eggs',
      description: 'Dozen fresh free-range eggs from happy hens. Rich yolks, perfect flavour.',
      price: 8.50,
      unit: 'dozen',
      stock: 25,
      category: 'Dairy & Eggs',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer1._id,
      name: 'Free Range Chicken',
      description: 'Whole free-range chicken raised on pasture. Tender, flavourful meat with no added hormones.',
      price: 18.99,
      unit: 'kg',
      stock: 20,
      category: 'Meat',
      meatType: 'Chicken',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer1._id,
      name: 'Grass-Fed Lamb Chops',
      description: 'Premium lamb chops from pasture-raised lambs in the Hunter Valley. Rich, tender, and full of flavour.',
      price: 24.99,
      unit: 'kg',
      stock: 15,
      category: 'Meat',
      meatType: 'Lamb',
      image: 'https://images.unsplash.com/photo-1514516816566-de580c621376?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer2._id,
      name: 'Grass-Fed Beef Mince',
      description: 'Lean beef mince from 100% grass-fed cattle. Great for burgers, bolognese, and more.',
      price: 16.99,
      unit: 'kg',
      stock: 30,
      category: 'Meat',
      meatType: 'Beef',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer1._id,
      name: 'Goat Shoulder',
      description: 'Slow-cook goat shoulder from heritage breed goats. Ideal for curries and roasts.',
      price: 19.99,
      unit: 'kg',
      stock: 10,
      category: 'Meat',
      meatType: 'Goat',
      image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer2._id,
      name: 'Pork Belly',
      description: 'Thick-cut pork belly from free-range pigs. Perfect for roasting or slow cooking.',
      price: 14.99,
      unit: 'kg',
      stock: 18,
      category: 'Meat',
      meatType: 'Pork',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer1._id,
      name: 'Chicken Thighs',
      description: 'Juicy bone-in chicken thighs from free-range birds. Great for roasting, grilling, or slow cooking.',
      price: 12.99,
      unit: 'kg',
      stock: 25,
      category: 'Meat',
      meatType: 'Chicken',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d11d36?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer1._id,
      name: 'Chicken Breast Fillets',
      description: 'Lean, skinless chicken breast fillets from pasture-raised birds. Versatile and high in protein.',
      price: 15.99,
      unit: 'kg',
      stock: 30,
      category: 'Meat',
      meatType: 'Chicken',
      image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer2._id,
      name: 'Lamb Leg Roast',
      description: 'Whole bone-in lamb leg from grass-fed lambs. Perfect for a Sunday roast with herbs and garlic.',
      price: 22.99,
      unit: 'kg',
      stock: 12,
      category: 'Meat',
      meatType: 'Lamb',
      image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer1._id,
      name: 'Lamb Sausages',
      description: 'Handmade lamb sausages seasoned with rosemary and garlic. No preservatives or fillers.',
      price: 13.99,
      unit: 'kg',
      stock: 20,
      category: 'Meat',
      meatType: 'Lamb',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer2._id,
      name: 'Beef Ribeye Steak',
      description: 'Premium grass-fed ribeye steak with excellent marbling. Best enjoyed grilled or pan-seared.',
      price: 39.99,
      unit: 'kg',
      stock: 10,
      category: 'Meat',
      meatType: 'Beef',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer1._id,
      name: 'Beef Sausages',
      description: 'Classic beef sausages made from 100% grass-fed beef. No artificial additives.',
      price: 11.99,
      unit: 'kg',
      stock: 35,
      category: 'Meat',
      meatType: 'Beef',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer2._id,
      name: 'Goat Mince',
      description: 'Lean goat mince — a healthier alternative to beef. Great for curries, koftas, and pasta.',
      price: 17.99,
      unit: 'kg',
      stock: 14,
      category: 'Meat',
      meatType: 'Goat',
      image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer1._id,
      name: 'Pork Ribs',
      description: 'Meaty pork spare ribs from free-range pigs. Perfect for slow smoking or oven roasting.',
      price: 13.49,
      unit: 'kg',
      stock: 22,
      category: 'Meat',
      meatType: 'Pork',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    },
    {
      farmer: farmer2._id,
      name: 'Pork Sausages',
      description: 'Traditional pork sausages made with fresh herbs. No preservatives, just great flavour.',
      price: 10.99,
      unit: 'kg',
      stock: 28,
      category: 'Meat',
      meatType: 'Pork',
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    },
  ]);

  console.log('Created', products.length, 'products');
  console.log('\n✅ Seed complete!');
  console.log('  Admin:    admin@f2c.com / password123');
  console.log('  Farmer 1: john@farm.com / password123');
  console.log('  Farmer 2: mary@farm.com / password123');
  console.log('  Consumer: alice@email.com / password123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
