import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">F2C<span className="text-green-400">.</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Connecting NSW farmers directly with Sydney consumers. Fresh produce, fair prices, zero middlemen.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-green-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-green-400 transition-colors">Products</Link></li>
              <li><Link href="/register" className="hover:text-green-400 transition-colors">Join as Farmer</Link></li>
              <li><Link href="/login" className="hover:text-green-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {['Vegetables', 'Fruit', 'Dairy & Eggs', 'Meat', 'Other'].map((c) => (
                <li key={c}>
                  <Link href={`/products?category=${c}`} className="hover:text-green-400 transition-colors">{c}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-gray-500 text-center">
          © 2026 Farmers-to-Consumers. All rights reserved. | ITSU3008 — Samir Paudel (58252), Kazi Wasif Muhammad (53923), Zain Tanveer (59678)
        </div>
      </div>
    </footer>
  );
}
