import Link from 'next/link';
import Image from 'next/image';

export default function CategoryCard({ category }) {
  const image = typeof category.image === 'string' ? category.image.trim() || null : null;

  return (
    <Link
      href={`/products?category=${category._id}`}
      className="group block overflow-hidden rounded-sm bg-parchment"
    >
      <div className="p-5">
        <span className="text-xs uppercase tracking-widest text-emerald">Category</span>
        <h3 className="mt-1 font-display text-xl text-charcoal">{category.name}</h3>
        <span className="mt-3 inline-block text-sm font-medium text-gold-dark group-hover:underline">
          Check more products →
        </span>
      </div>
    </Link>
  );
}
