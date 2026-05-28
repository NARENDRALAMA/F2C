import 'dotenv/config';
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
