import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  const { error, user } = await requireRole(request, 'consumer');
  if (error) return error;

  try {
    await dbConnect();
    const payments = await Payment.find({ consumer: user._id })
      .populate('order', 'totalAmount status createdAt')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, payments });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
