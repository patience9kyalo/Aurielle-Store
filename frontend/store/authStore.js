import { create } from 'zustand';
import { api } from '@/lib/api';

const storeSession = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
};

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/login', { email, password }, { auth: false });
      storeSession(data);
      set({ user: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (name, email, password, phone) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/register', { name, email, password, phone }, { auth: false });
      storeSession(data);
      set({ user: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateProfile: async (updates) => {
    set({ loading: true, error: null });
    try {
      const data = await api.put(`/auth/${useAuthStore.getState().user._id}`, updates);
      const merged = { ...useAuthStore.getState().user, ...data };
      storeSession(merged);
      set({ user: merged, loading: false });
      return merged;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null });
    window.location.reload();
  },

  hydrate: () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        set({ user: JSON.parse(stored) });
      } catch {
        localStorage.removeItem('user');
      }
    }
  },
}));
