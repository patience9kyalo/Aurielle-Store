'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import { api } from '@/lib/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}/track`)
      .then(setTracking)
      .finally(() => setLoading(false));
  }, [id]);

  // Live updates - if an admin changes this order's status while the
  // customer has this page open, it updates without a refresh.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on('order:update', (data) => {
      if (data.orderId === id) {
        setTracking((prev) => (prev ? { ...prev, ...data } : null));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (loading) return <p className="mx-auto max-w-2xl px-6 py-20 text-charcoal/50">Loading…</p>;
  if (!tracking) return <p className="mx-auto max-w-2xl px-6 py-20 text-charcoal/50">Order not found.</p>;

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <p className="font-mono text-xs text-charcoal/50">Order #{tracking.orderId.slice(-8)}</p>
      <h1 className="mt-2 font-display text-3xl text-charcoal">{tracking.orderStatus}</h1>

      {tracking.trackingNumber && (
        <p className="mt-3 font-mono text-sm text-charcoal/70">
          Tracking: {tracking.trackingNumber} {tracking.carrier && `(${tracking.carrier})`}
        </p>
      )}

      <div className="mt-10 flex flex-col gap-6 border-l-2 border-emerald/20 pl-6">
        {tracking.statusHistory.map((entry, i) => (
          <div key={i} className="relative">
            <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-emerald" />
            <p className="font-medium text-charcoal">{entry.status}</p>
            {entry.note && <p className="text-sm text-charcoal/60">{entry.note}</p>}
            <p className="mt-1 font-mono text-xs text-charcoal/40">
              {new Date(entry.updatedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
