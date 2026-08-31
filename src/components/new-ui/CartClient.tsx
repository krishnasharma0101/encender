'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/new-ui/Navbar';
import { fetchDirectusData } from '@/lib/fetchWithRetry';
import { getAssetUrl } from '@/lib/directus';

import { REAL_PRODUCTS } from '@/data/realProducts';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

const RECOMMENDATIONS = REAL_PRODUCTS.slice(4, 8).map((p: any) => {
  const catArray = Array.isArray(p.category) ? p.category : [p.category || 'Gifting'];
  const price = Number(p.Discounter_price) || 299;
  const original_price = Number(p.original_price) || Math.round(price * 1.15);
  return {
    id: String(p.id),
    name: p.name,
    price,
    original_price,
    category: catArray[0] || 'Gifting',
    image: p.images && p.images.length > 0 ? p.images[0] : '/uploads/00bff452-677b-45ee-9673-1077bb3a7fe8.jpg',
  };
});

export default function CartClient() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync cart from localStorage with backend & local item lookup
  const loadCart = useCallback(async () => {
    setLoading(true);
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('cart');
    let rawCart: { id: string; quantity: number }[] = [];
    try {
      rawCart = stored ? JSON.parse(stored) : [];
    } catch {
      rawCart = [];
    }

    if (rawCart.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    // Map items from REAL_PRODUCTS dataset
    const mergedItems = rawCart
      .map((cItem) => {
        const found = REAL_PRODUCTS.find((p: any) => String(p.id) === String(cItem.id));
        if (!found) return null;
        const catArray = Array.isArray(found.category) ? found.category : [found.category || 'Gifting'];
        const image = found.images && found.images.length > 0 ? found.images[0] : '/uploads/00bff452-677b-45ee-9673-1077bb3a7fe8.jpg';
        return {
          id: String(found.id),
          name: found.name,
          Discounter_price: Number(found.Discounter_price) || 299,
          original_price: Number(found.original_price) || Number(found.Discounter_price || 299) * 1.15,
          category: catArray[0] || 'Gifting',
          subtitle: 'Authentic Heritage Item',
          quantity: cItem.quantity,
          image,
        };
      })
      .filter(Boolean);

    setCartItems(mergedItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Storage & Event helper
  const syncCartToStorage = (updated: any[]) => {
    if (typeof window === 'undefined') return;
    const stored = updated.map((i) => ({ id: i.id, quantity: i.quantity }));
    localStorage.setItem('cart', JSON.stringify(stored));
    setTimeout(() => {
      window.dispatchEvent(new Event('cart-updated'));
    }, 0);
  };

  // Quantity Handlers
  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) => {
          if (String(item.id) === String(id)) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      syncCartToStorage(updated);
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => String(item.id) !== String(id));
      syncCartToStorage(updated);
      return updated;
    });
  };

  const addToCart = (id: string) => {
    const foundReal = REAL_PRODUCTS.find((p: any) => String(p.id) === String(id));
    if (!foundReal) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => String(item.id) === String(id));
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          String(item.id) === String(id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const catArray = Array.isArray(foundReal.category) ? foundReal.category : [foundReal.category || 'Gifting'];
        const price = Number(foundReal.Discounter_price) || 299;
        updated = [
          ...prev,
          {
            id: String(foundReal.id),
            name: foundReal.name,
            Discounter_price: price,
            original_price: Number(foundReal.original_price) || Math.round(price * 1.15),
            category: catArray[0] || 'Gifting',
            image: foundReal.images && foundReal.images.length > 0 ? foundReal.images[0] : '/uploads/00bff452-677b-45ee-9673-1077bb3a7fe8.jpg',
            quantity: 1,
          },
        ];
      }
      syncCartToStorage(updated);
      return updated;
    });
  };

  // Price calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.Discounter_price * item.quantity, 0);
  }, [cartItems]);

  const whatsappCheckoutMessage = encodeURIComponent(
    `Hi Encender! I want to complete my order for:\n` +
      cartItems
        .map((item) => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.Discounter_price * item.quantity}`)
        .join('\n') +
      `\n\nTotal Estimated Amount: ₹${subtotal}`
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans antialiased overflow-x-hidden flex flex-col">
      {/* External Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <style jsx global>{`
        .font-serif-heading {
          font-family: 'Playfair Display', serif;
        }
        .font-sans-body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <Navbar />

      {/* Main Shopping Bag Container */}
      <main className="flex-grow pt-10 pb-16 px-4 md:px-10 max-w-[1280px] mx-auto w-full font-sans-body">
        <h1 className="font-serif-heading text-3xl md:text-5xl font-bold text-gray-900 mb-8">
          Your Shopping Bag
        </h1>

        {loading ? (
          <div className="py-16 text-center text-[#855300] font-semibold animate-pulse">
            Loading your shopping bag...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">shopping_bag</span>
            <h2 className="font-serif-heading text-2xl font-bold text-gray-800 mb-2">
              Your shopping bag is empty
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Explore our curated collections of modern luxury Indian artistry and handcrafted gifts.
            </p>
            <Link
              href="/new-ui/products"
              className="inline-block bg-[#855300] text-white px-8 py-3 rounded-xl text-xs font-semibold hover:bg-[#653e00] transition-colors shadow-md"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60 transition-transform hover:-translate-y-0.5 duration-300"
                >
                  {/* Thumbnail Image */}
                  <Link
                    href={`/new-ui/product/${item.id}`}
                    className="w-full sm:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 block"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Item Specs & Price */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link
                          href={`/new-ui/product/${item.id}`}
                          className="hover:text-[#855300] transition-colors"
                        >
                          <h3 className="font-sans-body font-bold text-lg text-gray-900 mb-1">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                        {item.personalized && (
                          <p className="text-xs text-[#855300] mt-1.5 font-medium">
                            Personalized: <span className="italic font-semibold">{item.personalized}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-serif-heading text-xl font-bold text-gray-900">
                          ₹{(item.Discounter_price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Remove Action */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors font-bold"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold underline flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary (4 Cols Sticky) */}
            <div className="lg:col-span-4 sticky top-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-200/60 p-6 md:p-8 flex flex-col gap-6">
                <h2 className="font-serif-heading font-bold text-xl text-gray-900 border-b border-gray-100 pb-4">
                  Order Summary
                </h2>

                <div className="flex flex-col gap-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className="text-[#6f46b9] font-bold">FREE</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                  <span className="font-bold text-gray-900">Estimated Total</span>
                  <span className="font-serif-heading text-2xl font-bold text-[#855300]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Checkout via WhatsApp Direct */}
                <a
                  href={`https://wa.me/919028502581?text=${whatsappCheckoutMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-center"
                >
                  Proceed to Secure Checkout <span className="material-symbols-outlined text-lg">lock</span>
                </a>

                {/* Continue Shopping Button */}
                <Link
                  href="/new-ui/products"
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold text-sm py-3 px-6 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-center"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span> Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="flex justify-center gap-2 mt-2 items-center text-xs text-gray-500 font-semibold tracking-wider uppercase">
                  <span className="material-symbols-outlined text-base text-[#855300]">verified_user</span>
                  <span>100% Secure Payments</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Section ("You May Also Like") */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#6f46b9] font-bold block mb-1">
                Curated Suggestions
              </span>
              <h2 className="font-serif-heading text-2xl md:text-3xl font-bold text-gray-900">
                You May Also Like
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {RECOMMENDATIONS.map((rec) => (
              <div
                key={rec.id}
                className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Product Image */}
                <Link
                  href={`/new-ui/product/${rec.id}`}
                  className="relative aspect-square sm:aspect-[4/4.5] overflow-hidden bg-gray-50 block"
                >
                  <img
                    src={rec.image}
                    alt={rec.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>

                {/* Product Details */}
                <div className="p-2.5 sm:p-5 flex flex-col flex-grow">
                  <span className="text-[9px] sm:text-[11px] uppercase tracking-wider font-bold text-[#855300] mb-0.5 sm:mb-1">
                    {rec.category}
                  </span>
                  <Link href={`/new-ui/product/${rec.id}`} className="hover:text-[#855300] transition-colors">
                    <h3 className="font-sans-body font-semibold sm:font-bold text-xs sm:text-base text-gray-900 mb-1 sm:mb-2 line-clamp-2 leading-tight">
                      {rec.name}
                    </h3>
                  </Link>
                  <div className="mt-auto pt-1.5 sm:pt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                      <span className="font-serif-heading font-bold text-sm sm:text-xl text-gray-900">
                        ₹{Number(rec.price).toLocaleString('en-IN')}
                      </span>
                      {rec.original_price > rec.price && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                          ₹{Number(rec.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="p-2.5 sm:p-4 pt-0">
                  <button
                    onClick={() => addToCart(rec.id)}
                    className="w-full bg-[#f59e0b] text-white hover:bg-[#d97706] transition-colors py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-2 shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs sm:text-base">shopping_bag</span> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer matching existing New UI design */}
      <footer className="bg-[#2f312f] text-white py-12 px-6 md:px-10 mt-auto">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8 font-sans-body">
          <div className="flex flex-col gap-3">
            <span className="font-serif-heading text-2xl font-bold text-[#ffddb8]">Encender</span>
            <p className="text-sm text-gray-300">© 2026 Encender. Crafted with Heritage across India.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto text-sm text-gray-300">
            <div className="flex flex-col gap-2">
              <Link href="/shipping" className="hover:text-white transition-colors">
                Shipping Policy
              </Link>
              <Link href="/refunds" className="hover:text-white transition-colors">
                Refunds
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/919028502581"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors text-[#f59e0b] font-medium"
              >
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
