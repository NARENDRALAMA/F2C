import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  const { error, user } = await requireRole(request, 'farmer');
  if (error) return error;

  try {
    await dbConnect();
    const farmerProducts = await Product.find({ farmer: user._id }).select('_id');
    const productIds = farmerProducts.map((p) => p._id);
    const myNames = [user.farmName, user.name].filter(Boolean);

    // Match orders by product ID (current products) OR by farmerName (deleted products / legacy)
    const orders = await Order.find({
      $or: [
        { 'items.product': { $in: productIds } },
        { 'items.farmer': user._id },
        { 'items.farmerName': { $in: myNames } },
      ],
    })
      .populate('consumer', 'name email phone')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
