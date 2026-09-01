'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
];

export default function AdminLayout({ children }) {
  const { user, hydrate } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    hydrate();
    setChecked(true);
  }, [hydrate]);

  useEffect(() => {
    if (checked && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [checked, user, router]);

  if (!checked || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-center text-parchment/50">
        Checking access…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-sm px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-gold text-emerald-dark'
                      : 'text-parchment/60 hover:bg-parchment/10 hover:text-parchment'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}