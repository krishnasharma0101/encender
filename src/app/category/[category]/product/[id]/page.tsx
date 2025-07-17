import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

export default async function ProductDetailPage(props: any) {
  const { params } = props;
  // Fetch from the unified Products table, expanding images relation
  const res = await fetch(`${DIRECTUS_URL}/items/Products/${params.id}?fields=*,images.*`, { cache: 'no-store' });
  const { data: item } = await res.json();
  if (!item) return notFound();

  // Map images using directus_files_id
  const images = Array.isArray(item.images)
    ? item.images.map((img: { directus_files_id: string }) => img.directus_files_id).filter(Boolean)
    : [];

  // Map fields for frontend compatibility
  const product = {
    ...item,
    price: typeof item.Discounter_price === 'number' ? item.Discounter_price : Number(item.Discounter_price) || 0,
    originalPrice: typeof item.original_price === 'number' ? item.original_price : Number(item.original_price) || undefined,
    image: images.length > 0 ? `${DIRECTUS_URL}/assets/${images[0]}` : '',
    images: images.map((id: string) => `${DIRECTUS_URL}/assets/${id}`),
    category: Array.isArray(item.category) ? item.category.join(', ') : item.category || '',
    name: item.name || 'Product Name',
    description: item.Description || 'No description available for this product.',
    rating: item.rating || 4.5,
    reviewCount: item.reviewCount || 12,
    isNew: item.isNew || false,
    isOnSale: item.isOnSale || false,
    inStock: item.available_stock !== undefined ? item.available_stock > 0 : true,
    tags: item.tags || ['Placeholder Tag'],
  };

  return <ProductDetailClient product={product} params={params} />;
} 