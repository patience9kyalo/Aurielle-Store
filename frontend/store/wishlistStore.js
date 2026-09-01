import { create } from 'zustand';
import { api } from '@/lib/api';

export const useWishlistStore = create((set, get) => ({
  wishlist: null,
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const wishlist = await api.get('/wishlist');
      set({ wishlist, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      const wishlist = await api.post('/wishlist', { product: productId });
      set({ wishlist, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      const wishlist = await api.delete(`/wishlist/${productId}`);
      set({ wishlist, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  moveToCart: async (productId) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/wishlist/${productId}/move-to-cart`, {});
      const wishlist = await api.get('/wishlist');
      set({ wishlist, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  isSaved: (productId) => {
    const items = get().wishlist?.items || [];
    return items.some((item) => item.product._id === productId);
  },
}));