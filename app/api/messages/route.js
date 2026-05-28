import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message, { makeConversationId } from '@/models/Message';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

// GET /api/messages — list all conversations for current user
export async function GET(request) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    await dbConnect();
    const uid = user._id.toString();

    // Latest message per conversation involving this user
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: user._id }, { receiver: user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', lastMsg: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$lastMsg' } },
      { $sort: { createdAt: -1 } },
    ]);

    const enriched = await Promise.all(
      conversations.map(async (msg) => {
        const otherId = msg.sender.toString() === uid ? msg.receiver : msg.sender;
        const other = await User.findById(otherId).select('name farmName role avatar');
        const unread = await Message.countDocuments({
          conversationId: msg.conversationId,
          receiver: user._id,
          read: false,
        });
        return { conversationId: msg.conversationId, other, lastMessage: msg.content, lastAt: msg.createdAt, unread };
      })
    );

    return NextResponse.json({ success: true, conversations: enriched });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/messages — send a message
export async function POST(request) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  try {
    await dbConnect();
    const { receiverId, content, productId } = await request.json();
    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ success: false, message: 'receiverId and content are required' }, { status: 400 });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return NextResponse.json({ success: false, message: 'Recipient not found' }, { status: 404 });

    const conversationId = makeConversationId(user._id, receiverId);
    const message = await Message.create({
      conversationId,
      sender: user._id,
      receiver: receiverId,
      product: productId || null,
      content: content.trim(),
    });

    const populated = await message.populate([
      { path: 'sender', select: 'name farmName role avatar' },
      { path: 'product', select: 'name' },
    ]);

    return NextResponse.json({ success: true, message: populated, conversationId }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
