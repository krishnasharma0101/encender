import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getAssetUrl } from '@/lib/directus';

// Server-side URL (Docker internal network)
const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://encender-backend:8055';

export default async function ProductDetailPage(props: any) {
  const { params } = props;

  let item = null;

  try {
    const res = await fetch(`${DIRECTUS_URL}/items/Products/${params.id}?fields=*,images.*`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`[ProductDetailPage] Failed to fetch product ${params.id}: HTTP ${res.status}`);
      return notFound();
    }

    const json = await res.json();
    item = json.data;
  } catch (error) {
    console.error(`[ProductDetailPage] Error fetching product ${params.id}:`, error);
    return notFound();
  }

  if (!item) return notFound();

  // Map images using directus_files_id
  const imageIds = Array.isArray(item.images)
    ? item.images.map((img: { directus_files_id: string }) => img.directus_files_id).filter(Boolean)
    : [];

  // Map fields for frontend — use same-origin asset URLs
  const product = {
    ...item,
    price: typeof item.Discounter_price === 'number' ? item.Discounter_price : Number(item.Discounter_price) || 0,
    originalPrice: typeof item.original_price === 'number' ? item.original_price : Number(item.original_price) || undefined,
    image: imageIds.length > 0 ? getAssetUrl(imageIds[0]) : '',
    images: imageIds.map((id: string) => getAssetUrl(id)),
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