"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

const CATEGORY_TREE = [
  {
    label: 'Gifting',
    children: [
      { label: 'festive gifting' },
      { label: 'Hampers' },
      {
        label: 'Personalized',
        children: [
          { label: 'Birthday gifting' },
          { label: 'Anniversary gifting' },
          { label: 'Wedding gifting' },
          { label: 'Housewarming' },
        ],
      },
      { label: 'Corporate gifting' },
    ],
  },
  {
    label: 'Jewellery',
    children: [
      { label: 'necklace' },
      { label: 'Bracelet' },
      { label: 'Earrings' },
      { label: 'Finger ring' },
      { label: 'anklet' },
    ],
  },
  { label: 'Pooja Essentials' },
  { label: 'Interior' },
  { label: 'Back To School' },
  { label: 'Daily Essentials' },
];

function flattenCategories(tree: any, prefix = ''): string[] {
  let result: string[] = [];
  for (const node of tree) {
    const path = prefix ? `${prefix} > ${node.label}` : node.label;
    result.push(path);
    if (node.children) {
      result = result.concat(flattenCategories(node.children, path));
    }
  }
  return result;
}

export default function CategoryClient({ category }: { category: string }) {
  const categoryDisplay = category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState('default');

  // Find the relevant category node
  const categoryNode = useMemo(() => CATEGORY_TREE.find(cat => cat.label.toLowerCase() === categoryDisplay.toLowerCase()), [categoryDisplay]);
  const filterTree = categoryNode && categoryNode.children ? categoryNode.children : [];
  const allCategories = useMemo(() => flattenCategories(filterTree), [filterTree]);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch(`${DIRECTUS_URL}/items/Products?limit=100&fields=*,images.*`);
      const { data } = await res.json();
      if (Array.isArray(data)) {
        const filtered = data.filter((item) =>
          Array.isArray(item.category)
            ? item.category.some((cat: string) => cat.toLowerCase() === categoryDisplay.toLowerCase())
            : false
        ).map((item) => {
          const images = Array.isArray(item.images)
            ? item.images.map((img: { directus_files_id: string }) => img.directus_files_id).filter(Boolean)
            : [];
          return {
            ...item,
            price: typeof item.Discounter_price === 'number' ? item.Discounter_price : Number(item.Discounter_price) || 0,
            image: images.length > 0 ? `${DIRECTUS_URL}/assets/${images[0]}` : '',
            images: images.map((id: string) => `${DIRECTUS_URL}/assets/${id}`),
            category: item.category,
          };
        });
        setAllProducts(filtered);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [categoryDisplay]);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    if (search.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p as any).description && (p as any).description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p =>
        Array.isArray(p.category) && selectedCategories.some(cat => p.category.includes(cat))
      );
    }
    if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
    return filtered;
  }, [allProducts, search, selectedCategories, sort]);

  function renderCategoryTree(tree: any, prefix = ''): React.ReactNode {
    return (
      <ul className="pl-2">
        {tree.map((node: any) => {
          const path = prefix ? `${prefix} > ${node.label}` : node.label;
          const checked = selectedCategories.includes(path);
          return (
            <li key={path} className="mb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setSelectedCategories(checked
                      ? selectedCategories.filter(c => c !== path)
                      : [...selectedCategories, path]);
                  }}
                />
                {node.label}
              </label>
              {node.children && renderCategoryTree(node.children, path)}
            </li>
          );
        })}
      </ul>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!loading && (!allProducts || allProducts.length === 0)) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryDisplay}
          </h1>
          <p className="text-gray-600">
            Discover our collection of {allProducts.length} products in this category
          </p>
        </div>
        <div className="flex gap-8">
          {/* Sidebar filter */}
          {filterTree.length > 0 && (
            <aside className="w-64 bg-white rounded shadow p-4 h-fit">
              <div className="font-semibold mb-2">Filters</div>
              {renderCategoryTree(filterTree)}
              <button
                className="mt-4 text-xs text-indigo-600 hover:underline"
                onClick={() => setSelectedCategories([])}
                disabled={selectedCategories.length === 0}
              >
                Clear All
              </button>
            </aside>
          )}
          <section className="flex-1">
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
            {filteredProducts.length === 0 ? (
              <div>No products found in this category.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id + categoryDisplay} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
} 