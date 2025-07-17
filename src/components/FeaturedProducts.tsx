'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useEffect, useState } from 'react';

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
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      const res = await fetch(
        `${DIRECTUS_URL}/items/Products?filter[is_for_homepage][_eq]=true&fields=*,images.*&limit=6`
      );
      const { data } = await res.json();
      if (Array.isArray(data)) {
        setFeaturedProducts(
          data.map((item: DirectusProduct) => {
            const images = Array.isArray(item.images)
              ? item.images.map((img) => img.directus_files_id).filter(Boolean)
              : [];
            return {
              id: String(item.id),
              name: item.name || 'Product',
              price: typeof item.Discounter_price === 'number' ? item.Discounter_price : Number(item.Discounter_price) || 0,
              originalPrice: typeof item.original_price === 'number' ? item.original_price : Number(item.original_price) || undefined,
              image: images.length > 0 ? `${DIRECTUS_URL}/assets/${images[0]}` : '',
              images: images.map((id: string) => `${DIRECTUS_URL}/assets/${id}`),
              rating: item.rating || 4.5,
              reviewCount: item.reviewCount || 12,
              isNew: item.isNew || false,
              isOnSale: item.isOnSale || false,
              category: item.category || '',
              description: item.Description || '',
              inStock: item.available_stock !== undefined ? item.available_stock > 0 : true,
              tags: item.tags || [],
            };
          })
        );
      }
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(product) => {
                console.log('Added to cart:', product.name);
                // TODO: Implement cart functionality
              }}
              onAddToWishlist={(product) => {
                console.log('Added to wishlist:', product.name);
                // TODO: Implement wishlist functionality
              }}
            />
          ))}
        </div>

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