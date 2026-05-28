import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const meatType = searchParams.get('meatType');
    const suburb = searchParams.get('suburb');

    const query = { isAvailable: true };
    if (category && category !== 'All') query.category = category;
    if (meatType && meatType !== 'All') query.meatType = meatType;
    if (search) query.name = { $regex: search, $options: 'i' };

    // Delivery zone filter: find farmers who deliver to the given suburb
    if (suburb) {
      const farmerIds = await User.find({
        role: 'farmer',
        deliveryZones: suburb.toLowerCase().trim(),
      }).distinct('_id');
      query.farmer = { $in: farmerIds };
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('farmer', 'name farmName deliveryZones suburb')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { error, user } = await requireRole(request, 'admin', 'farmer');
  if (error) return error;

  try {
    await dbConnect();
    const { farmerId, ...rest } = await request.json();
    // Farmers always create products under their own account
    const farmerId_ = user.role === 'farmer' ? user._id : farmerId;
    if (!farmerId_) {
      return NextResponse.json({ success: false, message: 'Farmer is required' }, { status: 400 });
    }
    const product = await Product.create({ ...rest, farmer: farmerId_ });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
