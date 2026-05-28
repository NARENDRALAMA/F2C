import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const farmers = await User.find({ role: 'farmer', isActive: true })
      .select('name farmName farmDescription suburb deliveryZones avatar createdAt')
      .sort({ farmName: 1 });

    const enriched = await Promise.all(
      farmers.map(async (f) => {
        const count = await Product.countDocuments({ farmer: f._id, isAvailable: true });
        return { ...f.toObject(), productCount: count };
      })
    );

    return NextResponse.json({ success: true, farmers: enriched });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
