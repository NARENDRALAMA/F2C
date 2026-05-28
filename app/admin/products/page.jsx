'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Vegetables', 'Fruit', 'Dairy & Eggs', 'Meat'];
const MEAT_TYPES = ['All', 'Chicken', 'Lamb', 'Beef', 'Goat', 'Pork'];
const EMPTY_FORM = { name: '', description: '', price: '', unit: 'kg', stock: '', category: 'Vegetables', meatType: '', image: '', farmerId: '' };

const CATEGORY_COLORS = {
  Vegetables: 'bg-green-100 text-green-700',
  Fruit: 'bg-orange-100 text-orange-700',
  'Dairy & Eggs': 'bg-yellow-100 text-yellow-700',
  Meat: 'bg-red-100 text-red-700',
};

export default function ManageProductsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMeatType, setActiveMeatType] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [authLoading, isAdmin, router]);

  const loadProducts = async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/users'),
      ]);
      setProducts(pRes.data.products || []);
      setFarmers((uRes.data.users || []).filter((u) => u.role === 'farmer'));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) loadProducts(); }, [isAdmin]);

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const openAddForm = () => {
    const defaultCat = activeCategory === 'All' ? 'Vegetables' : activeCategory;
    setForm({ ...EMPTY_FORM, category: defaultCat });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setForm({
      name: p.name, description: p.description,
      price: p.price.toString(), unit: p.unit,
      stock: p.stock.toString(), category: p.category,
      meatType: p.meatType || '', image: p.image || '',
      farmerId: p.farmer?._id || '',
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.farmerId) { toast.error('Please select a farmer'); return; }
    if (form.category === 'Meat' && !form.meatType) { toast.error('Please select a meat type'); return; }
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
      closeForm();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}" permanently?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch {
      toast.error('Delete failed');
    }
  };

  // Filter products by active category and meat type
  const filtered = products.filter((p) => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (activeCategory === 'Meat' && activeMeatType !== 'All' && p.meatType !== activeMeatType) return false;
    return true;
  });

  // Count per category
  const countFor = (cat) => cat === 'All' ? products.length : products.filter((p) => p.category === cat).length;
  const countForMeat = (mt) => mt === 'All' ? products.filter(p => p.category === 'Meat').length : products.filter(p => p.meatType === mt).length;

  if (authLoading || loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={openAddForm} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setActiveMeatType('All'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              activeCategory === cat
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
            }`}>
            {cat}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeCategory === cat ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {countFor(cat)}
            </span>
          </button>
        ))}
      </div>

      {/* Meat type sub-filter */}
      {activeCategory === 'Meat' && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          {MEAT_TYPES.map((mt) => (
            <button key={mt} onClick={() => setActiveMeatType(mt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                activeMeatType === mt
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-400 hover:text-red-600'
              }`}>
              {mt}
              <span className={`text-xs px-1 py-0.5 rounded-full font-bold ${activeMeatType === mt ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {countForMeat(mt)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Farmer *</label>
              <select required value={form.farmerId} onChange={(e) => setForm({ ...form, farmerId: e.target.value })} className="input-field">
                <option value="">Select farmer...</option>
                {farmers.map((f) => <option key={f._id} value={f._id}>{f.farmName || f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. Organic Tomatoes" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
              <textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Describe the product..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Price (AUD) *</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit *</label>
                <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field" placeholder="kg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
                <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, meatType: '' })} className="input-field">
                {CATEGORIES.filter(c => c !== 'All').map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            {form.category === 'Meat' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Meat Type *</label>
                <div className="flex gap-2 flex-wrap">
                  {MEAT_TYPES.filter(m => m !== 'All').map((m) => (
                    <button key={m} type="button" onClick={() => setForm({ ...form, meatType: m })}
                      className={`py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors ${form.meatType === m ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" placeholder="https://..." />
              {form.image && (
                <img src={form.image} alt="preview" className="mt-2 h-24 w-40 object-cover rounded-lg border border-gray-200" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
            <div className="md:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={closeForm} className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Product Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No products in this category.</p>
          <button onClick={openAddForm} className="mt-3 text-sm text-green-600 hover:underline">Add one now</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p._id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${editingId === p._id ? 'ring-2 ring-blue-400' : ''}`}>
              {/* Image */}
              <div className="relative h-40 bg-gray-100">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-10 h-10" /></div>
                )}
                {/* Category badge */}
                <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-600'}`}>
                  {p.meatType || p.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">{p.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{p.farmer?.farmName || p.farmer?.name}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-green-700 font-bold text-sm">${p.price.toFixed(2)}<span className="text-gray-400 font-normal">/{p.unit}</span></span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.stock > 10 ? 'bg-green-50 text-green-600' : p.stock > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditForm(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p._id, p.name)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
