import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  const { error, user } = await requireAuth(request);
  if (error) return error;
  return NextResponse.json({ success: true, user });
}

export async function PUT(request) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    const { name, phone, address, farmName, farmDescription, suburb, deliveryZones, avatar } = await request.json();
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (farmName !== undefined) user.farmName = farmName;
    if (farmDescription !== undefined) user.farmDescription = farmDescription;
    if (suburb !== undefined) user.suburb = suburb;
    if (avatar !== undefined) user.avatar = avatar;
    if (Array.isArray(deliveryZones)) user.deliveryZones = deliveryZones.map((z) => z.toLowerCase().trim()).filter(Boolean);
    await user.save();
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
