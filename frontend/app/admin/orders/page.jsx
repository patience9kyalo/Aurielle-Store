'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const statusColor = {
  Pending: 'text-charcoal/60',
  Processing: 'text-gold-dark',
  'Ready for Pickup': 'text-emerald',
  Shipped: 'text-emerald',
  Delivered: 'text-emerald',
  Cancelled: 'text-ember',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl text-gold">Orders</h1>

      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-sm bg-parchment">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-xs uppercase tracking-widest text-black">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal/70">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-4 py-3 text-charcoal">{order.user?.name || '—'}</td>
                  <td className={`px-4 py-3 font-medium ${statusColor[order.orderStatus] || ''}`}>
                    {order.orderStatus}
                  </td>
                  <td className="px-4 py-3 font-mono text-charcoal/70">
                    KES {order.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order._id}`} className="text-emerald hover:underline">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
