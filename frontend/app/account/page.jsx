'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AccountPage() {
  const { user, hydrate, logout, updateProfile, loading, error } = useAuthStore();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', password: '' });
    }
  }, [user]);

  if (!user) {
    return (
      <section className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-charcoal/60">Please sign in to view your account.</p>
      </section>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      // Only send password if the user actually typed a new one
      const updates = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) updates.password = form.password;

      await updateProfile(updates);
      setMessage('Profile updated.');
      setEditing(false);
      setForm((f) => ({ ...f, password: '' }));
    } catch {
      // error is already captured in the store and rendered below
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-3xl text-charcoal">My Account</h1>

      {!editing ? (
        <>
          <div className="mt-8 flex flex-col gap-4 text-sm">
            <div>
              <span className="text-charcoal/50">Name</span>
              <p className="text-charcoal">{user.name}</p>
            </div>
            <div>
              <span className="text-charcoal/50">Email</span>
              <p className="text-charcoal">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <span className="text-charcoal/50">Phone</span>
                <p className="text-charcoal">{user.phone}</p>
              </div>
            )}
          </div>

          {message && <p className="mt-4 text-sm text-emerald">{message}</p>}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="rounded-sm bg-emerald px-6 py-3 text-sm font-medium text-parchment hover:bg-emerald-light transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="rounded-sm border border-charcoal/15 px-6 py-3 text-sm text-charcoal hover:border-ember hover:text-ember transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
          <input
            type="password"
            placeholder="New password (leave blank to keep current)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />

          {error && <p className="text-sm text-ember">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-sm bg-emerald px-6 py-3 text-sm font-medium text-parchment hover:bg-emerald-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-sm border border-charcoal/15 px-6 py-3 text-sm text-charcoal hover:border-charcoal/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}