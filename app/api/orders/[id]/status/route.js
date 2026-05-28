import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireRole } from '@/lib/auth';
import { sendEmail, orderStatusEmail } from '@/lib/email';

export async function PUT(request, { params }) {
  const { error, user } = await requireRole(request, 'farmer', 'admin');
  if (error) return error;

  try {
    await dbConnect();
    const { status } = await request.json();
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    if (user.role === 'farmer') {
      const uid = user._id.toString();
      const myNames = [user.farmName, user.name].filter(Boolean);

      // Check if this farmer has ANY item in the order:
      // 1. Via farmer ID stored on item (new orders)
      const hasItemById = order.items.some((line) => line.farmer?.toString() === uid);

      // 2. Via farmerName string (old orders / fallback)
      const hasItemByName = order.items.some((line) => myNames.includes(line.farmerName));

      // 3. Via product lookup (items where farmer ID not stored and name doesn't match)
      let hasItemByProduct = false;
      if (!hasItemById && !hasItemByName) {
        const productIds = order.items.map((line) => line.product).filter(Boolean);
        const products = await Product.find({ _id: { $in: productIds }, farmer: user._id }).select('_id');
        hasItemByProduct = products.length > 0;
      }

      if (!hasItemById && !hasItemByName && !hasItemByProduct) {
        return NextResponse.json({ success: false, message: 'You have no items in this order.' }, { status: 403 });
      }
    }

    const updated = await Order.findByIdAndUpdate(params.id, { status }, { new: true }).populate(
      'consumer',
      'name email'
    );

    if (updated?.consumer?.email) {
      sendEmail(orderStatusEmail(updated, updated.consumer, status)).catch(() => {});
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
