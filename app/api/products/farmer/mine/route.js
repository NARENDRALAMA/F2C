import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  const { error, user } = await requireRole(request, 'farmer');
  if (error) return error;

  try {
    await dbConnect();
    const products = await Product.find({ farmer: user._id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
