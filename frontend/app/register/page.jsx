'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password, form.phone);
      router.push('/');
    } catch {
      // error is already captured in the store and rendered below
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl text-charcoal">Create an account</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />
        <input
          placeholder="Phone (e.g. 0712345678)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password (min. 8 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />

        {error && <p className="text-sm text-ember">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-sm bg-emerald px-6 py-3 text-sm font-medium text-parchment hover:bg-emerald-light transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-charcoal/60">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
