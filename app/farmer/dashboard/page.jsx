'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, BarChart2, Settings, MapPin, X, ChevronDown, ChevronUp, MessageSquare, Package } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';

const STATUS_FLOW = [
  { key: 'pending',    label: 'Pending',    color: 'bg-gray-100 text-gray-600' },
  { key: 'confirmed',  label: 'Confirmed',  color: 'bg-blue-100 text-blue-700' },
  { key: 'processing', label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'shipped',    label: 'Shipped',    color: 'bg-purple-100 text-purple-700' },
  { key: 'delivered',  label: 'Delivered',  color: 'bg-green-100 text-green-700' },
];

const NEXT_ACTION = {
  pending:    { next: 'confirmed',  label: 'Confirm Order',   btnClass: 'bg-blue-600 hover:bg-blue-700' },
  confirmed:  { next: 'processing', label: 'Start Processing', btnClass: 'bg-yellow-500 hover:bg-yellow-600' },
  processing: { next: 'shipped',    label: 'Mark as Shipped',  btnClass: 'bg-purple-600 hover:bg-purple-700' },
  shipped:    { next: 'delivered',  label: 'Mark Delivered',   btnClass: 'bg-green-600 hover:bg-green-700' },
};

function OrderCard({ order: o, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const action = NEXT_ACTION[o.status];
  const statusInfo = STATUS_FLOW.find((s) => s.key === o.status) || STATUS_FLOW[0];
  const stepIndex = STATUS_FLOW.findIndex((s) => s.key === o.status);

  const doUpdate = async (status) => {
    setUpdating(true);
    await onStatusChange(o._id, status);
    setUpdating(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-gray-800">#{o._id.slice(-8).toUpperCase()}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            {o.paymentStatus === 'paid' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-600">Paid</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {o.consumer?.name} · {new Date(o.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className="font-bold text-green-600 text-lg shrink-0">${o.totalAmount.toFixed(2)}</span>
        <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-gray-400 hover:text-gray-600">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-0">
          {STATUS_FLOW.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                i < stepIndex ? 'bg-green-600 border-green-600 text-white' :
                i === stepIndex ? 'bg-white border-green-600 text-green-600' :
                'bg-white border-gray-200 text-gray-300'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {STATUS_FLOW.map((s) => (
            <span key={s.key} className="text-xs text-gray-400 w-6 text-center">{s.label.split(' ')[0]}</span>
          ))}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Items</p>
            <div className="space-y-1">
              {o.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.productName || item.product?.name} × {item.quantity}</span>
                  <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {o.deliveryAddress && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Delivery Address</p>
              <p className="text-sm text-gray-700">{o.deliveryAddress}</p>
            </div>
          )}
          {o.notes && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{o.notes}</p>
            </div>
          )}

          {o.consumer?._id && (
            <button
              onClick={async () => {
                try {
                  const res = await api.post('/messages', {
                    receiverId: o.consumer._id,
                    content: `Hi ${o.consumer.name}, regarding your order #${o._id.slice(-8).toUpperCase()}...`,
                  });
                  window.location.href = `/messages/${res.data.conversationId}`;
                } catch {}
              }}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <MessageSquare className="w-4 h-4" /> Message {o.consumer.name}
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      {o.status !== 'delivered' && o.status !== 'cancelled' && (
        <div className="border-t border-gray-100 px-5 py-3 flex gap-2">
          {action && (
            <button
              onClick={() => doUpdate(action.next)}
              disabled={updating}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60 ${action.btnClass}`}
            >
              {updating ? 'Updating...' : action.label}
            </button>
          )}
          <button
            onClick={() => doUpdate('cancelled')}
            disabled={updating}
            className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      )}
      {o.status === 'delivered' && (
        <div className="border-t border-gray-100 px-5 py-3 text-center text-sm text-green-600 font-medium">
          ✓ Order completed
        </div>
      )}
    </div>
  );
}
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';

export default function FarmerDashboardPage() {
  const router = useRouter();
  const { isFarmer, loading: authLoading, user, updateProfile } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({ farmName: '', farmDescription: '', phone: '', suburb: '' });
  const [zoneInput, setZoneInput] = useState('');
  const [zones, setZones] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!authLoading && !isFarmer) router.push('/');
  }, [authLoading, isFarmer, router]);

  const loadAll = async () => {
    try {
      const oRes = await api.get('/orders/farmer/incoming');
      setOrders(oRes.data.orders);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFarmer) {
      loadAll();
      // Pre-fill settings from current user
      if (user) {
        setSettings({
          farmName: user.farmName || '',
          farmDescription: user.farmDescription || '',
          phone: user.phone || '',
          suburb: user.suburb || '',
        });
        setZones(user.deliveryZones || []);
      }
    }
  }, [isFarmer, user]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get('/farmer/analytics');
      setAnalytics(res.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'analytics' && !analytics) loadAnalytics();
  }, [tab]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      loadAll();
    } catch {
      toast.error('Update failed');
    }
  };

  const addZone = () => {
    const z = zoneInput.trim().toLowerCase();
    if (!z || zones.includes(z)) return;
    setZones([...zones, z]);
    setZoneInput('');
  };

  const removeZone = (z) => setZones(zones.filter((x) => x !== z));

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateProfile({ ...settings, deliveryZones: zones });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (authLoading || loading) return <Spinner className="py-20" size="lg" />;

  const maxMonthRevenue = analytics ? Math.max(...(analytics.months?.map((m) => m.revenue) || [1]), 1) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your products, orders, analytics, and settings.</p>

      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'orders', label: 'Incoming Orders', icon: ShoppingBag, count: orders.length },
          { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${tab === id ? 'border-green-600 text-green-600 font-medium' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
            <Icon className="w-4 h-4" /> {label}
            {count !== undefined && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>}
          </button>
        ))}
        <Link
          href="/farmer/products"
          className="flex items-center gap-2 px-4 py-2 border-b-2 border-transparent text-gray-600 hover:text-gray-900 whitespace-nowrap transition-colors ml-auto"
        >
          <Package className="w-4 h-4" /> My Products
        </Link>
      </div>

      {/* ── Orders ── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="card text-center py-16 text-gray-500">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No incoming orders yet.</p>
              <p className="text-sm mt-1">Orders from customers will appear here.</p>
            </div>
          ) : orders.map((o) => (
            <OrderCard key={o._id} order={o} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* ── Analytics ── */}
      {tab === 'analytics' && (
        analyticsLoading ? <Spinner className="py-20" size="lg" /> :
        analytics ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Revenue', value: `$${analytics.totalRevenue.toFixed(2)}`, color: 'text-green-600' },
                { label: 'Total Orders', value: analytics.totalOrders, color: 'text-blue-600' },
                { label: 'Active Products', value: analytics.totalProducts, color: 'text-purple-600' },
              ].map((s) => (
                <div key={s.label} className="card text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Monthly revenue bar chart */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue — Last 6 Months</h3>
              <div className="flex items-end gap-3 h-40">
                {analytics.months.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">${m.revenue.toFixed(0)}</span>
                    <div className="w-full bg-green-100 rounded-t-md flex items-end justify-center"
                      style={{ height: `${Math.max((m.revenue / maxMonthRevenue) * 100, m.revenue > 0 ? 8 : 0)}%`, minHeight: m.revenue > 0 ? '8px' : '2px', background: m.revenue > 0 ? undefined : '#f3f4f6' }}>
                      <div className="w-full rounded-t-md bg-green-500" style={{ height: '100%' }} />
                    </div>
                    <span className="text-xs text-gray-500 text-center">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top products */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
              {analytics.topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">No sales data yet.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-900">{p.name}</span>
                          <span className="text-green-600 font-semibold">${p.revenue.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(p.revenue / analytics.topProducts[0].revenue) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{p.units} units</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order status breakdown */}
            {Object.keys(analytics.statusCounts).length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Orders by Status</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(analytics.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="capitalize text-sm font-medium text-gray-700">{status}</span>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null
      )}

      {/* ── Settings ── */}
      {tab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="card max-w-2xl space-y-5">
          <h3 className="font-semibold text-lg">Farm Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
            <input value={settings.farmName} onChange={(e) => setSettings({ ...settings, farmName: e.target.value })} className="input-field" placeholder="e.g. Green Valley Farm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Description</label>
            <textarea rows={3} value={settings.farmDescription} onChange={(e) => setSettings({ ...settings, farmDescription: e.target.value })} className="input-field" placeholder="Tell consumers about your farm, how you grow, certifications..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="input-field" placeholder="+61 4xx xxx xxx" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Suburb (where your farm is based)</label>
            <input value={settings.suburb} onChange={(e) => setSettings({ ...settings, suburb: e.target.value })} className="input-field" placeholder="e.g. Penrith" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-green-600" /> Delivery Zones (suburbs you deliver to)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={zoneInput}
                onChange={(e) => setZoneInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addZone(); } }}
                className="input-field flex-1"
                placeholder="e.g. Parramatta — press Enter to add"
              />
              <button type="button" onClick={addZone} className="btn-primary px-4 py-2 rounded-lg text-sm">Add</button>
            </div>
            {zones.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {zones.map((z) => (
                  <span key={z} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-1 rounded-full capitalize">
                    {z}
                    <button type="button" onClick={() => removeZone(z)} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No delivery zones set — consumers won't find you in zone filters.</p>
            )}
          </div>

          <button type="submit" disabled={savingSettings} className="btn-primary px-6 py-2 rounded-lg disabled:opacity-50">
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
