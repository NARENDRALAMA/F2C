'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, ArrowLeft, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vegetables', 'Fruit', 'Dairy & Eggs', 'Meat'];
const MEAT_TYPES = ['Chicken', 'Lamb', 'Beef', 'Goat', 'Pork'];

const EMPTY_FORM = {
  name: '', description: '', price: '', unit: 'kg',
  stock: '', category: 'Vegetables', meatType: '', image: '',
};

const CATEGORY_COLORS = {
  Vegetables: 'bg-green-100 text-green-700',
  Fruit: 'bg-orange-100 text-orange-700',
  'Dairy & Eggs': 'bg-yellow-100 text-yellow-700',
  Meat: 'bg-red-100 text-red-700',
};

export default function FarmerProductsPage() {
  const router = useRouter();
  const { isFarmer, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const formRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isFarmer) router.push('/');
  }, [authLoading, isFarmer, router]);

  // Scroll to form after React renders it
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm, editingId]);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products/farmer/mine');
      setProducts(res.data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isFarmer) loadProducts(); }, [isFarmer]);

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const openAddForm = () => {
    setForm({ ...EMPTY_FORM, category: activeCategory === 'All' ? 'Vegetables' : activeCategory });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      unit: p.unit,
      stock: String(p.stock),
      category: p.category,
      meatType: p.meatType || '',
      image: p.image || '',
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleCategoryChange = (cat) => {
    setForm((f) => ({ ...f, category: cat, meatType: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.category === 'Meat' && !form.meatType) {
      toast.error('Please select a meat type');
      return;
    }
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (isNaN(price) || price < 0) { toast.error('Enter a valid price'); return; }
    if (isNaN(stock) || stock < 0) { toast.error('Enter a valid stock number'); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        unit: form.unit.trim(),
        stock,
        category: form.category,
        meatType: form.category === 'Meat' ? form.meatType : '',
        image: form.image.trim(),
      };
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

  const toggleAvailability = async (p) => {
    try {
      await api.put(`/products/${p._id}`, {
        name: p.name,
        description: p.description,
        price: p.price,
        unit: p.unit,
        stock: p.stock,
        category: p.category,
        meatType: p.meatType || '',
        image: p.image || '',
        isAvailable: !p.isAvailable,
      });
      toast.success(p.isAvailable ? 'Hidden from store' : 'Visible in store');
      loadProducts();
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const allCategories = ['All', ...CATEGORIES];
  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  if (authLoading || loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/farmer/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
        </div>
        <button onClick={openAddForm} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div ref={formRef} className="card mb-6 scroll-mt-24">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="input-field"
                placeholder="e.g. Organic Tomatoes"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="input-field"
                placeholder="Describe the product, growing methods, taste, etc."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Price (AUD) *</label>
                <input
                  required type="number" step="0.01" min="0"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  className="input-field" placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit *</label>
                <input
                  required
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                  className="input-field" placeholder="kg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
                <input
                  required type="number" min="0"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                  className="input-field" placeholder="0"
                />
              </div>
            </div>

            {form.category === 'Meat' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meat Type *</label>
                <div className="flex gap-2 flex-wrap">
                  {MEAT_TYPES.map((m) => (
                    <button
                      key={m} type="button"
                      onClick={() => set('meatType', m)}
                      className={`py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                        form.meatType === m
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {!form.meatType && (
                  <p className="text-xs text-red-500 mt-1">Please select a meat type.</p>
                )}
              </div>
            )}

            <div className={form.category === 'Meat' ? '' : 'md:col-span-2'}>
              <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
              <input
                value={form.image}
                onChange={(e) => set('image', e.target.value)}
                className="input-field" placeholder="https://..."
              />
              {form.image && (
                <img
                  src={form.image} alt="preview"
                  className="mt-2 h-24 w-40 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>

            <div className="md:col-span-2 flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || (form.category === 'Meat' && !form.meatType)}
                className="btn-primary px-5 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button" onClick={closeForm}
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {allCategories.map((cat) => {
          const count = cat === 'All' ? products.length : products.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeCategory === cat
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
              }`}
            >
              {cat}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeCategory === cat ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">
            {activeCategory === 'All' ? 'No products yet' : `No ${activeCategory} products`}
          </p>
          <p className="text-sm mt-1">
            {activeCategory === 'All' ? 'Add your first product to start selling' : 'Try a different category or add one'}
          </p>
          {activeCategory === 'All' && (
            <button onClick={openAddForm} className="mt-4 text-sm text-green-600 hover:underline font-medium">
              + Add a product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p._id}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                editingId === p._id ? 'ring-2 ring-green-400 border-green-200' : 'border-gray-200'
              } ${!p.isAvailable ? 'opacity-60' : ''}`}
            >
              <div className="relative h-40 bg-gray-100">
                {p.image ? (
                  <img
                    src={p.image} alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-10 h-10" />
                  </div>
                )}
                <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[p.category] || 'bg-gray-100 text-gray-600'}`}>
                  {p.meatType || p.category}
                </span>
                {!p.isAvailable && (
                  <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium bg-gray-800 text-white">
                    Hidden
                  </span>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5 truncate">{p.name}</h3>
                <p className="text-xs text-gray-400 mb-2 line-clamp-1">{p.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-green-700 font-bold text-sm">
                    ${p.price.toFixed(2)}<span className="text-gray-400 font-normal">/{p.unit}</span>
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.stock > 10 ? 'bg-green-50 text-green-600'
                    : p.stock > 0 ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-red-50 text-red-600'
                  }`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(p)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => toggleAvailability(p)}
                    title={p.isAvailable ? 'Hide from store' : 'Show in store'}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-medium rounded-lg transition-colors ${
                      p.isAvailable
                        ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {p.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(p._id, p.name)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
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
