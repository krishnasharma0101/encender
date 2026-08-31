'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/new-ui/Navbar';
import { getAssetUrl } from '@/lib/directus';
import { addToCart } from '@/lib/cart';
import { getWishlist, removeFromWishlist, clearWishlist } from '@/lib/wishlist';
import { REAL_PRODUCTS } from '@/data/realProducts';
import {
  Heart,
  Trash2,
  Share2,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL
  ? process.env.NEXT_PUBLIC_DIRECTUS_URL.replace(/\/$/, '')
  : '';

export default function WishlistClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [moveAllSuccess, setMoveAllSuccess] = useState(false);

  const loadWishlistItems = useCallback(async () => {
    setLoading(true);
    if (typeof window === 'undefined') return;

    const wishlistIds = getWishlist();

    if (wishlistIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const mergedItems: any[] = [];
    const missingIds: string[] = [];

    // 1. Check local REAL_PRODUCTS dataset
    wishlistIds.forEach((idStr) => {
      const found = REAL_PRODUCTS.find((p: any) => String(p.id) === String(idStr));
      if (found) {
        const catArray = Array.isArray(found.category) ? found.category : [found.category || 'Gifting'];
        const price = Number(found.Discounter_price) || 299;
        const origPrice = Number(found.original_price) || Math.round(price * 1.25);
        const image = found.images && found.images.length > 0 ? found.images[0] : '/uploads/00bff452-677b-45ee-9673-1077bb3a7fe8.jpg';
        mergedItems.push({
          id: String(found.id),
          name: found.name,
          Discounter_price: price,
          original_price: origPrice,
          category: catArray[0] || 'Gifting',
          image,
        });
      } else {
        missingIds.push(idStr);
      }
    });

    // 2. Query Directus for items not in static list
    if (missingIds.length > 0) {
      try {
        const fetchUrl = `${DIRECTUS_URL}/items/Products?fields=*,images.*&filter[id][_in]=${missingIds.join(',')}`;
        const res = await fetch(fetchUrl);
        const json = await res.json();
        if (Array.isArray(json?.data)) {
          json.data.forEach((p: any) => {
            const catArray = Array.isArray(p.category) ? p.category : [p.category || 'Gifting'];
            const price = Number(p.Discounter_price) || 299;
            const origPrice = Number(p.original_price) || Math.round(price * 1.25);
            let image = '/uploads/00bff452-677b-45ee-9673-1077bb3a7fe8.jpg';
            if (p.images && p.images.length > 0) {
              const firstImg = p.images[0];
              const fileId = typeof firstImg === 'object' && firstImg?.directus_files_id ? firstImg.directus_files_id : firstImg;
              image = getAssetUrl(fileId);
            }
            mergedItems.push({
              id: String(p.id),
              name: p.name,
              Discounter_price: price,
              original_price: origPrice,
              category: catArray[0] || 'Gifting',
              image,
            });
          });
        }
      } catch (e) {
        console.error('Error fetching backend wishlist products:', e);
      }
    }

    setItems(mergedItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWishlistItems();
    const handleUpdate = () => {
      loadWishlistItems();
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadWishlistItems]);

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(String(product.id), 1);
    setAddedId(String(product.id));
    setTimeout(() => {
      setAddedId((prev) => (prev === String(product.id) ? null : prev));
    }, 1800);
  };

  const handleMoveAllToBag = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      addToCart(String(item.id), 1);
    });
    setMoveAllSuccess(true);
    setTimeout(() => setMoveAllSuccess(false), 3000);
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Encender Wishlist',
            text: 'Take a look at my curated wishlist on Encender!',
            url: shareUrl,
          });
          return;
        } catch {}
      }
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] font-sans antialiased flex flex-col">
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 flex-grow w-full">

        {/* Page Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-black mb-2 tracking-tight">
            My Curated Wishlist
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Items you've saved for your special moments and gifting.
          </p>
        </div>

        {/* Filter & Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-black">
              Showing {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-sm font-semibold text-black hover:text-[#80182a] transition-colors py-2 px-3 rounded-lg border border-gray-200 hover:border-black cursor-pointer bg-white"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Link Copied!' : 'Share Wishlist'}</span>
              </button>

              <button
                onClick={handleMoveAllToBag}
                className="bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {moveAllSuccess ? 'Moved to Bag!' : 'Move All to Bag'}
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-pulse font-serif text-lg text-[#80182a] font-semibold">
              Loading your curated wishlist...
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto shadow-xs my-12">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Explore our handcrafted collections and click the heart icon on any piece you'd like to save.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#80182a] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#5f0017] transition-all shadow-sm"
            >
              Explore Collections
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-5 max-w-4xl">
            {items.map((item) => {
              const discountPercent =
                item.original_price > item.Discounter_price
                  ? Math.round(
                      ((item.original_price - item.Discounter_price) / item.original_price) * 100
                    )
                  : 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-3 sm:p-5 relative flex flex-row gap-4 sm:gap-6 group hover:shadow-md transition-all duration-300 items-center"
                >
                  {/* Thumbnail Image Container - Full image visible with object-contain */}
                  <Link
                    href={`/new-ui/product/${item.id}`}
                    className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50/90 border border-gray-100 relative p-2 flex items-center justify-center group-hover:border-amber-200 transition-colors block"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Delete Button (Top Right) */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-gray-100/90 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Content Area */}
                  <div className="flex-grow flex flex-col justify-between self-stretch pr-8 sm:pr-10 py-0.5">
                    <div>
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="bg-[#855300]/10 text-[#855300] px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="bg-[#80182a]/10 text-[#80182a] px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold">
                          Personalizable
                        </span>
                      </div>

                      {/* Product Name */}
                      <Link href={`/new-ui/product/${item.id}`}>
                        <h3 className="font-serif text-base sm:text-xl font-bold text-gray-900 line-clamp-2 leading-snug hover:text-[#80182a] transition-colors">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mt-1.5 sm:mt-2">
                        <span className="text-base sm:text-xl font-bold text-gray-900 font-serif">
                          ₹{Number(item.Discounter_price).toLocaleString('en-IN')}
                        </span>
                        {item.original_price > item.Discounter_price && (
                          <>
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              ₹{Number(item.original_price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-emerald-600">
                              {discountPercent}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 mt-3 pt-2 sm:pt-0">
                      <button
                        onClick={(e) => handleAddToCart(e, item)}
                        className={`py-2 sm:py-2.5 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all duration-300 cursor-pointer ${
                          addedId === String(item.id)
                            ? 'bg-emerald-600 text-white scale-[1.02]'
                            : 'bg-[#f59e0b] text-white hover:bg-[#d97706] active:scale-95'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {addedId === String(item.id) ? 'check_circle' : 'shopping_bag'}
                        </span>
                        <span>{addedId === String(item.id) ? 'Added to Bag!' : 'Add to Bag'}</span>
                      </button>

                      <a
                        href={`https://wa.me/919028502581?text=${encodeURIComponent(
                          `Hi Encender! I want to inquire/buy: ${item.name} (Price: ₹${item.Discounter_price})`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 text-gray-700 py-2 sm:py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-xs sm:text-sm font-semibold"
                      >
                        <svg
                          className="w-4 h-4 text-emerald-600 fill-current flex-shrink-0"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.027-.478-1.614-.668-2.651-2.316-2.731-2.424-.08-.108-.65-8.66-.65-1.654 0-.787.41-1.177.556-1.336.145-.16.318-.199.424-.199.106 0 .212.001.305.006.098.005.23-.037.36.275.133.318.455 1.111.494 1.192.039.08.066.175.013.281-.053.106-.08.172-.16.265-.08.093-.168.207-.24.278-.08.079-.163.165-.07.324.093.16.413.681.885 1.102.608.542 1.121.71 1.28.79.16.079.252.066.345-.04.093-.106.398-.464.504-.623.106-.16.212-.133.358-.079.146.053.928.437 1.087.516.16.08.265.12.305.186.04.066.04.385-.104.79z" />
                        </svg>
                        <span>Buy via WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
