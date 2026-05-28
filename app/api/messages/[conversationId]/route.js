import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import { requireAuth } from '@/lib/auth';

// GET /api/messages/[conversationId] — fetch messages + mark as read
export async function GET(request, { params }) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    await dbConnect();
    const { conversationId } = params;

    // Confirm user is a participant
    const uid = user._id.toString();
    if (!conversationId.includes(uid)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name farmName role avatar')
      .populate('product', 'name')
      .sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany({ conversationId, receiver: user._id, read: false }, { read: true });

    return NextResponse.json({ success: true, messages });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
