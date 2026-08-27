"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { fetchDirectusData } from '@/lib/fetchWithRetry';
import { getAssetUrl, getCategorySlug } from '@/lib/directus';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

export default function CategoryClient({ category }: { category: string }) {
  const categoryDisplay = category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await fetchDirectusData<any[]>(
      `${DIRECTUS_URL}/items/Products?limit=-1&fields=*,images.*`
    );

    if (fetchError || !data) {
      setError(fetchError || 'Failed to load products');
      setLoading(false);
      return;
    }

    if (Array.isArray(data)) {
      const filtered = data.filter((item) => {
        if (!item.category) return false;
        const cats: string[] = Array.isArray(item.category)
          ? item.category
          : typeof item.category === 'string'
            ? item.category.startsWith('[') && item.category.endsWith(']')
              ? (() => { try { return JSON.parse(item.category); } catch { return [item.category]; } })()
              : item.category.split(',').map((c: string) => c.trim())
            : [String(item.category)];

        return Array.isArray(cats) && cats.some((cat: string) => {
          if (!cat || typeof cat !== 'string') return false;
          const trimmed = cat.trim();
          return (
            getCategorySlug(trimmed) === category.toLowerCase() ||
            trimmed.toLowerCase() === categoryDisplay.toLowerCase() ||
            trimmed.toLowerCase().includes(category.toLowerCase()) ||
            category.toLowerCase().includes(trimmed.toLowerCase())
          );
        });
      }).map((item) => {
        const imageIds = Array.isArray(item.images)
          ? item.images.map((img: { directus_files_id: string }) => img.directus_files_id).filter(Boolean)
          : [];
        return {
          ...item,
          price: typeof item.Discounter_price === 'number' ? item.Discounter_price : Number(item.Discounter_price) || 0,
          image: imageIds.length > 0 ? getAssetUrl(imageIds[0]) : '',
          images: imageIds.map((id: string) => getAssetUrl(id)),
          category: item.category,
          allow_inquire: !!item.allow_inquire,
        };
      });
      setAllProducts(filtered);
    }
    setLoading(false);
  }, [category, categoryDisplay]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    if (search.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p as any).description && (p as any).description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    return filtered;
  }, [allProducts, search, sort]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryDisplay}
          </h1>
          <p className="text-gray-600">
            {loading ? 'Loading products...' : `Discover our collection of ${allProducts.length} products in this category`}
          </p>
        </div>
        <div>
          <section className="w-full">
            {/* Search and sort bar */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 flex-1"
              />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="default">Sort by</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Unable to load products. Please check your connection and try again.</p>
                <button
                  onClick={fetchProducts}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* No products */}
            {!loading && !error && allProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No products found in this category yet.</p>
              </div>
            )}

            {/* Products */}
            {!loading && !error && filteredProducts.length === 0 && allProducts.length > 0 ? (
              <div>No products match your search.</div>
            ) : !loading && !error && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id + categoryDisplay} product={product} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}