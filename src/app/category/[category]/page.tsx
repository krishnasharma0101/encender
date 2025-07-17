import CategoryClient from '@/components/CategoryClient';

export default function CategoryPage(props: any) {
  return <CategoryClient category={props.params.category} />;
}
