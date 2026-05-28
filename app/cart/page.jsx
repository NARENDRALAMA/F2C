'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const deliveryFee = items.length ? 5 : 0;
  const total = totalPrice + deliveryFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Browse our fresh produce to add items.</p>
        <Link href="/products" className="btn-primary inline-flex px-6 py-3 rounded-xl">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart ({totalItems} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const id = item._id || item.id;
            return (
              <div key={id} className="card flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">${item.price?.toFixed(2)} / {item.unit}</p>
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => updateQuantity(id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button onClick={() => removeFromCart(id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="card sticky top-20 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal ({totalItems} items)</span><span className="font-medium">${totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Delivery fee</span><span className="font-medium">${deliveryFee.toFixed(2)}</span></div>
          </div>
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-green-600">${total.toFixed(2)}</span></div>
          </div>
          <button onClick={handleCheckout}
            className="w-full btn-primary py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2">
            Proceed to Checkout <ArrowRight className="w-5 h-5" />
          </button>
          <Link href="/products" className="block text-center text-sm text-green-600 hover:text-green-700 mt-3">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
