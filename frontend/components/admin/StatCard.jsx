export default function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-sm bg-parchment p-5">
      <p className="text-xs uppercase tracking-widest text-charcoal/50">{label}</p>
      <p className="mt-2 font-mono text-2xl text-charcoal">{value}</p>
      {sub && <p className="mt-1 text-xs text-charcoal/50">{sub}</p>}
    </div>
  );
}
