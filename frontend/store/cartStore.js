import { create } from 'zustand';
import { api } from '@/lib/api';

// The backend cart (MongoDB, per-user) is the source of truth. This store
// just caches it in memory so components can react to changes without
// each one independently re-fetching - every mutation re-syncs from the
// server response rather than guessing the new state locally.
export const useCartStore = create((set) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await api.get('/cart');
      set({ cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const cart = await api.post('/cart', { product: productId, quantity });
      set({ cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateItem: async (productId, quantity) => {
    set({ loading: true, error: null });
    try {
      const cart = await api.put(`/cart/${productId}`, { quantity });
      set({ cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      const cart = await api.delete(`/cart/${productId}`);
      set({ cart, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await api.delete('/cart');
      set({ cart: { items: [] }, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
