'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Package, X } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isConsumer, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isConsumer)) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isConsumer, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      try {
        const res = await api.get('/orders/mine');
        setOrders(res.data.orders);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isAuthenticated]);

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      const res = await api.get('/orders/mine');
      setOrders(res.data.orders);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  if (authLoading || loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-gray-600 mb-8">Track your orders and delivery status.</p>

      {orders.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="btn-primary inline-flex px-6 py-2 rounded-lg">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expanded === order._id;
            const stepIndex = STATUS_FLOW.indexOf(order.status);
            return (
              <div key={order._id} className="card">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-700 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full badge-status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
                    <p className="font-bold text-green-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button onClick={() => handleCancel(order._id)}
                        className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg flex items-center gap-1">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    )}
                    <button onClick={() => setExpanded(isExpanded ? null : order._id)}
                      className="text-sm text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-1">
                      Details {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Status timeline */}
                {order.status !== 'cancelled' && (
                  <div className="mt-6 flex items-center justify-between">
                    {STATUS_FLOW.map((s, i) => (
                      <div key={s} className="flex-1 flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {i + 1}
                        </div>
                        <div className="ml-2 text-xs hidden sm:block">
                          <p className={`font-medium ${i <= stepIndex ? 'text-gray-900' : 'text-gray-400'}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </p>
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? 'bg-green-600' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <h4 className="font-semibold text-sm text-gray-900">Items</h4>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-gray-500 text-xs">from {item.farmerName}</p>
                        </div>
                        <div className="text-right">
                          <p>{item.quantity} × ${item.price.toFixed(2)}</p>
                          <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="text-sm text-gray-600 pt-2">
                      <p><span className="font-medium">Delivery to:</span> {order.deliveryAddress}</p>
                      {order.notes && <p><span className="font-medium">Notes:</span> {order.notes}</p>}
                      <p><span className="font-medium">Payment:</span> {order.paymentStatus}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
