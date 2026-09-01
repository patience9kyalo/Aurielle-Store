'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/');
    } catch {
      // error is already captured in the store and rendered below
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl text-charcoal">Sign in</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />

        {error && <p className="text-sm text-ember">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-sm bg-emerald px-6 py-3 text-sm font-medium text-parchment hover:bg-emerald-light transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-charcoal/60">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-emerald hover:underline">
          Create one
        </Link>
      </p>
    </section>
  );
}
