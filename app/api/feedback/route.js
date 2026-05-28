import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireRole } from '@/lib/auth';

export async function POST(request) {
  const { error, user } = await requireRole(request, 'consumer');
  if (error) return error;

  try {
    await dbConnect();
    const { productId, rating, comment } = await request.json();

    const deliveredOrder = await Order.findOne({
      consumer: user._id,
      status: 'delivered',
      'items.product': productId,
    });
    if (!deliveredOrder) {
      return NextResponse.json(
        { success: false, message: 'You can only review products from delivered orders' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    const existing = await Feedback.findOne({ product: productId, consumer: user._id });
    if (existing) {
      return NextResponse.json({ success: false, message: 'You already reviewed this product' }, { status: 400 });
    }

    const feedback = await Feedback.create({
      product: productId,
      consumer: user._id,
      farmer: product.farmer,
      rating,
      comment,
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
