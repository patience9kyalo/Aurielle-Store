'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function ProductCard({ product }) {
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isSaved } = useWishlistStore();
  const [adding, setAdding] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const saved = isSaved(product._id);

  const price = product.discountPrice || product.price;
  const rawImage = product.images?.[0]?.url;
  const image = typeof rawImage === 'string' ? rawImage.trim() || null : null;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(product._id, 1);
    } catch {
      // errors are surfaced via the cart store's error state elsewhere;
      // swallow here so a failed add doesn't crash the card
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    setSavingWishlist(true);
    try {
      if (saved) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch {
      // not logged in, or a transient error - fail quietly on the card
    } finally {
      setSavingWishlist(false);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-sm bg-parchment">
      <Link href={`/products/${product._id}`}>
        <div
          className="relative aspect-square cursor-zoom-in overflow-hidden bg-parchment-dark"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onMouseMove={handleMouseMove}
        >
          {image ? (
            <Image src={image} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-charcoal/30 font-body text-sm">
              No image
            </div>
          )}

          {/* Loupe: a brass-ringed circular magnifier that follows the cursor */}
          {hovering && image && (
            <div
              className="pointer-events-none absolute h-32 w-32 rounded-full border-2 border-gold shadow-lg"
              style={{
                left: `${zoomPos.x}%`,
                top: `${zoomPos.y}%`,
                transform: 'translate(-50%, -50%)',
                backgroundImage: `url(${image})`,
                backgroundSize: '250%',
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          )}

          {product.stock === 0 && (
            <span className="absolute left-3 top-3 rounded-sm bg-charcoal/80 px-2 py-1 text-xs text-parchment">
              Sold out
            </span>
          )}

          <button
            onClick={(e) => {
              e.preventDefault(); // don't navigate to the product page
              handleToggleWishlist();
            }}
            disabled={savingWishlist}
            aria-label={saved ? 'Saved to wishlist' : 'Save to wishlist'}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal/60 text-parchment backdrop-blur-sm transition-colors hover:bg-charcoal/80 disabled:opacity-50"
          >
            {saved ? '♥' : '♡'}
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-display text-lg leading-snug text-charcoal hover:text-emerald transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="font-mono text-sm">
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

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="rounded-sm bg-emerald px-3 py-1.5 text-xs font-medium text-parchment transition-colors hover:bg-emerald-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            {adding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}