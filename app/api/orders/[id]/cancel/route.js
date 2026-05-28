import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireRole } from '@/lib/auth';

export async function PUT(request, { params }) {
  const { error, user } = await requireRole(request, 'consumer');
  if (error) return error;

  try {
    await dbConnect();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    if (order.consumer.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, message: 'Not your order' }, { status: 403 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'Only pending orders can be cancelled' }, { status: 400 });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = 'cancelled';
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
