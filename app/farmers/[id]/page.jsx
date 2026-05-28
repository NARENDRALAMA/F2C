'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, MapPin, Phone, MessageSquare, Package } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function FarmerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [msgText, setMsgText] = useState('');

  useEffect(() => {
    api.get(`/farmers/${id}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load farmer profile'))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setMessaging(true);
    try {
      const res = await api.post('/messages', { receiverId: id, content: msgText });
      toast.success('Message sent!');
      setMsgText('');
      router.push(`/messages/${res.data.conversationId}`);
    } catch {
      toast.error('Failed to send message');
    } finally {
      setMessaging(false);
    }
  };

  if (loading) return <Spinner className="py-20" size="lg" />;
  if (!data) return <div className="text-center py-20">Farmer not found</div>;

  const { farmer, products, stats } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-green-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Farmer info card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-4">
            {farmer.avatar ? (
              <img src={farmer.avatar} alt={farmer.name} className="w-16 h-16 rounded-full object-cover border-2 border-green-100" />
            ) : (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
                {farmer.name?.[0] || 'F'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{farmer.farmName || farmer.name}</h1>
              <p className="text-sm text-gray-500">Run by {farmer.name}</p>
            </div>
          </div>

          {farmer.farmDescription && (
            <p className="text-gray-700 text-sm leading-relaxed">{farmer.farmDescription}</p>
          )}

          <div className="flex gap-6 text-center pt-2 border-t border-gray-100">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.productCount}</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.reviewCount}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-green-600">{stats.avgRating.toFixed(1)}</p>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </div>

          {farmer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-green-600" /> {farmer.phone}
            </div>
          )}
          {farmer.suburb && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-green-600" /> Based in {farmer.suburb}
            </div>
          )}
          {farmer.deliveryZones?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Delivers to:</p>
              <div className="flex flex-wrap gap-1">
                {farmer.deliveryZones.map((z) => (
                  <span key={z} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">{z}</span>
                ))}
              </div>
            </div>
          )}

          {isAuthenticated && user?._id !== id && (
            <form onSubmit={sendMessage} className="pt-2 border-t border-gray-100 space-y-2">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-green-600" /> Message this farmer
              </p>
              <textarea
                rows={2} value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                className="input-field text-sm" placeholder="Ask about availability, orders..."
              />
              <button type="submit" disabled={messaging || !msgText.trim()} className="btn-primary w-full py-2 rounded-lg text-sm disabled:opacity-50">
                {messaging ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Products grid */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" /> Products ({products.length})
          </h2>
          {products.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">No products available right now.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
