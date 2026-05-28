import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    await dbConnect();
    const order = await Order.findById(params.id)
      .populate('consumer', 'name email')
      .populate('items.product', 'name image');

    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    const isOwner = order.consumer._id.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
