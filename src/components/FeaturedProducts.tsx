'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useEffect, useState } from 'react';
import { fetchDirectusData } from '@/lib/fetchWithRetry';
import { getAssetUrl } from '@/lib/directus';

// Define Product type for state
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isOnSale?: boolean;
  category: string;
  description: string;
  inStock: boolean;
  tags: string[];
  allow_inquire?: boolean;
}

// Define DirectusProduct type for API response
interface DirectusProduct {
  id: string | number;
  name?: string;
  Discounter_price?: number | string;
  original_price?: number | string;
  images?: { directus_files_id: string }[];
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isOnSale?: boolean;
  category?: string;
  Description?: string;
  available_stock?: number;
  tags?: string[];
  allow_inquire?: boolean;
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await fetchDirectusData<DirectusProduct[]>(
        `${DIRECTUS_URL}/items/Products?filter[is_for_homepage][_eq]=true&fields=*,images.*&limit=6`
      );

      if (fetchError || !data) {
        setError(fetchError || 'Failed to load products');
        setLoading(false);
        return;
      }

      if (Array.isArray(data)) {
        setFeaturedProducts(
          data.map((item: DirectusProduct) => {
            const imageIds = Array.isArray(item.images)
              ? item.images.map((img) => img.directus_files_id).filter(Boolean)
              : [];
            return {
              id: String(item.id),
              name: item.name || 'Product',
              price: typeof item.Discounter_price === 'number' ? item.Discounter_price : Number(item.Discounter_price) || 0,
              originalPrice: typeof item.original_price === 'number' ? item.original_price : Number(item.original_price) || undefined,
              image: imageIds.length > 0 ? getAssetUrl(imageIds[0]) : '',
              images: imageIds.map((id: string) => getAssetUrl(id)),
              rating: item.rating || 4.5,
              reviewCount: item.reviewCount || 12,
              isNew: item.isNew || false,
              isOnSale: item.isOnSale || false,
              category: item.category || '',
              description: item.Description || '',
              inStock: item.available_stock !== undefined ? item.available_stock > 0 : true,
              tags: item.tags || [],
              allow_inquire: item.allow_inquire || false,
            };
          })
        );
      }
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of products featured on our homepage
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State with Retry */}
        {error && !loading && (
          <div className="text-center py-12 mb-12">
            <p className="text-gray-600 mb-4">Unable to load featured products. Please check your connection.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(product) => {
                  console.log('Added to cart:', product.name);
                }}
                onAddToWishlist={(product) => {
                  console.log('Added to wishlist:', product.name);
                }}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}