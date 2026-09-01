'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

const STATUSES = ['Pending', 'Processing', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({ orderStatus: '', trackingNumber: '', carrier: '', note: '' });

  const load = () => {
    setLoading(true);
    api
      .get(`/orders/${id}`)
      .then((data) => {
        setOrder(data);
        setForm({
          orderStatus: data.orderStatus,
          trackingNumber: data.trackingNumber || '',
          carrier: data.carrier || '',
          note: '',
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const res = await api.put(`/orders/${id}/status`, form);
      setOrder(res);
      setMessage('Order updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this order? If it was paid by card, this will issue a refund.')) return;
    setError(null);
    try {
      const res = await api.put(`/orders/${id}/cancel`, {});
      setOrder(res);
      setMessage('Order cancelled.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="text-charcoal/50">Loading…</p>;
  if (!order) return <p className="text-charcoal/50">Order not found.</p>;

  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs text-charcoal/50">Order #{order._id.slice(-8)}</p>
      <h1 className="mt-1 font-display text-3xl text-gold">{order.orderStatus}</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        {order.user?.name} ({order.user?.email}) · KES {order.totalPrice.toLocaleString()} ·{' '}
        {order.paymentMethod === 'card' ? 'Paid by card' : 'Cash on delivery'}
      </p>

      <div className="mt-6 rounded-sm bg-parchment p-5">
        <h3 className="mb-3 text-sm font-medium text-charcoal">Items</h3>
        <div className="flex flex-col gap-2 text-sm">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex justify-between text-charcoal/70">
              <span>{item.quantity}× {item.name}</span>
              <span className="font-mono">KES {(item.quantity * item.price).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleUpdateStatus} className="mt-8 flex flex-col gap-4">
        <h3 className="text-sm font-medium text-gold">Update Status</h3>

        <select
          value={form.orderStatus}
          onChange={(e) => setForm({ ...form, orderStatus: e.target.value })}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Tracking number"
            value={form.trackingNumber}
            onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
          <input
            placeholder="Carrier"
            value={form.carrier}
            onChange={(e) => setForm({ ...form, carrier: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
        </div>

        <textarea
          rows={2}
          placeholder="Note (optional, shown to customer in their tracking timeline)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />

        {error && <p className="text-sm text-ember">{error}</p>}
        {message && <p className="text-sm text-emerald">{message}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-emerald px-6 py-3 text-sm font-medium text-parchment hover:bg-emerald-light transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Update Order'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-sm border border-ember px-6 py-3 text-sm font-medium text-ember hover:bg-ember hover:text-parchment transition-colors"
          >
            Cancel Order
          </button>
        </div>
      </form>

      <div className="mt-10">
        <h3 className="mb-3 text-sm font-medium text-gold">Timeline</h3>
        <div className="flex flex-col gap-4 border-l-2 border-emerald/20 pl-6">
          {order.statusHistory.map((entry, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-emerald" />
              <p className="text-sm font-medium text-parchment">{entry.status}</p>
              {entry.note && <p className="text-sm text-parchment/60">{entry.note}</p>}
              <p className="mt-1 font-mono text-xs text-parchment/40">
                {new Date(entry.updatedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
