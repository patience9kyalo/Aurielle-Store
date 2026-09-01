'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya',
    phone: '',
  });

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.priceAtAdd, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (paymentMethod === 'card') {
        const { url } = await api.post('/orders/checkout', address);
        window.location.href = url; // redirect to Stripe Checkout
        return;
      }

      // Cash on delivery goes through the manual order route instead
      const orderItems = items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.priceAtAdd,
        image: i.product.images?.[0]?.url,
      }));

      await api.post('/orders', {
        orderItems,
        shippingAddress: address,
        paymentMethod: 'cash_on_delivery',
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: subtotal,
      });

      router.push('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 font-display text-3xl text-charcoal">Checkout</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Street address"
          value={address.address}
          onChange={(e) => setAddress({ ...address, address: e.target.value })}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
          <input
            required
            placeholder="State / County"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Postal code"
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
          <input
            required
            placeholder="Country"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
          />
        </div>
        <input
          required
          placeholder="Phone (e.g. 0712345678)"
          value={address.phone}
          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          className="rounded-sm border border-charcoal/15 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald"
        />

        <div className="mt-4 flex gap-4">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-sm border border-charcoal/15 p-4 text-sm has-[:checked]:border-emerald">
            <input
              type="radio"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />
            Pay by card
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-sm border border-charcoal/15 p-4 text-sm has-[:checked]:border-emerald">
            <input
              type="radio"
              checked={paymentMethod === 'cash_on_delivery'}
              onChange={() => setPaymentMethod('cash_on_delivery')}
            />
            Cash on delivery
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-charcoal/10 pt-4">
          <span className="font-display text-lg text-charcoal">Total</span>
          <span className="font-mono text-lg text-charcoal">KES {subtotal.toLocaleString()}</span>
        </div>

        {error && <p className="text-sm text-ember">{error}</p>}

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="mt-2 rounded-sm bg-emerald px-6 py-3 text-sm font-medium text-parchment hover:bg-emerald-light transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing…' : paymentMethod === 'card' ? 'Continue to Payment' : 'Place Order'}
        </button>
      </form>
    </section>
  );
}
