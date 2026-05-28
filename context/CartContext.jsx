'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('f2c_cart');
      if (stored) setItems(JSON.parse(stored));
    } catch {
      localStorage.removeItem('f2c_cart');
      setItems([]);
    }
  }, []);

  const persist = (newItems) => {
    setItems(newItems);
    localStorage.setItem('f2c_cart', JSON.stringify(newItems));
  };

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id || i.id === product.id);
      let next;
      if (existing) {
        next = prev.map((i) =>
          (i._id === product._id || i.id === product.id)
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      } else {
        next = [...prev, { ...product, quantity: qty }];
      }
      localStorage.setItem('f2c_cart', JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (productId) => {
    const next = items.filter((i) => i._id !== productId && i.id !== productId);
    persist(next);
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    const next = items.map((i) =>
      (i._id === productId || i.id === productId) ? { ...i, quantity: qty } : i
    );
    persist(next);
  };

  const clearCart = () => persist([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
