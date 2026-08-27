import NewUICategoryPage from '@/app/new-ui/category/[category]/page';

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  return <NewUICategoryPage params={params} />;
}
