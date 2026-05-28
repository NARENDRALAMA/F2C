import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Feedback from '@/models/Feedback';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const farmer = await User.findOne({ _id: params.id, role: 'farmer', isActive: true })
      .select('name farmName farmDescription phone suburb deliveryZones avatar createdAt');

    if (!farmer) {
      return NextResponse.json({ success: false, message: 'Farmer not found' }, { status: 404 });
    }

    const products = await Product.find({ farmer: params.id, isAvailable: true }).sort({ createdAt: -1 });

    // Aggregate ratings across all farmer's products
    const productIds = products.map((p) => p._id);
    const reviews = await Feedback.find({ product: { $in: productIds } }).select('rating');
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      success: true,
      farmer,
      products,
      stats: { productCount: products.length, reviewCount: reviews.length, avgRating },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
