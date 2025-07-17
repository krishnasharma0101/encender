'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart } from '@/lib/cart';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Accept images array for gallery/slider
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isOnSale?: boolean;
  category: string; // Added category to the interface
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onAddToWishlist }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered && product.images && product.images.length > 1) {
      hoverTimeout.current = setTimeout(() => {
        setActiveImage(1);
      }, 500); // 500ms delay
    } else {
      setActiveImage(0);
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = null;
      }
    }
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = null;
      }
    };
  }, [isHovered, product.images]);

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product);
  };

  const handleAddToCart = () => {
    onAddToCart?.(product);
    // Add to cart logic
    addToCart(product.id, 1);
    // Cache product info for sidebar
    if (typeof window !== 'undefined') {
      const cacheRaw = localStorage.getItem('productCache');
      let cache: Record<string, { name: string; price: number; image?: string }> = {};
      if (cacheRaw) cache = JSON.parse(cacheRaw);
      cache[product.id] = {
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : product.image,
      };
      localStorage.setItem('productCache', JSON.stringify(cache));
      window.dispatchEvent(new Event('open-cart-sidebar'));
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const collectionToSlug: Record<string, string> = {
    'gifts': 'gifting',
    'Pooja_Essentials': 'pooja-essentials',
    'Jewellery': 'jewellery',
    'Interior': 'interior',
    'Daily_Essentials': 'daily-essentials',
    'Back_to_school': 'back-to-school',
  };

  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
            <div className="relative">
        <Link href={`/category/${collectionToSlug[product.category]}/product/${product.id}`} className="block">
          {/* Product Image (auto-slide on hover) */}
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[activeImage] || product.images[0]}
              alt={product.name}
              width={400}
              height={300}
              className="object-cover w-full h-48 rounded-t-lg"
            />
          ) : product.image ? (
            <Image src={product.image} alt={product.name} width={400} height={300} className="object-cover w-full h-48 rounded-t-lg" />
          ) : (
            <div className="bg-gray-100 w-full h-48 flex items-center justify-center text-gray-400 rounded-t-lg">No Image</div>
          )}

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-indigo-600">
                ₹{Number(product.price || 0).toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm line-through text-gray-400">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
            isWishlisted 
              ? 'bg-red-500 text-white' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add to Cart */}
        <div className={`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 transform transition-transform duration-300 z-10 ${
          isHovered ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <button
            onClick={handleAddToCart}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
} 