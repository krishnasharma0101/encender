"use client";
import { ReactNode, useEffect, useState } from 'react';
import CartSidebar from './CartSidebar';
import { SessionProvider } from 'next-auth/react';

export default function LayoutWithSidebar({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; quantity: number; image?: string }[]>([]);

  useEffect(() => {
    const openSidebar = () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
      let parsed: { id: string; quantity: number }[] = [];
      if (stored) {
        parsed = (JSON.parse(stored) as { id: string | number; quantity: number }[]).map((item) => ({ ...item, id: String(item.id) }));
      }
      // Try to get product info from a cache in localStorage
      const productCache = typeof window !== 'undefined' ? localStorage.getItem('productCache') : null;
      let cache: Record<string, { name: string; price: number; image?: string }> = {};
      if (productCache) {
        cache = JSON.parse(productCache);
      }
      const items = parsed.map(item => ({
        id: item.id,
        name: cache[item.id]?.name || 'Product',
        price: cache[item.id]?.price || 0,
        image: cache[item.id]?.image,
        quantity: item.quantity,
      }));
      setCartItems(items);
      setSidebarOpen(true);
    };
    window.addEventListener('open-cart-sidebar', openSidebar);
    return () => window.removeEventListener('open-cart-sidebar', openSidebar);
  }, []);

  return (
    <SessionProvider>
      {children}
      <CartSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} cartItems={cartItems} />
    </SessionProvider>
  );
} 