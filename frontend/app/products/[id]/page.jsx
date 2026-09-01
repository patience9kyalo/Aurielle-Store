'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    api
      .get(`/products/${id}`, { auth: false })
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="mx-auto max-w-7xl px-6 py-20 text-charcoal/50">Loading…</p>;
  if (!product) return <p className="mx-auto max-w-7xl px-6 py-20 text-charcoal/50">Product not found.</p>;

  const price = product.discountPrice || product.price;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(product._id, 1);
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-parchment">
          {typeof product.images?.[0]?.url === 'string' && product.images[0].url.trim() && (
            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl text-charcoal">{product.name}</h1>

          <div className="mt-4 font-mono text-lg">
            {product.discountPrice ? (
              <>
                <span className="text-ember">KES {price.toLocaleString()}</span>{' '}
                <span className="text-charcoal/40 line-through">
                  KES {product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-charcoal">KES {price.toLocaleString()}</span>
            )}
          </div>

          <p className="mt-6 text-charcoal/70">{product.description}</p>

          <p className="mt-4 text-sm text-charcoal/50">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="mt-8 rounded-sm bg-emerald px-8 py-3 text-sm font-medium text-parchment hover:bg-emerald-light transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {adding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </section>
  );
}
