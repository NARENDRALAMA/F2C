'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, MapPin, Package, MessageSquare, Search } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function FarmersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    api.get('/farmers')
      .then((r) => setFarmers(r.data.farmers || []))
      .catch(() => toast.error('Failed to load farmers'))
      .finally(() => setLoading(false));
  }, []);

  const startChat = async (farmerId, farmerName) => {
    if (!isAuthenticated) {
      toast.error('Please login to message farmers');
      router.push('/login');
      return;
    }
    setStarting(farmerId);
    try {
      const res = await api.post('/messages', {
        receiverId: farmerId,
        content: `Hi! I found your farm on F2C and wanted to connect.`,
      });
      router.push(`/messages/${res.data.conversationId}`);
    } catch {
      toast.error('Failed to start conversation');
    } finally {
      setStarting(null);
    }
  };

  const filtered = farmers.filter((f) => {
    const q = search.toLowerCase();
    return (
      !q ||
      f.farmName?.toLowerCase().includes(q) ||
      f.name?.toLowerCase().includes(q) ||
      f.suburb?.toLowerCase().includes(q)
    );
  });

  if (loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Our Farmers</h1>
        <p className="text-gray-600">Meet the local NSW farmers behind your fresh produce. Chat directly with them.</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by farm name or suburb..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <Leaf className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>{search ? 'No farmers match your search.' : 'No farmers registered yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f) => (
            <div key={f._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center relative">
                {f.avatar ? (
                  <img src={f.avatar} alt={f.farmName || f.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                ) : (
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-green-600 border-4 border-white shadow-lg">
                    {(f.farmName || f.name)?.[0]?.toUpperCase() || 'F'}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-0.5">{f.farmName || f.name}</h3>
                <p className="text-sm text-gray-500 mb-3">Run by {f.name}</p>

                {f.farmDescription && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{f.farmDescription}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-green-500" />
                    {f.productCount} products
                  </span>
                  {f.suburb && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-green-500" />
                      {f.suburb}
                    </span>
                  )}
                </div>

                {f.deliveryZones?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {f.deliveryZones.slice(0, 3).map((z) => (
                      <span key={z} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">{z}</span>
                    ))}
                    {f.deliveryZones.length > 3 && (
                      <span className="text-xs text-gray-400">+{f.deliveryZones.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/farmers/${f._id}`}
                    className="flex-1 text-center py-2 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    View Farm
                  </Link>
                  {user?._id !== f._id && (
                    <button
                      onClick={() => startChat(f._id, f.farmName || f.name)}
                      disabled={starting === f._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {starting === f._id ? 'Opening...' : 'Message'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
