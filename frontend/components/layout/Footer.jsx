export default function Footer() {
  return (
    <footer className="bg-black text-parchment">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <h3 className="font-display text-xl">Aurielle</h3>
          <p className="mt-3 text-sm text-white/70">
            Handpicked jewelry and accessories, based in Nyeri, Kenya.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-gold">Shop</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li><a href="/products" className="hover:text-gold transition-colors">All products</a></li>
            <li><a href="/orders" className="hover:text-gold transition-colors">Track an order</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-gold">Support</h4>
          <ul className="space-y-2 text-sm text-parchment/80">
            <li><a href="/account" className="hover:text-gold transition-colors">My account</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-xs uppercase tracking-widest text-gold">Stay in touch</h4>
          <p className="mb-3 text-sm text-parchment/70">Get notified about new pieces.</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full rounded-sm bg-parchment/10 px-3 py-2 text-sm text-parchment placeholder:text-parchment/50 focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-sm bg-gold px-4 py-2 text-sm font-medium text-emerald-dark hover:bg-gold-dark transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-parchment/10 px-6 py-5 text-center text-xs text-parchment/50">
        © {new Date().getFullYear()} Aurielle Store. All rights reserved.
      </div>
    </footer>
  );
}
