import { createDirectus, rest } from '@directus/sdk';

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isOnSale?: boolean;
  category: string;
  description: string;
  images: string[];
  inStock: boolean;
  tags: string[];
};

interface Schema {
  products: Product;
}

export const directus = createDirectus<Schema>('http://localhost:8055').with(rest()); 