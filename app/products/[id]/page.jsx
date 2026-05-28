'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Star, ArrowLeft, Minus, Plus, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated, isConsumer, user } = useAuth();
  const [sendingMsg, setSendingMsg] = useState(false);
  const [product, setProduct] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/feedback/product/${id}`),
        ]);
        setProduct(pRes.data.product);
        setFeedback(fRes.data.feedback);
      } catch (err) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`Added ${qty} × ${product.name} to cart`);
  };

  const handleMessageFarmer = async () => {
    if (!product?.farmer?._id) return;
    setSendingMsg(true);
    try {
      const res = await api.post('/messages', {
        receiverId: product.farmer._id,
        productId: id,
        content: `Hi! I'm interested in your product: ${product.name}`,
      });
      router.push(`/messages/${res.data.conversationId}`);
    } catch {
      toast.error('Failed to start conversation');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/feedback', { productId: id, ...reviewForm });
      toast.success('Review posted!');
      const fRes = await api.get(`/feedback/product/${id}`);
      setFeedback(fRes.data.feedback);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="py-20"><Spinner size="lg" /></div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const avgRating = feedback.length ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-green-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-96 object-cover" />
          ) : (
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-6xl">🌿</div>
          )}
        </div>

        <div>
          <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">
            by{' '}
            <Link href={`/farmers/${product.farmer?._id}`} className="font-medium text-gray-700 hover:text-green-600 underline underline-offset-2">
              {product.farmer?.farmName || product.farmer?.name}
            </Link>
          </p>

          {feedback.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-600">{avgRating.toFixed(1)} ({feedback.length} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-green-600">${product.price?.toFixed(2)}</span>
            <span className="text-gray-500">/ {product.unit}</span>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

          <div className="card mb-6">
            <p className="text-sm text-gray-500 mb-3">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">✓ In stock — {product.stock} {product.unit} available</span>
              ) : (
                <span className="text-red-600 font-medium">✗ Out of stock</span>
              )}
            </p>

            {product.stock > 0 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-50">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 hover:bg-gray-50">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button onClick={handleAddToCart}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                {isAuthenticated && user?._id !== product.farmer?._id && (
                  <button onClick={handleMessageFarmer} disabled={sendingMsg}
                    className="w-full mt-2 border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                    <MessageSquare className="w-5 h-5" /> {sendingMsg ? 'Opening chat...' : 'Message Farmer'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-green-600" /> Reviews ({feedback.length})
        </h2>

        {isAuthenticated && isConsumer && (
          <div className="card mb-8">
            <h3 className="font-semibold mb-4">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button type="button" key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                      <Star className={`w-7 h-7 ${s <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea required rows={3} value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input-field" placeholder="Share your experience..." />
              </div>
              <button disabled={submittingReview} className="btn-primary px-6 py-2 rounded-lg disabled:opacity-50">
                {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
              <p className="text-xs text-gray-500">Note: You can only review products from delivered orders.</p>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {feedback.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No reviews yet — be the first!</div>
          ) : (
            feedback.map((f) => (
              <div key={f._id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-700">
                      {f.consumer?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{f.consumer?.name || 'Anonymous'}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= f.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 mt-2">{f.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
