'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import StatCard from '@/components/admin/StatCard';

// Exact hex values matching tailwind.config.js - Recharts needs literal
// colors, it can't read Tailwind utility classes.
const COLORS = {
  emerald: '#12291F',
  emeraldLight: '#1B3B2C',
  gold: '#C9A24B',
  goldDark: '#A9843A',
  ember: '#B8433A',
  charcoal: '#1C1C1A',
  parchmentDark: '#E8DAC0',
};

const STATUS_COLORS = {
  Pending: '#A79C8E',
  Processing: COLORS.goldDark,
  'Ready for Pickup': COLORS.emeraldLight,
  Shipped: COLORS.emerald,
  Delivered: COLORS.emerald,
  Cancelled: COLORS.ember,
};

// Custom tooltip so charts match the site's design language instead of
// Recharts' default white box.
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sm border border-charcoal/10 bg-parchment px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-charcoal">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/dashboard/overview?days=${days}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <p className="text-charcoal/50">Loading…</p>;
  if (error) return <p className="text-ember">Couldn&#39;t load dashboard data: {error}</p>;
  if (!data) return <p className="text-charcoal/50">Couldn&#39;t load dashboard data.</p>;

  const { inventory, sales } = data;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-gold">Dashboard</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-sm border border-charcoal/15 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">Sales</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Revenue" value={`KES ${sales.totalRevenue.toLocaleString()}`} />
        <StatCard label="Avg Order Value" value={`KES ${Math.round(sales.averageOrderValue).toLocaleString()}`} />
        <StatCard label="Awaiting Fulfillment" value={sales.pendingFulfillment} />
      </div>

      {/* Revenue trend */}
      {sales.revenueByDay.length > 0 && (
        <div className="mb-8 rounded-sm bg-parchment p-5">
          <p className="mb-4 text-xs uppercase tracking-widest text-black">Revenue Trend</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={sales.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.parchmentDark} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.charcoal }} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.charcoal }} />
              <Tooltip content={<ChartTooltip formatter={(v) => `KES ${v.toLocaleString()}`} />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.emerald}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS.gold }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order status breakdown */}
        {sales.statusBreakdown.length > 0 && (
          <div className="rounded-sm bg-parchment p-5">
            <p className="mb-4 text-xs uppercase tracking-widest text-black">Order Status</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={sales.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {sales.statusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || COLORS.charcoal} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: 12, color: COLORS.charcoal }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top sellers */}
        {sales.topProducts.length > 0 && (
          <div className="rounded-sm bg-parchment p-5">
            <p className="mb-4 text-xs uppercase tracking-widest text-black">Top Sellers (units sold)</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sales.topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.parchmentDark} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.charcoal }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11, fill: COLORS.charcoal }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="unitsSold" fill={COLORS.gold} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">Inventory</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Products" value={inventory.totalProducts} />
        <StatCard label="Out of Stock" value={inventory.outOfStockCount} />
        <StatCard label="Low Stock" value={inventory.lowStockCount} sub={`≤ ${inventory.lowStockThreshold} units`} />
        <StatCard label="Inventory Value" value={`KES ${inventory.totalInventoryValue.toLocaleString()}`} />
      </div>

      {/* Stock by category */}
      {inventory.categoryBreakdown.length > 0 && (
        <div className="mb-8 rounded-sm bg-parchment p-5">
          <p className="mb-4 text-xs uppercase tracking-widest text-black">Stock by Category</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={inventory.categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.parchmentDark} />
              <XAxis
                dataKey="categoryName"
                tick={{ fontSize: 11, fill: COLORS.charcoal }}
              />
              <YAxis tick={{ fontSize: 11, fill: COLORS.charcoal }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="totalStock" name="Units in stock" fill={COLORS.emerald} radius={[3, 3, 0, 0]} />
              <Bar dataKey="productCount" name="Products" fill={COLORS.gold} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {inventory.lowStockProducts.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-gold">Needs Restocking</h3>
          <div className="flex flex-col gap-2">
            {inventory.lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-sm bg-parchment px-4 py-3 text-sm">
                <span className="text-charcoal">{p.name}</span>
                <span className="font-mono text-ember">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}