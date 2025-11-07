import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const LS_KEY = 'shopease_cart_v1';

function loadLocalCart() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
}

function saveLocalCart(cart) {
  localStorage.setItem(LS_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [items, setItems] = useState([]); // [{product, qty}]
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage initially
  useEffect(() => {
    const local = loadLocalCart();
    setItems(local.items || []);
  }, []);

  // Sync with backend when user logs in
  useEffect(() => {
    const sync = async () => {
      if (!token) return; // remain local
      try {
        setLoading(true);
        const res = await api.get('/api/cart');
        setItems((res.data?.items || []).map(i => ({ product: i.product, qty: i.qty })));
        saveLocalCart({ items: (res.data?.items || []).map(i => ({ product: i.product, qty: i.qty })) });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    sync();
  }, [token]);

  const addItem = async (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.product?._id === product._id);
      const next = [...prev];
      if (idx >= 0) next[idx] = { product, qty: next[idx].qty + qty };
      else next.push({ product, qty });
      saveLocalCart({ items: next });
      return next;
    });
    // Backend sync if logged in
    if (token) {
      try { await api.post('/api/cart', { productId: product._id, qty }); } catch {}
    }
  };

  const updateQty = async (productId, qty) => {
    setItems(prev => {
      const next = prev.map(it => it.product._id === productId ? { ...it, qty } : it);
      saveLocalCart({ items: next });
      return next;
    });
    if (token) { try { await api.put(`/api/cart/${productId}`, { qty }); } catch {} }
  };

  const removeItem = async (productId) => {
    setItems(prev => {
      const next = prev.filter(it => it.product._id !== productId);
      saveLocalCart({ items: next });
      return next;
    });
    if (token) { try { await api.delete(`/api/cart/${productId}`); } catch {} }
  };

  const clear = async () => {
    setItems([]);
    saveLocalCart({ items: [] });
    if (token) { try { await api.delete('/api/cart'); } catch {} }
  };

  const total = items.reduce((sum, it) => sum + (it.product?.price || 0) * it.qty, 0);

  const value = useMemo(() => ({ items, loading, addItem, updateQty, removeItem, clear, total }), [items, loading, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }
