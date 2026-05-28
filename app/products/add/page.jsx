'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vegetables', 'Fruit', 'Dairy & Eggs', 'Meat'];
const MEAT_TYPES = ['Chicken', 'Lamb', 'Beef', 'Goat', 'Pork'];

const EMPTY_FORM = {
  name: '', description: '', price: '', unit: 'kg',
  stock: '', category: 'Vegetables', meatType: '', image: '', farmerId: '',
};

export default function AddProductPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [farmers, setFarmers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/admin/users').then((res) => {
        setFarmers((res.data.users || []).filter((u) => u.role === 'farmer'));
      }).catch(() => {});
    }
  }, [isAdmin]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.farmerId) { toast.error('Please select a farmer'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        meatType: form.category === 'Meat' ? form.meatType : '',
      };
      await api.post('/products', payload);
      toast.success('Product added successfully!');
      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Admin
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Add a Product</h1>
      <p className="text-gray-600 mb-8">List a new product on the F2C marketplace.</p>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Farmer *</label>
          <select required value={form.farmerId} onChange={(e) => set('farmerId', e.target.value)} className="input-field">
            <option value="">Select a farmer...</option>
            {farmers.map((f) => (
              <option key={f._id} value={f._id}>{f.farmName || f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            required value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="input-field" placeholder="e.g. Organic Free-Range Chicken"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            required rows={3} value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="input-field" placeholder="Describe the product..."
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (AUD) *</label>
            <input
              required type="number" step="0.01" min="0" value={form.price}
              onChange={(e) => set('price', e.target.value)}
              className="input-field" placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
            <input
              required value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              className="input-field" placeholder="kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input
              required type="number" min="0" value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
              className="input-field" placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {form.category === 'Meat' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meat Type *</label>
            <div className="grid grid-cols-5 gap-2">
              {MEAT_TYPES.map((m) => (
                <button
                  key={m} type="button"
                  onClick={() => set('meatType', m)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.meatType === m
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:text-red-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {form.category === 'Meat' && !form.meatType && (
              <p className="text-xs text-red-500 mt-1">Please select a meat type.</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            value={form.image}
            onChange={(e) => set('image', e.target.value)}
            className="input-field" placeholder="https://..."
          />
          {form.image && (
            <img
              src={form.image} alt="preview"
              className="mt-2 h-32 w-full object-cover rounded-lg border border-gray-200"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || (form.category === 'Meat' && !form.meatType)}
            className="btn-primary px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
          <Link href="/admin" className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
