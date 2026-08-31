'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/new-ui/Navbar';
import { fetchDirectusData } from '@/lib/fetchWithRetry';
import { getAssetUrl, getCategorySlug } from '@/lib/directus';

import { REAL_PRODUCTS } from '@/data/realProducts';
import { addToCart } from '@/lib/cart';
import { getWishlist, toggleWishlist as toggleWishlistStorage } from '@/lib/wishlist';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ? process.env.NEXT_PUBLIC_DIRECTUS_URL.replace(/\/$/, '') : '';

interface CatalogClientProps {
  initialCategory?: string;
}

// Map REAL_PRODUCTS into catalog format
const FORMATTED_REAL_PRODUCTS = REAL_PRODUCTS.map((item: any) => {
  const catArray = Array.isArray(item.category) ? item.category : [item.category || 'Gifting'];
  const mainCat = catArray[0] || 'Gifting';
  return {
    id: String(item.id),
    name: item.name,
    Discounter_price: Number(item.Discounter_price) || 299,
    original_price: Number(item.original_price) || Number(item.Discounter_price || 299) * 1.15,
    category: mainCat,
    categories: catArray,
    description: item.Description || '',
    badge: item.is_for_homepage ? 'Featured' : '',
    inStock: item.available_stock !== 0,
    image: item.images && item.images.length > 0 ? item.images[0] : '/uploads/00bff452-677b-45ee-9673-1077bb3a7fe8.jpg',
    images: item.images || ['/uploads/00bff452-677b-45ee-9673-1077bb3a7fe8.jpg'],
  };
});

const ITEMS_PER_PAGE = 50;

export default function CatalogClient({ initialCategory = 'all' }: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [toastProduct, setToastProduct] = useState<{ id: string; name: string } | null>(null);

  const [products, setProducts] = useState<any[]>(FORMATTED_REAL_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Fetch real Directus products with fallback to formatted real products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchDirectusData<any[]>(
      `${DIRECTUS_URL}/items/Products?limit=-1&fields=*,images.*`
    );

    if (!error && Array.isArray(data) && data.length > 0) {
      const formatted = data.map((item) => {
        const foundReal = FORMATTED_REAL_PRODUCTS.find((p) => String(p.id) === String(item.id));
        const imageIds = Array.isArray(item.images)
          ? item.images.map((img: any) => (typeof img === 'object' && img.directus_files_id ? img.directus_files_id : img)).filter(Boolean)
          : [];
        const catArray = Array.isArray(item.category) ? item.category : [item.category || 'Gifting'];
        const fallbackImages = foundReal?.images || ['/uploads/00bff452-677b-45ee-9673-1077bb3a7fe8.jpg'];
        const images = imageIds.length > 0 ? imageIds.map((id: string) => getAssetUrl(id)) : fallbackImages;

        return {
          id: String(item.id),
          name: item.name,
          Discounter_price: typeof item.Discounter_price === 'number' ? item.Discounter_price : Number(item.Discounter_price) || 0,
          original_price: Number(item.original_price) || Number(item.Discounter_price) * 1.15,
          category: catArray[0] || 'Gifting',
          categories: catArray,
          description: item.Description || item.description || '',
    badge: item.badge || (item.is_for_homepage ? 'Featured' : ''),
          inStock: item.inStock !== false,
          image: images[0],
          images: images,
        };
      });
      setProducts(formatted);
    } else {
      setProducts(FORMATTED_REAL_PRODUCTS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Sync wishlist from storage
  useEffect(() => {
    const syncWishlist = () => {
      const ids = getWishlist();
      const map: Record<string, boolean> = {};
      ids.forEach((id) => {
        map[id] = true;
      });
      setWishlist(map);
    };
    syncWishlist();
    window.addEventListener('wishlist-updated', syncWishlist);
    window.addEventListener('storage', syncWishlist);
    return () => {
      window.removeEventListener('wishlist-updated', syncWishlist);
      window.removeEventListener('storage', syncWishlist);
    };
  }, []);

  // Handle wishlist toggle
  const toggleWishlist = (id: string) => {
    toggleWishlistStorage(id);
  };

  // Clear all active filters
  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // 1. Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      const slugTarget = selectedCategory.toLowerCase();
      list = list.filter((p) => {
        const catArray = Array.isArray(p.categories)
          ? p.categories
          : Array.isArray(p.category)
          ? p.category
          : [p.category || ''];
        return catArray.some((catItem: any) => {
          if (!catItem) return false;
          const catStr = String(catItem).toLowerCase();
          const pCategorySlug = getCategorySlug(catStr);
          return (
            pCategorySlug === slugTarget ||
            catStr.includes(slugTarget) ||
            slugTarget.includes(catStr) ||
            (slugTarget === 'pooja-essentials' && catStr.includes('pooja')) ||
            (slugTarget === 'gifting' && catStr.includes('gift')) ||
            (slugTarget === 'daily-essentials' && catStr.includes('daily')) ||
            (slugTarget === 'back-to-school' && catStr.includes('school'))
          );
        });
      });
    }

    // 2. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 3. Price Filter
    if (minPrice !== '') {
      list = list.filter((p) => p.Discounter_price >= Number(minPrice));
    }
    if (maxPrice !== '') {
      list = list.filter((p) => p.Discounter_price <= Number(maxPrice));
    }

    // 4. In Stock Filter
    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    // 5. Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.Discounter_price - b.Discounter_price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.Discounter_price - a.Discounter_price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    }

    return list;
  }, [products, selectedCategory, search, minPrice, maxPrice, inStockOnly, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, search, minPrice, maxPrice, inStockOnly, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(String(product.id), 1);
    setAddedId(String(product.id));
    setToastProduct({ id: String(product.id), name: product.name });
    setTimeout(() => {
      setAddedId((prev) => (prev === String(product.id) ? null : prev));
    }, 1800);
    setTimeout(() => {
      setToastProduct((prev) => (prev?.id === String(product.id) ? null : prev));
    }, 3500);
  };

  // Page title mapping based on selected category
  const pageTitle = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return 'Shop All Collections';
    return selectedCategory
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [selectedCategory]);

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

      {/* Main Content Layout (Sidebar + Catalog) */}
      <main className="flex-grow flex w-full max-w-[1280px] mx-auto px-4 md:px-10 py-10 gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200/60 font-sans-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif-heading font-bold text-lg text-gray-900">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-xs text-[#855300] font-semibold hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter Pills / Checkboxes */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {[
                  { label: 'All Collections', slug: 'all' },
                  { label: 'Gifting', slug: 'gifting' },
                  { label: 'Pooja Essentials', slug: 'pooja-essentials' },
                  { label: 'Jewellery', slug: 'jewellery' },
                  { label: 'Interior Decor', slug: 'interior' },
                  { label: 'Daily Essentials', slug: 'daily-essentials' },
                  { label: 'Back to School', slug: 'back-to-school' },
                ].map((cat) => (
                  <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="categoryFilter"
                      checked={selectedCategory.toLowerCase() === cat.slug}
                      onChange={() => setSelectedCategory(cat.slug)}
                      className="accent-[#855300] cursor-pointer"
                    />
                    <span
                      className={`group-hover:text-[#855300] transition-colors ${
                        selectedCategory.toLowerCase() === cat.slug ? 'font-bold text-[#855300]' : ''
                      }`}
                    >
                      {cat.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6 border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Price Range (₹)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#855300] focus:ring-1 focus:ring-[#855300] outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:border-[#855300] focus:ring-1 focus:ring-[#855300] outline-none"
                />
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#855300] cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Catalog Main Grid Area */}
        <div className="flex-1 w-full font-sans-body">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#6f46b9] font-bold block mb-1">
                Authentic Craftsmanship
              </span>
              <h1 className="font-serif-heading text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {pageTitle}
              </h1>
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} items curated for your home and special moments.
              </p>
            </div>

            {/* Search, Filter & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto max-w-full">
              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-900 focus:border-[#855300] focus:ring-1 focus:ring-[#855300] outline-none w-full"
                />
              </div>

              {/* Custom Sort Dropdown */}
              <div className="relative w-full sm:w-auto min-w-[160px]">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-semibold text-gray-800 flex items-center justify-between gap-2 shadow-xs hover:border-[#855300] transition-colors cursor-pointer"
                >
                  <span className="truncate">
                    {sortBy === 'price-asc'
                      ? 'Price: Low to High'
                      : sortBy === 'price-desc'
                      ? 'Price: High to Low'
                      : sortBy === 'newest'
                      ? 'Newest Arrivals'
                      : 'Sort: Popularity'}
                  </span>
                  <span className="material-symbols-outlined text-gray-400 text-sm shrink-0">
                    {sortOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-full min-w-[170px] bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 font-sans-body animate-in fade-in slide-in-from-top-1 duration-150">
                      {[
                        { label: 'Sort: Popularity', value: 'popularity' },
                        { label: 'Price: Low to High', value: 'price-asc' },
                        { label: 'Price: High to Low', value: 'price-desc' },
                        { label: 'Newest Arrivals', value: 'newest' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                            sortBy === option.value
                              ? 'bg-[#855300]/10 text-[#855300]'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{option.label}</span>
                          {sortBy === option.value && (
                            <span className="material-symbols-outlined text-xs">check</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">search_off</span>
              <h3 className="font-serif-heading text-xl font-bold text-gray-800 mb-2">
                No products found
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                No items match your selected filters. Try clearing your search or adjusting your price filters.
              </p>
              <button
                onClick={clearFilters}
                className="bg-[#855300] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#653e00] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full"
                  >
                    {/* Product Image */}
                    <Link href={`/new-ui/product/${product.id}`} className="relative aspect-square sm:aspect-[4/4.5] overflow-hidden bg-gray-50 block">
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0]
                            : product.image
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-sm shadow-xs transition-colors ${
                          wishlist[product.id]
                            ? 'bg-red-50 text-red-500'
                            : 'bg-white/80 text-gray-600 hover:text-[#855300]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs sm:text-sm">
                          {wishlist[product.id] ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                    </Link>

                    {/* Product Details */}
                    <div className="p-2.5 sm:p-5 flex flex-col flex-grow">
                      <span className="text-[9px] sm:text-[11px] uppercase tracking-wider font-bold text-[#855300] mb-0.5 sm:mb-1">
                        {product.category}
                      </span>
                      <Link href={`/new-ui/product/${product.id}`} className="hover:text-[#855300] transition-colors">
                        <h3 className="font-sans-body font-semibold sm:font-bold text-xs sm:text-base text-gray-900 mb-1 sm:mb-2 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="mt-auto pt-1.5 sm:pt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                          <span className="font-serif-heading font-bold text-sm sm:text-xl text-gray-900">
                            ₹{Number(product.Discounter_price).toLocaleString('en-IN')}
                          </span>
                          {product.original_price > product.Discounter_price && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                              ₹{Number(product.original_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="p-2.5 sm:p-4 pt-0">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-2 shadow-xs transition-all duration-300 cursor-pointer ${
                          addedId === String(product.id)
                            ? 'bg-emerald-600 text-white scale-[1.02] shadow-emerald-200'
                            : 'bg-[#f59e0b] text-white hover:bg-[#d97706] active:scale-95'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs sm:text-base">
                          {addedId === String(product.id) ? 'check_circle' : 'shopping_bag'}
                        </span>
                        {addedId === String(product.id) ? 'Added to Bag!' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls Bar */}
              {filteredProducts.length > ITEMS_PER_PAGE && (
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-gray-100 shadow-xs font-sans-body">
                  <div className="text-xs font-semibold text-gray-500">
                    Showing <span className="text-gray-900 font-bold">{startIndex + 1}</span>–
                    <span className="text-gray-900 font-bold">{Math.min(endIndex, filteredProducts.length)}</span> of{' '}
                    <span className="text-gray-900 font-bold">{filteredProducts.length}</span> products
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-gray-200 hover:border-[#855300] hover:text-[#855300] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors text-gray-700 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Previous Page"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 text-xs font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#855300] text-white shadow-xs'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/60'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Page Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-gray-200 hover:border-[#855300] hover:text-[#855300] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-colors text-gray-700 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Next Page"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Added to Cart Floating Toast Notification */}
      {toastProduct && (
        <div className="fixed bottom-6 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="bg-[#1a1c1a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[11px] text-gray-400 font-medium leading-none mb-1">Added to Shopping Bag</p>
              <p className="text-xs font-bold text-white truncate">{toastProduct.name}</p>
            </div>
            <Link
              href="/cart"
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0 shadow-xs"
            >
              View Bag
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-6 space-y-6 max-h-[85vh] overflow-y-auto font-sans-body shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="font-serif-heading font-bold text-xl text-gray-900">Filter Products</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Categories</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'All Collections', slug: 'all' },
                  { label: 'Gifting', slug: 'gifting' },
                  { label: 'Pooja Essentials', slug: 'pooja-essentials' },
                  { label: 'Jewellery', slug: 'jewellery' },
                  { label: 'Interior Decor', slug: 'interior' },
                  { label: 'Daily Essentials', slug: 'daily-essentials' },
                  { label: 'Back to School', slug: 'back-to-school' },
                ].map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`py-2 px-3 rounded-xl border text-left font-semibold transition-all ${
                      selectedCategory.toLowerCase() === cat.slug
                        ? 'bg-[#855300] text-white border-[#855300]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-400 mb-3">Price Range (₹)</h3>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#855300]"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#855300]"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  clearFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-1/3 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-2/3 py-3 rounded-xl bg-[#855300] text-white font-bold text-xs hover:bg-[#653e00] shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
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
