import Link from 'next/link';
import CategoryCard from '@/components/product/CategoryCard';
import ProductCard from '@/components/product/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 300 } });
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/products?limit=8`, { next: { revalidate: 60 } });
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <>
      <section className="relative min-h-[80vh] flex items-center bg-black text-parchment bg-cover bg-no-repeat bg-center image-render-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-0" />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-2 md:py-32 w-full">
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 pt-12 pb-24 md:grid-cols-2 md:pt-16 md:pb-32 w-full">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">Jewelry, made with care</span>
              <h1 className="mt-4 font-serif text-5l leading-tight md:text-5xl text-white"> Pieces worth looking closely at. </h1>
              <p className="mt-5 max-w-md text-parchment/90 text-base leading-relaxed font-light drop-shadow-sm"> Handpicked jewelry and accessories, based in Nyeri, Kenya. Hover any piece to inspect the detail up close. </p>
              <div className="mt-8 flex gap-4">
                <Link href="/products" className="rounded-sm bg-gold px-6 py-3 text-sm font-medium text-emerald-dark hover:bg-gold-dark transition-colors shadow-lg" > Shop Now </Link>
                <Link href="/products" className="rounded-sm border border-white/40 px-6 py-3 text-sm font-medium hover:border-gold hover:text-gold transition-colors backdrop-blur-sm" > Explore </Link>
              </div>
            </div>
            <div className="hidden md:block" />
          </div>
          <div className="hidden md:block relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl border border-parchment/10">
            <img src="/background.jpg" alt="Featured fine jewelry close up" className="object-cover w-full h-full" />
          </div>
        </div>
      </section>

      {/* Category rail */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 bg-black">
          <h2 className="mb-10 font-display text-3xl text-white tracking-wide">Shop by Category</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (<CategoryCard key={cat._id} category={cat} />))}
          </div>
        </section>

      )}

      {/* Featured products */}
      {products.length > 0 && (
        <section className="bg-black px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="font-display text-3xl text-white tracking-wide">New Arrivals</h2>
              <Link href="/products" className="text-sm text-gold hover:underline font-medium"> View all → </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {products.slice(0, 4).map((p) => (<ProductCard key={p._id} product={p} />))}
            </div>
          </div>
        </section>
      )}

      {/* Brand story */}
      <section className="mx-auto max-w-7xl bg-black px-6 py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="aspect-[4/5] rounded-sm overflow-hidden shadow-lg bg-parchment">
            <img src="/collections.jpg" alt="Craftsmanship detail" className="object-cover w-full h-full" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-white font-semibold">Our Philosophy</span>
            <h2 className="mt-3 font-display text-4xl leading-tight text-gold"> Crafted with care, <br /> piece by piece. </h2>
            <p className="mt-5 max-w-md text-parchment/70 leading-relaxed"> Every item at Aurielle is chosen for the detail that only shows up when you look closely — which is exactly why we built it that way. </p>
            <Link href="/products" className="mt-8 inline-block rounded-sm bg-black px-6 py-3 text-sm font-medium text-parchment hover:bg-gold transition-colors shadow-sm" > Explore the collection </Link>
          </div>
        </div>
      </section>
    </>

  );
}
