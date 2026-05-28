'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
      iconColor: '#16a34a',
    },
    invalid: { color: '#dc2626', iconColor: '#dc2626' },
  },
};

function CheckoutForm({ items, totalPrice, clearCart, user }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [form, setForm] = useState({ deliveryAddress: user?.address || '', notes: '' });
  const [processing, setProcessing] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const deliveryFee = items.length ? 5 : 0;
  const total = totalPrice + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error('Stripe is still loading. Please wait.');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ product: i._id || i.id, quantity: i.quantity })),
        deliveryAddress: form.deliveryAddress,
        notes: form.notes,
      });

      const { order, clientSecret } = res.data;

      if (clientSecret) {
        const cardElement = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.name || '',
              email: user?.email || '',
            },
          },
        });

        if (error) {
          toast.error(error.message || 'Card payment failed');
          setProcessing(false);
          return;
        }

        if (paymentIntent.status === 'succeeded') {
          await api.post('/payments/confirm', {
            orderId: order._id,
            paymentIntentId: paymentIntent.id,
          });
        }
      } else {
        // No Stripe key configured — auto-confirm (demo fallback)
        await api.post('/payments/confirm', { orderId: order._id });
      }

      clearCart();
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Delivery Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  className="input-field"
                  placeholder="Street, suburb, postcode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field"
                  placeholder="Special instructions, leave at door, etc."
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" /> Payment
            </h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
              <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-colors">
                <CardElement
                  options={CARD_ELEMENT_OPTIONS}
                  onReady={() => setCardReady(true)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Payments are secured and encrypted by Stripe. Use test card <strong>4242 4242 4242 4242</strong> with any future expiry and any CVC.</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card sticky top-20 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 text-sm max-h-48 overflow-auto">
            {items.map((i) => (
              <div key={i._id || i.id} className="flex justify-between gap-2">
                <span className="text-gray-600 truncate">{i.name} × {i.quantity}</span>
                <span className="font-medium shrink-0">${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 mt-2">
              <span>Total</span>
              <span className="text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing || !stripe || !cardReady}
            className="w-full btn-primary mt-6 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {processing ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Lock className="w-4 h-4" /> Pay ${total.toFixed(2)}
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Secured by <span className="font-semibold text-gray-500">Stripe</span>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (!authLoading && isAuthenticated && items.length === 0) router.push('/cart');
  }, [authLoading, isAuthenticated, items.length, router]);

  if (authLoading || !isAuthenticated || items.length === 0) {
    return <Spinner className="py-20" size="lg" />;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        items={items}
        totalPrice={totalPrice}
        clearCart={clearCart}
        user={user}
      />
    </Elements>
  );
}
