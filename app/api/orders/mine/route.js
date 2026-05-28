import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  const { error, user } = await requireRole(request, 'consumer');
  if (error) return error;

  try {
    await dbConnect();
    const orders = await Order.find({ consumer: user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
