import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  const { error, user } = await requireRole(request, 'farmer');
  if (error) return error;

  try {
    await dbConnect();

    const products = await Product.find({ farmer: user._id }).select('_id name');
    const productIds = products.map((p) => p._id);
    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p.name]));

    const orders = await Order.find({
      'items.product': { $in: productIds },
      status: { $nin: ['cancelled'] },
    }).select('items status createdAt');

    // Per-farmer revenue and product breakdown
    let totalRevenue = 0;
    const revenueByMonth = {};
    const revenueByProduct = {};
    let totalOrders = new Set();

    for (const order of orders) {
      const myItems = order.items.filter((item) =>
        productIds.some((id) => id.equals(item.product))
      );
      if (!myItems.length) continue;

      totalOrders.add(order._id.toString());
      const orderRevenue = myItems.reduce((s, i) => s + i.price * i.quantity, 0);
      totalRevenue += orderRevenue;

      const monthKey = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + orderRevenue;

      for (const item of myItems) {
        const pid = item.product.toString();
        if (!revenueByProduct[pid]) revenueByProduct[pid] = { name: productMap[pid] || pid, revenue: 0, units: 0 };
        revenueByProduct[pid].revenue += item.price * item.quantity;
        revenueByProduct[pid].units += item.quantity;
      }
    }

    // Build last 6 months array
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push({ month: key, revenue: revenueByMonth[key] || 0 });
    }

    const topProducts = Object.values(revenueByProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const statusCounts = {};
    for (const order of orders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      totalRevenue,
      totalOrders: totalOrders.size,
      totalProducts: products.length,
      months,
      topProducts,
      statusCounts,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
