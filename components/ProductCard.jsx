'use client';
import Link from 'next/link';
import { ShoppingCart, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Vegetables: 'bg-green-100 text-green-700',
  Fruit: 'bg-orange-100 text-orange-700',
  'Dairy & Eggs': 'bg-yellow-100 text-yellow-700',
  Meat: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-700',
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const id = product._id || product.id;
  const stock = product.stock ?? product.stockQuantity ?? 0;
  const isAvailable = product.isAvailable !== false && stock > 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!isAvailable) return;
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const stockBadge = stock === 0
    ? { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' }
    : stock < 10
    ? { label: `Low Stock (${stock})`, cls: 'bg-orange-100 text-orange-700' }
    : { label: 'In Stock', cls: 'bg-green-100 text-green-700' };

  const farmerName = product.farmer?.farmName || product.farmer?.name || product.farmerName || '';
  const farmerId = product.farmer?._id || product.farmer?.id;

  return (
    <Link href={`/products/${id}`} className="group block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-700'}`}>
            {product.category}
          </span>
          {product.meatType && (
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-700 text-white">
              {product.meatType}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {farmerName && (
          <Link
            href={farmerId ? `/farmers/${farmerId}` : '#'}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-green-600 hover:underline mb-1 block"
          >
            {farmerName}
          </Link>
        )}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-green-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-green-600">
            ${product.price?.toFixed(2)}
            <span className="text-xs text-gray-500 font-normal"> /{product.unit}</span>
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockBadge.cls}`}>
            {stockBadge.label}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!isAvailable}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <ShoppingCart className="w-4 h-4" />
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
