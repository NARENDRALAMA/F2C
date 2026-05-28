import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://f2cpass1:f2cpass1@cluster0.ppfx2.mongodb.net/f2c?retryWrites=true&w=majority&appName=Cluster0';

const AVATARS = [
  // farmers — rugged outdoor look
  { name: 'John Smith',    avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Mary Johnson',  avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  // consumers
  { name: 'Alice Chen',    avatar: 'https://randomuser.me/api/portraits/women/26.jpg' },
  { name: 'Samir Paudel',  avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
  // admin
  { name: 'Admin User',    avatar: 'https://randomuser.me/api/portraits/men/60.jpg' },
];

await mongoose.connect(MONGODB_URI);
const db = mongoose.connection.db;

for (const { name, avatar } of AVATARS) {
  const res = await db.collection('users').updateOne({ name }, { $set: { avatar } });
  console.log(`${name}: ${res.modifiedCount ? '✓ updated' : '— not found'}`);
}

console.log('\nDone!');
process.exit(0);
