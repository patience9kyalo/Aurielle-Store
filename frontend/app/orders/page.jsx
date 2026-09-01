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

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/myorders')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mx-auto max-w-4xl px-6 py-20 text-charcoal/50">Loading…</p>;

  if (orders.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-charcoal">No orders yet</h1>
        <Link href="/products" className="mt-6 inline-block text-emerald hover:underline">
          Start shopping →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl text-charcoal">Your Orders</h1>

      <div className="flex flex-col gap-6"> {/* Increased gap between individual order blocks */}
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-sm bg-parchment p-6 border border-charcoal/5 shadow-sm flex flex-col gap-4"
          >
            {/* Top Row: Meta Information Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-charcoal/10">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-semibold">Order Reference</p>
                  <p className="font-mono text-sm text-charcoal/80">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-semibold">Date Placed</p>
                  <p className="text-sm text-charcoal/70">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-semibold text-right">Status</p>
                  <span className={`text-sm font-semibold tracking-wide uppercase ${statusColor[order.orderStatus] || ''}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-semibold">Total Amount</p>
                  <span className="font-mono text-base font-bold text-charcoal">
                    KES {order.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Clean Itemized Spaces */}
            <div className="py-1">
              <p className="text-xs font-bold text-charcoal/50 uppercase tracking-widest mb-3">
                Items Ordered
              </p>
              <div className="flex flex-col gap-3"> {/* Added vertical row spacing between elements */}
                {order.orderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-2 px-3 rounded bg-charcoal/[0.02] border border-charcoal/[0.04]"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-charcoal font-medium">
                        {item.name || item.product?.name || "Premium Product"}
                      </span>
                      <span className="text-charcoal/50 text-xs">
                        Quantity: <strong className="font-mono text-charcoal/70">{item.quantity}</strong>
                      </span>
                    </div>
                    <span className="text-charcoal/70 font-mono font-medium">
                      KES {(item.price || item.product?.price || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Row */}
            <div className="flex justify-end pt-2 mt-1 border-t border-charcoal/5">
              <Link
                href={`/orders/${order._id}`}
                className="text-xs font-semibold uppercase tracking-wider text-charcoal bg-charcoal/5 hover:bg-charcoal/10 px-4 py-2 rounded-sm transition-all flex items-center gap-1 group"
              >
                Track Order Details
                <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

}
