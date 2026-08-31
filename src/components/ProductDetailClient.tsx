"use client";
import ProductImageGallery from './ProductImageGallery';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { addToCart } from '@/lib/cart';
import { useState, useEffect } from 'react';
import { getCategorySlug } from '@/lib/directus';

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
  allow_inquire?: boolean;
  category?: string;
  material?: string;
  coating?: string;
  makers_note?: string;
  craftsmanship_description?: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ProductDetailClientProps {
  product: ProductType;
  params?: { category?: string };
  relatedProducts?: RelatedProduct[];
}

export default function ProductDetailClient({ product, params = { category: '' }, relatedProducts }: ProductDetailClientProps) {
  const categorySlug = params?.category || '';
  const categoryDisplay = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const [quantity, setQuantity] = useState(1);
  const [fetchedRelated, setFetchedRelated] = useState<RelatedProduct[]>([]);

  // Fetch related products client-side if not provided
  useEffect(() => {
    if (relatedProducts && relatedProducts.length > 0) {
      setFetchedRelated(relatedProducts);
      return;
    }
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ? process.env.NEXT_PUBLIC_DIRECTUS_URL.replace(/\/$/, '') : '';
    fetch(`${directusUrl}/items/Products?limit=4&filter[id][_neq]=${product.id}&fields=id,name,Discounter_price,images.*,category`)
      .then(res => res.json())
      .then(data => {
        if (data?.data) {
          const items = data.data.map((item: any) => {
            const imgId = item.images?.[0]?.directus_files_id;
            return {
              id: item.id,
              name: item.name || 'Product',
              price: item.Discounter_price || 0,
              image: imgId ? `${directusUrl}/assets/${imgId}` : '',
              category: Array.isArray(item.category) ? item.category[0] : item.category || '',
            };
          });
          setFetchedRelated(items);
        }
      })
      .catch(() => {});
  }, [product.id, relatedProducts]);

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
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

  const handleBuyNow = () => {
    addToCart(product.id, quantity);
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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    const message = `Hi, I would like to inquire about ${product.name}. Here is the link: ${window.location.href}`;
    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* ─── HERO PRODUCT SECTION ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-xs tracking-wide text-gray-400 uppercase">
            <li>
              <Link href="/" className="hover:text-[#7c3aed] transition-colors">Shop</Link>
            </li>
            <li className="text-gray-300">›</li>
            {categorySlug && (
              <>
                <li>
                  <Link href={`/category/${categorySlug}`} className="hover:text-[#7c3aed] transition-colors">
                    {categoryDisplay}
                  </Link>
                </li>
                <li className="text-gray-300">›</li>
              </>
            )}
            <li className="text-gray-700 font-semibold">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Left: Product Images */}
          <ProductImageGallery
            images={product.images || []}
            alt={product.name}
            isNew={product.isNew}
          />

          {/* Right: Product Info */}
          <div className="flex flex-col gap-5">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating ?? 0) ? 'text-amber-400' : i < (product.rating ?? 0) ? 'text-amber-300' : 'text-gray-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,12.1 4.9,18.1 9.9,15.2 14.9,18.1 13.8,12.1 18.2,7.6 12.2,6.6" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.rating ?? 0}/5 based on {product.reviewCount ?? 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{Number(product.price || 0).toFixed(2)}
              </span>
              {product.originalPrice !== undefined && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{Number(product.originalPrice).toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-[15px]">
              {product.description || 'A beautifully crafted piece that combines traditional artistry with modern design. Each item is carefully made with attention to detail and premium materials.'}
            </p>

            {/* Guarantee Badge */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#7c3aed]/10">
                <svg className="w-5 h-5 text-[#7c3aed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Lifetime Guarantee</p>
                <p className="text-xs text-gray-500">On color retention and structural integrity.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-1">
              {product.allow_inquire ? (
                <>
                  {/* WhatsApp CTA */}
                  <a
                    href="#"
                    onClick={handleWhatsAppInquiry}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white py-3.5 px-6 rounded-xl font-semibold text-[15px] hover:shadow-lg hover:shadow-[#7c3aed]/25 transition-all active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Notify on WhatsApp
                  </a>
                </>
              ) : (
                <>
                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="w-full flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 py-3 px-6 rounded-xl font-semibold text-[15px] hover:bg-gray-900 hover:text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 pt-4 border-t border-gray-100 mt-2">
              <div className="flex flex-col items-center gap-1.5 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-[11px] font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-[11px] font-medium">Sustainable</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-[11px] font-medium">Artisan Made</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE CRAFTSMANSHIP SECTION ─── */}
      <section className="bg-[#faf9f7] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                The <em className="font-serif italic font-normal text-[#7c3aed]">Craftsmanship</em>
              </h2>
              <p className="text-gray-600 leading-relaxed text-[15px] max-w-lg">
                {product.craftsmanship_description || `Every ${product.name} is a labor of love. We utilize a high-pressure die-casting process with premium-grade materials, ensuring a weight that feels substantial yet balanced. The magic happens in our studio, where artisans apply two layers of heat-cured enamel to achieve that signature porcelain-like glow.`}
              </p>

              {/* Material Badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="bg-white rounded-xl px-5 py-3 border border-gray-200 shadow-sm">
                  <span className="text-[11px] uppercase tracking-widest text-[#7c3aed] font-bold block mb-0.5">Material</span>
                  <span className="text-sm font-semibold text-gray-900">{product.material || 'Premium Grade'}</span>
                </div>
                <div className="bg-white rounded-xl px-5 py-3 border border-gray-200 shadow-sm">
                  <span className="text-[11px] uppercase tracking-widest text-[#7c3aed] font-bold block mb-0.5">Coating</span>
                  <span className="text-sm font-semibold text-gray-900">{product.coating || 'Soft Enamel Finish'}</span>
                </div>
              </div>
            </div>

            {/* Right: Image Collage */}
            <div className="relative">
              {/* Decorative circle */}
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-amber-300/30 rounded-full blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {(product.images && product.images.length > 1) ? (
                  <>
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src={product.images[0]}
                        alt={`${product.name} detail 1`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg mt-8">
                      <Image
                        src={product.images[1]}
                        alt={`${product.name} detail 2`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={product.images?.[0] || product.image || ''}
                      alt={`${product.name} craftsmanship`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAKER'S NOTE SECTION ─── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#faf9f7] rounded-3xl px-8 sm:px-12 py-10 sm:py-12 relative">
            {/* Quote icon */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-serif text-[#7c3aed] leading-none select-none">&ldquo;&ldquo;</span>
              <span className="text-lg font-bold text-gray-900">Maker&apos;s Note</span>
            </div>

            <blockquote className="text-gray-600 italic leading-relaxed text-[15px] mb-6">
              &ldquo;{product.makers_note || `We wanted to create an accessory that evokes joy every time you reach for your keys. The challenge was balancing the playful design with a material longevity that usually only high-end products offer. I believe we've found that perfect harmony.`}&rdquo;
            </blockquote>

            <div className="text-sm text-gray-500">
              — <span className="font-semibold text-gray-700">Lead Designer at Encender</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DISCOVERY / RELATED PRODUCTS SECTION ─── */}
      {fetchedRelated.length > 0 && (
        <section className="pb-16 sm:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  The <em className="font-serif italic font-normal text-[#7c3aed]">Discovery</em>
                </h2>
                <p className="text-gray-500 text-sm mt-1">Curated pairings to complete your collection.</p>
              </div>
              <Link
                href="/products"
                className="text-[#7c3aed] text-sm font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {fetchedRelated.slice(0, 4).map((item) => {
                const slug = getCategorySlug(item.category);
                return (
                  <Link
                    key={item.id}
                    href={`/category/${slug}/product/${item.id}`}
                    className="group"
                  >
                    <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#7c3aed] transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm font-bold text-[#7c3aed] mt-0.5">
                      ₹{Number(item.price || 0).toFixed(2)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}