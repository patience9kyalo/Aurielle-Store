'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/products')
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-gold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-sm bg-emerald px-4 py-2 text-sm font-medium text-parchment hover:bg-emerald-light transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-sm bg-parchment">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-widest text-charcoal/50">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-4 py-3 text-charcoal">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-charcoal/70">
                    KES {(p.discountPrice || p.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? 'text-ember' : 'text-charcoal/70'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p._id}/edit`} className="mr-4 text-emerald hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(p._id)} className="text-ember hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
