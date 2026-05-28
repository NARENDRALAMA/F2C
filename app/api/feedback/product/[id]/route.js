import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const feedback = await Feedback.find({ product: params.id })
      .populate('consumer', 'name avatar')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
