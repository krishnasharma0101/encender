import ProductDetailClient from '@/components/new-ui/ProductDetailClient';

export default async function NewUIProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}
