'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const category = searchParams.get('category');
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category) params.set('category', category);

      const path = query || category ? `/products/search?${params}` : '/products';
      const data = await api.get(path, { auth: false });
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl text-charcoal">Shop</h1>
        <input
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-sm border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald sm:w-72"
        />
      </div>

      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-charcoal/50">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

// 2. Export the main page wrapped in Suspense so Next.js compiles it
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-charcoal/50">Loading shop layout…</p>
      </section>
    }>
      <ProductsContent />
    </Suspense>
  );
}
