'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.priceAtAdd, 0);

  if (loading && !cart) {
    return <p className="mx-auto max-w-4xl px-6 py-20 text-charcoal/50">Loading…</p>;
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-charcoal">Your cart is empty</h1>
        <Link href="/products" className="mt-6 inline-block text-emerald hover:underline">
          Continue shopping →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl text-charcoal">Your Cart</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.product._id} className="flex items-center gap-4 rounded-sm bg-parchment p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-parchment-dark">
              {typeof item.product.images?.[0]?.url === 'string' && item.product.images[0].url.trim() && (
                <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-display text-lg text-charcoal">{item.product.name}</h3>
              <p className="mt-1 font-mono text-sm text-charcoal/60">
                KES {item.priceAtAdd.toLocaleString()}
              </p>
            </div>

            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(item.product._id, Number(e.target.value))}
              className="w-16 rounded-sm border border-charcoal/15 px-2 py-1.5 text-center text-sm"
            />

            <button
              onClick={() => removeItem(item.product._id)}
              className="text-sm text-ember hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-charcoal/10 pt-6">
        <span className="font-display text-xl text-charcoal">Subtotal</span>
        <span className="font-mono text-xl text-charcoal">KES {subtotal.toLocaleString()}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block w-full rounded-sm bg-emerald px-6 py-3 text-center text-sm font-medium text-parchment hover:bg-emerald-light transition-colors"
      >
        Proceed to Checkout
      </Link>
    </section>
  );
}
