'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/new-ui/Navbar';
import { fetchDirectusData } from '@/lib/fetchWithRetry';
import { getAssetUrl } from '@/lib/directus';
import { addToCart } from '@/lib/cart';
import { REAL_PRODUCTS } from '@/data/realProducts';

interface ProductDetailClientProps {
  productId?: string;
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ? process.env.NEXT_PUBLIC_DIRECTUS_URL.replace(/\/$/, '') : '';

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
  // Find real product synchronously for zero-latency SSR & CSR matching exact productId
  const currentProductData = useMemo(() => {
    const foundReal = REAL_PRODUCTS.find((p: any) => String(p.id) === String(productId)) || REAL_PRODUCTS[0];
    const catArray = Array.isArray(foundReal.category) ? foundReal.category : [foundReal.category || 'Gifting'];
    const images = foundReal.images && foundReal.images.length > 0 ? foundReal.images : [];

    return {
      id: String(foundReal.id),
      name: foundReal.name,
      Discounter_price: Number(foundReal.Discounter_price) || 299,
      original_price: Number(foundReal.original_price) || Number(foundReal.Discounter_price || 299) * 1.2,
      rating: 4.9,
      reviewCount: 36,
      category: catArray[0] || 'Gifting',
      description: foundReal.Description || 'Handcrafted premium product with authentic Indian heritage craftsmanship.',
      material: foundReal.material || 'Artisanal Handcrafted Materials',
      craftsmanship_description: foundReal.craftsmanship_description || 'Intricately handcrafted by master artisans across traditional Indian craft hubs.',
      makers_note: foundReal.makers_note || 'Every piece reflects centuries of traditional Indian artisan heritage.',
      inStock: foundReal.available_stock !== 0,
      badges: ['HANDCRAFTED', 'AUTHENTIC HERITAGE'],
      images,
    };
  }, [productId]);

  const [product, setProduct] = useState<any>(currentProductData);
  const [selectedImage, setSelectedImage] = useState<string>(currentProductData.images[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotification, setAddedNotification] = useState<boolean>(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('material');
  const [loading, setLoading] = useState<boolean>(false);

  // Sync state whenever productId changes
  useEffect(() => {
    setProduct(currentProductData);
    if (currentProductData.images.length > 0) {
      setSelectedImage(currentProductData.images[0]);
    }
  }, [currentProductData]);

  // Fallback sample product data
  const sampleProduct = {
    id: productId || 'sample-1',
    name: 'Premium Handcrafted Brass Diya Set (Personalized)',
    Discounter_price: 1299,
    original_price: 1899,
    rating: 4.9,
    reviewCount: 128,
    category: 'Pooja Essentials',
    description:
      'A highly detailed close-up of a premium, handcrafted brass diya. Intricately engraved and polished to a gleaming gold finish, crafted to bring warmth and prosperity to your home.',
    material: '100% Solid Pure Brass with Lacquer Coating',
    craftsmanship_description:
      'Handcrafted by traditional artisans using centuries-old metal casting and engraving techniques.',
  };

  const loadProductData = useCallback(async () => {
    // 1. Instantly check REAL_PRODUCTS dataset for zero-latency load
    const foundReal = REAL_PRODUCTS.find((p: any) => String(p.id) === String(productId));
    if (foundReal) {
      const catArray = Array.isArray(foundReal.category) ? foundReal.category : [foundReal.category || 'Gifting'];
      const images = foundReal.images && foundReal.images.length > 0 ? foundReal.images : [];

      const formattedReal = {
        id: String(foundReal.id),
        name: foundReal.name,
        Discounter_price: Number(foundReal.Discounter_price) || 299,
        original_price: Number(foundReal.original_price) || Number(foundReal.Discounter_price || 299) * 1.2,
        rating: 4.9,
        reviewCount: 36,
        category: catArray[0] || 'Gifting',
        description: foundReal.Description || 'Handcrafted premium product with authentic Indian heritage craftsmanship.',
        material: foundReal.material || 'Artisanal Handcrafted Materials',
        craftsmanship_description: foundReal.craftsmanship_description || 'Intricately handcrafted by master artisans across traditional Indian craft hubs.',
        makers_note: foundReal.makers_note || 'Every piece reflects centuries of traditional Indian artisan heritage.',
        inStock: foundReal.available_stock !== 0,
        badges: ['HANDCRAFTED', 'AUTHENTIC HERITAGE'],
        images,
      };

      setProduct(formattedReal);
      if (images.length > 0) {
        setSelectedImage(images[0]);
      }
      setLoading(false);
    } else {
      // Fallback matching
      setLoading(false);
    }

    // 2. Background try Directus API if configured
    if (productId && !productId.startsWith('sample')) {
      try {
        const { data, error } = await fetchDirectusData<any>(
          `${DIRECTUS_URL}/items/Products/${productId}?fields=*,images.*`
        );
        if (!error && data) {
          const imageIds = Array.isArray(data.images)
            ? data.images.map((img: any) => (typeof img === 'object' && img.directus_files_id ? img.directus_files_id : img)).filter(Boolean)
            : [];
          const imageUrls = imageIds.map((id: string) => getAssetUrl(id));
          const finalImages = imageUrls.length > 0 ? imageUrls : (foundReal?.images || []);
          const catArray = Array.isArray(data.category) ? data.category : [data.category || 'Gifting'];

          setProduct({
            id: String(data.id),
            name: data.name,
            Discounter_price: typeof data.Discounter_price === 'number' ? data.Discounter_price : Number(data.Discounter_price) || 299,
            original_price: Number(data.original_price) || Number(data.Discounter_price || 299) * 1.2,
            rating: 4.9,
            reviewCount: 48,
            category: catArray[0] || 'Gifting',
            description: data.Description || data.description || 'Handcrafted premium product.',
            material: data.material || 'Premium Indian Brass / Handcrafted Wood',
            craftsmanship_description: data.craftsmanship_description || 'Intricately handcrafted.',
            makers_note: data.makers_note || 'Artisan crafted.',
            inStock: data.available_stock !== 0,
            badges: ['HANDCRAFTED', 'AUTHENTIC HERITAGE'],
            images: finalImages,
          });
          if (finalImages.length > 0) {
            setSelectedImage(finalImages[0]);
          }
        }
      } catch (e) {
        // Directus offline, instant local dataset already rendered
      }
    }
  }, [productId]);

  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
      setAddedNotification(true);
      setTimeout(() => setAddedNotification(false), 3000);
    }
  };

  const toggleAccordion = (name: string) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-12 font-sans-body">
        <div className="animate-pulse text-[#855300] font-semibold text-lg">
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discountPercent =
    product.original_price > product.Discounter_price
      ? Math.round(
          ((product.original_price - product.Discounter_price) / product.original_price) * 100
        )
      : 0;

  const whatsappMessage = encodeURIComponent(
    `Hi, I want to order/customize: ${product.name} (₹${product.Discounter_price})`
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans antialiased flex flex-col">
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Navbar />

      {/* Main Content Layout */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 md:py-16 font-sans-body flex-grow">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/new-ui" className="hover:text-[#855300]">
            Home
          </Link>
          <span>/</span>
          <Link href="/new-ui/products" className="hover:text-[#855300]">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gallery Section (Left - 5 Cols for smaller image display) */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-w-md mx-auto lg:max-w-none w-full">
            {/* Main Feature Image */}
            <div className="relative w-full aspect-[4/3.8] max-h-[420px] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200/50">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badges?.map((badge: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 bg-[#6f46b9] text-white rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Thumbnail Selector Row */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? 'border-[#855300] shadow-sm scale-95'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info & Actions (Right - 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 lg:pl-4">
            {/* Category Tag & Title */}
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#855300] block mb-2">
                {product.category}
              </span>
              <h1 className="font-serif-heading text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-500 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-base">
                      {i < Math.floor(product.rating || 5) ? 'star' : 'star_half'}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {product.rating} ({product.reviewCount} verified reviews)
                </span>
              </div>

              {/* Pricing Display */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="font-serif-heading text-3xl font-bold text-gray-900">
                  ₹{Number(product.Discounter_price).toLocaleString('en-IN')}
                </span>
                {product.original_price > product.Discounter_price && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{Number(product.original_price).toLocaleString('en-IN')}
                    </span>
                    <span className="bg-purple-100 text-[#6f46b9] font-bold text-xs px-2.5 py-1 rounded-md">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Value Badges */}
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-4 pt-3 border-t border-gray-200">
                <span className="font-medium">✨ Free Shipping</span>
                <span>•</span>
                <span className="font-medium">🌱 Sustainable</span>
                <span>•</span>
                <span className="font-medium">🎨 Artisan Made</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 py-2">
              <span className="text-xs font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-gray-600 hover:text-black font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-gray-600 hover:text-black font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {addedNotification && (
              <div className="bg-green-100 border border-green-300 text-green-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Item added to your shopping cart!</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-sans-body font-bold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">shopping_cart</span>
                Add to Cart
              </button>

              <a
                href={`https://wa.me/919028502581?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] border border-[#25D366]/40 font-bold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                </svg>
                Order / Customization via WhatsApp
              </a>
            </div>

            {/* Accordions */}
            <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200 mt-4">
              {/* Item 1 */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('material')}
                  className="w-full flex justify-between items-center text-left font-semibold text-sm text-gray-900 hover:text-[#855300]"
                >
                  <span>Material & Specifications</span>
                  <span className="material-symbols-outlined text-gray-400">
                    {activeAccordion === 'material' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {activeAccordion === 'material' && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {product.material || 'Solid pure brass, coated with a protective lacquer to prevent oxidation and preserve high luster.'}
                  </p>
                )}
              </div>

              {/* Item 2 */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('craftsmanship')}
                  className="w-full flex justify-between items-center text-left font-semibold text-sm text-gray-900 hover:text-[#855300]"
                >
                  <span>The Craftsmanship</span>
                  <span className="material-symbols-outlined text-gray-400">
                    {activeAccordion === 'craftsmanship' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {activeAccordion === 'craftsmanship' && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {product.craftsmanship_description || 'Meticulously hand-engraved by master artisans, preserving heritage Indian metalwork traditions.'}
                  </p>
                )}
              </div>

              {/* Item 3 */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('makers_note')}
                  className="w-full flex justify-between items-center text-left font-semibold text-sm text-gray-900 hover:text-[#855300]"
                >
                  <span>Maker&apos;s Note</span>
                  <span className="material-symbols-outlined text-gray-400">
                    {activeAccordion === 'makers_note' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {activeAccordion === 'makers_note' && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {product.makers_note || 'Each product is handcrafted. Subtle variations in texture and finish are hallmarks of genuine handmade luxury.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

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
