import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';
import Stripe from 'stripe';
import { sendEmail, orderConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  const { error, user } = await requireRole(request, 'consumer');
  if (error) return error;

  const rolledBack = [];

  try {
    await dbConnect();
    const { items, deliveryAddress, notes } = await request.json();

    if (!items?.length) {
      return NextResponse.json({ success: false, message: 'No items in order' }, { status: 400 });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, isAvailable: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      ).populate('farmer', 'name farmName');

      if (!updated) {
        const err = new Error(`Insufficient stock or product unavailable`);
        err.status = 400;
        throw err;
      }

      rolledBack.push({ productId: updated._id, qty: item.quantity });

      const lineTotal = updated.price * item.quantity;
      totalAmount += lineTotal;
      orderItems.push({
        product: updated._id,
        farmer: updated.farmer._id,
        quantity: item.quantity,
        price: updated.price,
        farmerName: updated.farmer.farmName || updated.farmer.name,
        productName: updated.name,
      });
    }

    const deliveryFee = 5;
    totalAmount += deliveryFee;

    let clientSecret = null;
    let paymentIntentId = '';

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey && stripeKey !== 'sk_test_placeholder') {
      const stripe = new Stripe(stripeKey);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'aud',
        metadata: { consumerId: user._id.toString() },
      });
      clientSecret = paymentIntent.client_secret;
      paymentIntentId = paymentIntent.id;
    }

    let order = await Order.create({
      consumer: user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      notes,
      stripePaymentIntentId: paymentIntentId,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    try {
      if (paymentIntentId) {
        await Payment.create({
          order: order._id,
          consumer: user._id,
          amount: totalAmount,
          stripePaymentIntentId: paymentIntentId,
        });
      }
    } catch (payErr) {
      await Order.findByIdAndDelete(order._id);
      order = null;
      throw payErr;
    }

    // Send confirmation email (non-blocking)
    const consumer = await User.findById(user._id).select('name email');
    if (consumer) sendEmail(orderConfirmationEmail(order, consumer)).catch(() => {});

    return NextResponse.json({ success: true, order, clientSecret }, { status: 201 });
  } catch (err) {
    for (const r of rolledBack.reverse()) {
      await Product.findByIdAndUpdate(r.productId, { $inc: { stock: r.qty } });
    }
    const status = err.status ?? 500;
    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}
