import ProductDetailClient from '@/components/new-ui/ProductDetailClient';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}