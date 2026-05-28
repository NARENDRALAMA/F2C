import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

export async function PUT(request, { params }) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;

  try {
    await dbConnect();
    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    user.isActive = !user.isActive;
    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
