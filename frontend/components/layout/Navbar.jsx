'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function Navbar() {
  const { cart, fetchCart } = useCartStore();
  const { user, hydrate, logout } = useAuthStore();
  const { wishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    }
  }, [user, fetchCart, fetchWishlist]);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const wishlistCount = wishlist?.items?.length ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-black text-parchment">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl tracking-wide">
          Aurielle
        </Link>

        <nav className="hidden gap-8 font-body text-sm md:flex">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <Link href="/products" className="hover:text-gold transition-colors">Shop</Link>
          <Link href="/orders" className="hover:text-gold transition-colors">Orders</Link>
        </nav>

        <div className="flex items-center gap-5 font-body text-sm">
          <Link href="/wishlist" className="relative hover:text-gold transition-colors">
            Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-mono text-emerald-dark">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative hover:text-gold transition-colors">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-mono text-emerald-dark">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <button onClick={logout} className="hover:text-gold transition-colors">
              Sign out
            </button>
          ) : (
            <Link href="/login" className="hover:text-gold transition-colors">
              Sign in
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link href="/admin" className="text-gold hover:underline">
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}