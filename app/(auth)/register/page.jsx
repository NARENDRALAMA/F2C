'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Leaf, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'consumer',
    phone: '',
    address: '',
    farmName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please log in.');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              {form.role === 'farmer' ? <Leaf className="w-8 h-8 text-white" /> : <UserCircle className="w-8 h-8 text-white" />}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join F2C as a {form.role}</p>

          <div className="mt-4 inline-flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setForm({ ...form, role: 'consumer' })}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${form.role === 'consumer' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'}`}>
              Consumer
            </button>
            <button onClick={() => setForm({ ...form, role: 'farmer' })}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${form.role === 'farmer' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'}`}>
              Farmer
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm *</label>
                <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="0412 345 678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="123 Pitt St, Sydney NSW 2000" />
            </div>
            {form.role === 'farmer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                <input required value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} className="input-field" placeholder="Green Valley Farm" />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 px-4 rounded-xl text-base font-semibold flex items-center justify-center hover:bg-green-700 transition-all disabled:opacity-60">
              {loading ? <Spinner size="sm" /> : (<>Create Account <ArrowRight className="ml-2 w-5 h-5" /></>)}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-green-600 hover:text-green-700">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
