import CatalogClient from '@/components/new-ui/CatalogClient';

export default async function NewUICategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = await params;
  return <CatalogClient initialCategory={resolvedParams.category} />;
}
