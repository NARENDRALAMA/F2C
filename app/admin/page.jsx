'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Package, ShoppingBag, DollarSign, Plus, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vegetables', 'Fruit', 'Dairy & Eggs', 'Meat'];
const MEAT_TYPES = ['Chicken', 'Lamb', 'Beef', 'Goat', 'Pork'];
const EMPTY_FORM = { name: '', description: '', price: '', unit: 'kg', stock: '', category: 'Vegetables', meatType: '', image: '', farmerId: '' };

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [authLoading, isAdmin, router]);

  const loadAll = async () => {
    try {
      const [s, u, p, o] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/products'),
        api.get('/admin/orders'),
      ]);
      setStats(s.data.stats);
      setUsers(u.data.users);
      setProducts(p.data.products);
      setOrders(o.data.orders);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAll();
      api.get('/admin/users').then((res) => setFarmers((res.data.users || []).filter((u) => u.role === 'farmer'))).catch(() => {});
    }
  }, [isAdmin]);

  const toggleUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      toast.success('User updated');
      loadAll();
    } catch {
      toast.error('Failed');
    }
  };

  const openAddForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };
  const openEditForm = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price.toString(), unit: p.unit, stock: p.stock.toString(), category: p.category, meatType: p.meatType || '', image: p.image || '', farmerId: p.farmer?._id || '' });
    setEditingId(p._id);
    setShowForm(true);
  };
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!form.farmerId) { toast.error('Please select a farmer'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), meatType: form.category === 'Meat' ? form.meatType : '' };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product added');
      }
      setShowForm(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteProduct = async (id) => {
    if (!confirm('Remove this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed');
      loadAll();
    } catch { toast.error('Delete failed'); }
  };

  if (authLoading || loading) return <Spinner className="py-20" size="lg" />;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-green-100 text-green-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage users, products, and orders across the platform.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {['users', 'products', 'orders'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 border-b-2 transition-colors capitalize ${tab === t ? 'border-green-600 text-green-600 font-medium' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-left text-gray-600">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{u.name}</td>
                  <td className="py-3 px-3">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'farmer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {u.role !== 'admin' && (
                      <button onClick={() => toggleUser(u._id)}
                        className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{products.length} products</span>
            <button onClick={openAddForm} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {showForm && (
            <div className="card space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Farmer *</label>
                  <select required value={form.farmerId} onChange={(e) => setForm({ ...form, farmerId: e.target.value })} className="input-field">
                    <option value="">Select a farmer...</option>
                    {farmers.map((f) => <option key={f._id} value={f._id}>{f.farmName || f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (AUD) *</label>
                    <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                    <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field" placeholder="kg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                    <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, meatType: '' })} className="input-field">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {form.category === 'Meat' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meat Type *</label>
                    <div className="flex gap-2 flex-wrap">
                      {MEAT_TYPES.map((m) => (
                        <button key={m} type="button" onClick={() => setForm({ ...form, meatType: m })}
                          className={`py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors ${form.meatType === m ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" placeholder="https://..." />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={saving} className="btn-primary px-5 py-2 rounded-lg disabled:opacity-50 text-sm">
                    {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-gray-600">
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Farmer</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Price</th>
                  <th className="py-2 px-3">Stock</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{p.name}</td>
                    <td className="py-3 px-3">{p.farmer?.farmName || p.farmer?.name}</td>
                    <td className="py-3 px-3">{p.category}</td>
                    <td className="py-3 px-3">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-3">{p.stock}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.isAvailable ? 'Available' : 'Removed'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right flex justify-end gap-1">
                      <button onClick={() => openEditForm(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-left text-gray-600">
                <th className="py-2 px-3">Order #</th>
                <th className="py-2 px-3">Consumer</th>
                <th className="py-2 px-3">Total</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Payment</th>
                <th className="py-2 px-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 px-3">{o.consumer?.name}</td>
                  <td className="py-3 px-3">${o.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-1 rounded-full badge-status-${o.status}`}>{o.status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
