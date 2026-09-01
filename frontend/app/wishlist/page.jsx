'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlistStore } from '@/store/wishlistStore';

export default function WishlistPage() {
  const { wishlist, loading, fetchWishlist, removeItem, moveToCart } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const items = wishlist?.items || [];

  if (loading && !wishlist) {
    return <p className="mx-auto max-w-4xl px-6 py-20 text-charcoal/50">Loading…</p>;
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-charcoal">Your wishlist is empty</h1>
        <Link href="/products" className="mt-6 inline-block text-emerald hover:underline">
          Browse products →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl text-charcoal">Your Wishlist</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const image = item.product.images?.[0]?.url;
          const price = item.product.discountPrice || item.product.price;

          return (
            <div key={item.product._id} className="flex items-center gap-4 rounded-sm bg-parchment p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-parchment-dark">
                {typeof image === 'string' && image.trim() && (
                  <Image src={image} alt={item.product.name} fill className="object-cover" />
                )}
              </div>

              <div className="flex-1">
                <Link href={`/products/${item.product._id}`}>
                  <h3 className="font-display text-lg text-charcoal hover:text-emerald transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="mt-1 font-mono text-sm text-charcoal/60">
                  KES {price.toLocaleString()}
                  {item.product.stock === 0 && <span className="ml-2 text-ember">Out of stock</span>}
                </p>
              </div>

              <button
                onClick={() => moveToCart(item.product._id)}
                disabled={item.product.stock === 0}
                className="rounded-sm bg-emerald px-4 py-2 text-xs font-medium text-parchment transition-colors hover:bg-emerald-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                Move to Cart
              </button>

              <button
                onClick={() => removeItem(item.product._id)}
                className="text-sm text-ember hover:underline"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}