"use client";
import ProductImageGallery from './ProductImageGallery';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { addToCart } from '@/lib/cart';

interface ProductType {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isOnSale?: boolean;
  description?: string;
  inStock?: boolean;
  tags?: string[];
}

interface ProductDetailClientProps {
  product: ProductType;
  params?: { category?: string };
}

export default function ProductDetailClient({ product, params = { category: '' } }: ProductDetailClientProps) {
  const categorySlug = params?.category || '';
  const categoryDisplay = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  // Add a handler for add to cart with sidebar
  const handleAddToCart = () => {
    addToCart(product.id, 1);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-indigo-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-indigo-600">Products</Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/category/${categorySlug}`} className="hover:text-indigo-600">
                {categoryDisplay}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <ProductImageGallery images={product.images || []} alt={product.name} />
          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title and Badges */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.isNew && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    NEW
                  </span>
                )}
                {product.isOnSale && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    SALE
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating ?? 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,12.1 4.9,18.1 9.9,15.2 14.9,18.1 13.8,12.1 18.2,7.6 12.2,6.6 " />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating ?? 0} ({product.reviewCount ?? 0} reviews)
              </span>
            </div>
            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{Number(product.price || 0).toFixed(2)}
              </span>
              {product.originalPrice !== undefined && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
              {product.originalPrice !== undefined && (
                <span className="text-sm text-red-600 font-medium">
                  Save ₹{(Number(product.originalPrice) - Number(product.price)).toFixed(2)}
                </span>
              )}
            </div>
            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {product.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-900">-</button>
                  <span className="px-4 py-2 border-x border-gray-300">1</span>
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-900">+</button>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 