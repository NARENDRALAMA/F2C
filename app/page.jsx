import Link from 'next/link';
import { ArrowRight, CheckCircle, Truck, Shield, Leaf, Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

/** Avoid build-time / self-HTTP fetch issues; load featured items straight from MongoDB. */
export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  try {
    await dbConnect();
    const products = await Product.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('farmer', 'name farmName')
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

const testimonials = [
  { id: 1, name: 'Emily Chen', location: 'Sydney CBD', rating: 5, text: 'The quality of produce from these local farmers is incredible! Everything is so fresh. I love knowing exactly where my food comes from.' },
  { id: 2, name: 'Michael Rodriguez', location: 'Newtown', rating: 5, text: 'As a chef, I demand the highest quality. This platform connects me directly with farmers who share my commitment to excellence.' },
  { id: 3, name: 'Sarah Thompson', location: 'Bondi', rating: 5, text: 'Supporting local NSW farmers while getting the freshest produce — it\'s a win-win! The transparency is amazing.' },
];

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-50 to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
                🌱 NSW Farm Fresh
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Fresh From the <span className="text-green-600">Farm</span> to Your Door
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect directly with local NSW farmers. Get the freshest produce delivered to your doorstep in Sydney — no middlemen, maximum freshness, fair prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="btn-primary inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105">
                  Browse Products <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/register?role=farmer" className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200">
                  Register as Farmer
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> No middlemen</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Same-day harvest</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Fair to farmers</div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop"
                alt="Fresh vegetables from NSW farm"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-emerald-100 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why F2C */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose F2C?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Committed to freshness, transparency, and supporting local agriculture.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: 'Farm Fresh', desc: 'Direct from local NSW farms — no cold storage, no supermarket delays. Peak freshness guaranteed.' },
              { icon: Shield, title: 'Support Local Farmers', desc: 'Farmers keep a fair share of every sale. Your purchase directly supports NSW farming families.' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Same-day or next-day delivery to Sydney suburbs. Fresh from field to door.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center group p-6 rounded-2xl hover:bg-green-50 transition-colors duration-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6 group-hover:bg-green-200 transition-colors">
                  <Icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products — section always visible so the page layout stays consistent when DB is empty */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Freshest picks from our NSW farmers</p>
            </div>
            <Link href="/products" className="btn-secondary px-5 py-2 rounded-lg text-sm font-medium hidden sm:block">
              View All
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="text-center mt-8 sm:hidden">
                <Link href="/products" className="btn-secondary px-6 py-3 rounded-xl text-sm font-medium">View All Products</Link>
              </div>
            </>
          ) : (
            <div className="card text-center py-14 max-w-xl mx-auto">
              <p className="text-gray-700 font-medium mb-2">No products loaded yet</p>
              <p className="text-sm text-gray-500 mb-6">
                Start MongoDB, run <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">npm run seed</code>, then refresh — or browse{' '}
                <Link href="/products" className="text-green-600 font-medium hover:underline">all products</Link>.
              </p>
              <Link href="/products" className="btn-primary inline-block">Go to product catalogue</Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Getting farm-fresh produce has never been easier</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Farmers List Products', desc: 'Local NSW farmers upload fresh produce daily with real-time stock counts.' },
              { step: '2', title: 'Consumers Order', desc: 'Browse, select, and securely checkout with Stripe payment integration.' },
              { step: '3', title: 'Fresh Delivered', desc: 'Your order is packed and delivered same-day or next-day to your door.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full text-2xl font-bold mb-6 shadow-lg">
                  {step}
                </div>
                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-green-200"></div>}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-700 mr-3">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Experience Farm Fresh?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Sydney consumers getting the freshest NSW produce delivered to their door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="bg-white text-green-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center">
              Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/register?role=farmer" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center">
              Become a Farmer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
