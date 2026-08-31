'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/new-ui/Navbar';
import Footer from '@/components/Footer';
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
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/account" className="hover:text-black transition-colors">
            My Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-black font-semibold">Wishlist</span>
        </nav>

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
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                  className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100/80 relative flex flex-col group h-full overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-xs">
                      {item.category}
                    </span>
                    <span className="bg-[#80182a]/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium shadow-xs">
                      Personalizable
                    </span>
                  </div>

                  {/* Image Container */}
                  <Link
                    href={`/new-ui/product/${item.id}`}
                    className="relative overflow-hidden aspect-[4/5] bg-gray-50 block"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <Link href={`/new-ui/product/${item.id}`}>
                      <h3 className="font-serif text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-snug hover:text-[#80182a] transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mb-4 mt-auto">
                      <span className="text-lg font-bold text-gray-900 font-serif">
                        ₹{Number(item.Discounter_price).toLocaleString('en-IN')}
                      </span>
                      {item.original_price > item.Discounter_price && (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{Number(item.original_price).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            {discountPercent}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-auto">
                      <button
                        onClick={(e) => handleAddToCart(e, item)}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all duration-300 cursor-pointer ${
                          addedId === String(item.id)
                            ? 'bg-emerald-600 text-white scale-[1.02]'
                            : 'bg-[#f59e0b] text-white hover:bg-[#d97706]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {addedId === String(item.id) ? 'check_circle' : 'shopping_bag'}
                        </span>
                        {addedId === String(item.id) ? 'Added to Bag!' : 'Add to Cart'}
                      </button>

                      <a
                        href={`https://wa.me/919028502581?text=${encodeURIComponent(
                          `Hi Encender! I want to inquire/buy: ${item.name} (Price: ₹${item.Discounter_price})`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 text-gray-700 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-xs font-semibold"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-emerald-600 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.027-.478-1.614-.668-2.651-2.316-2.731-2.424-.08-.108-.65-8.66-.65-1.654 0-.787.41-1.177.556-1.336.145-.16.318-.199.424-.199.106 0 .212.001.305.006.098.005.23-.037.36.275.133.318.455 1.111.494 1.192.039.08.066.175.013.281-.053.106-.08.172-.16.265-.08.093-.168.207-.24.278-.08.079-.163.165-.07.324.093.16.413.681.885 1.102.608.542 1.121.71 1.28.79.16.079.252.066.345-.04.093-.106.398-.464.504-.623.106-.16.212-.133.358-.079.146.053.928.437 1.087.516.16.08.265.12.305.186.04.066.04.385-.104.79z" />
                        </svg>
                        Buy via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
