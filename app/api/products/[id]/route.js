import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { requireRole } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id).populate('farmer', 'name farmName phone');
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { error, user } = await requireRole(request, 'admin', 'farmer');
  if (error) return error;

  try {
    await dbConnect();
    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    if (user.role === 'farmer' && product.farmer.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, message: 'Not your product' }, { status: 403 });
    }

    const { name, description, price, unit, stock, category, meatType, image, farmerId, isAvailable } = await request.json();
    const update = { name, description, price, unit, stock, category, meatType, image };
    if (isAvailable !== undefined) update.isAvailable = isAvailable;
    if (user.role === 'admin' && farmerId) update.farmer = farmerId;
    const updated = await Product.findByIdAndUpdate(params.id, update, { new: true });
    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { error, user } = await requireRole(request, 'admin', 'farmer');
  if (error) return error;

  try {
    await dbConnect();
    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    if (user.role === 'farmer' && product.farmer.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, message: 'Not your product' }, { status: 403 });
    }

    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
