import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth';

export async function POST(request) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    await dbConnect();
    const { orderId, paymentIntentId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: 'orderId is required' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (order.consumer.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, message: 'Not your order' }, { status: 403 });
    }

    if (
      paymentIntentId &&
      order.stripePaymentIntentId &&
      order.stripePaymentIntentId !== paymentIntentId
    ) {
      return NextResponse.json({ success: false, message: 'Payment intent does not match order' }, { status: 400 });
    }

    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', status: 'confirmed' });

    if (paymentIntentId) {
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { status: 'succeeded', paidAt: new Date() }
      );
    }

    return NextResponse.json({ success: true, message: 'Payment confirmed' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
