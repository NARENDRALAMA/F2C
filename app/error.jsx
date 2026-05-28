'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
      <p className="text-gray-600 mb-8">
        The page hit an error. Your navigation and layout should still work — try again or go home.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="btn-primary px-6 py-3 rounded-xl"
        >
          Try again
        </button>
        <Link href="/" className="btn-secondary px-6 py-3 rounded-xl text-center">
          Home
        </Link>
        <Link href="/products" className="btn-secondary px-6 py-3 rounded-xl text-center">
          Products
        </Link>
      </div>
    </div>
  );
}
