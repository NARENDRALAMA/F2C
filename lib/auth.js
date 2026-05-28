import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import dbConnect from './db';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'f2c-secret-key-change-in-production';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(request) {
  const user = await getAuthUser(request);
  if (!user) {
    return {
      error: NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 }),
      user: null,
    };
  }
  return { error: null, user };
}

export async function requireRole(request, ...roles) {
  const { error, user } = await requireAuth(request);
  if (error) return { error, user: null };

  if (!roles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { success: false, message: `Role '${user.role}' is not authorized` },
        { status: 403 }
      ),
      user: null,
    };
  }
  return { error: null, user };
}
