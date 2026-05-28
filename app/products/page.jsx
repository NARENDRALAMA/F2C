'use client';
import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import Spinner from '@/components/Spinner';
import { useAuth } from '@/context/AuthContext';
import { MapPin } from 'lucide-react';

const CATEGORIES = ['All', 'Vegetables', 'Fruit', 'Dairy & Eggs', 'Meat'];
const MEAT_TYPES = ['All', 'Chicken', 'Lamb', 'Beef', 'Goat', 'Pork'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function ProductsBrowse() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const { isAuthenticated, user, isConsumer, isAdmin, isFarmer } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [meatType, setMeatType] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [deliverToMe, setDeliverToMe] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (categoryFromUrl && CATEGORIES.includes(categoryFromUrl)) {
      setCategory(categoryFromUrl);
      setPage(1);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { category, search, sort, page, limit: 12 };
        if (category === 'Meat' && meatType !== 'All') params.meatType = meatType;
        if (deliverToMe && user?.suburb) params.suburb = user.suburb;
        const res = await api.get('/products', { params });
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, meatType, search, sort, page, deliverToMe, user?.suburb]);

  const handleCategoryChange = (c) => {
    setCategory(c);
    setMeatType('All');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Browse Products</h1>
          <p className="text-gray-600">Fresh from local NSW farmers — straight to your door.</p>
        </div>
        {isAdmin && (
          <Link
            href="/products/add"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        )}
        {isFarmer && (
          <Link
            href="/farmer/products"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> My Products
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="card sticky top-20 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center"><Filter className="w-4 h-4 mr-2" /> Filters</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => handleCategoryChange(c)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {isAuthenticated && isConsumer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-green-600" /> Delivery
                </label>
                {user?.suburb ? (
                  <button
                    onClick={() => { setDeliverToMe(!deliverToMe); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border ${deliverToMe ? 'bg-green-100 text-green-700 border-green-300 font-medium' : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                  >
                    {deliverToMe ? `Delivering to ${user.suburb}` : `Delivers to ${user.suburb}`}
                  </button>
                ) : (
                  <p className="text-xs text-gray-400">Set your suburb in your profile to filter by delivery zone.</p>
                )}
              </div>
            )}

            {category === 'Meat' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meat Type</label>
                <div className="space-y-2">
                  {MEAT_TYPES.map((m) => (
                    <button key={m} onClick={() => { setMeatType(m); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${meatType === m ? 'bg-red-100 text-red-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search products..."
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Showing {products.length} of {pagination.total} products
          </p>

          {loading ? (
            <Spinner className="py-20" size="lg" />
          ) : products.length === 0 ? (
            <div className="card text-center py-16 space-y-3">
              <p className="text-gray-700 font-medium">
                {pagination.total === 0
                  ? 'No products in the database yet.'
                  : 'No products match your filters.'}
              </p>
              {pagination.total === 0 && (
                <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  Start MongoDB, copy <code className="bg-gray-100 px-1 rounded text-xs">.env.local.example</code> to{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs">.env.local</code>, then run{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs">npm run seed</code> to load sample data.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${page === i + 1 ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Spinner className="py-20" size="lg" />}>
      <ProductsBrowse />
    </Suspense>
  );
}
