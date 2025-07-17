export interface Product {
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
  is_for_homepage?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Personalized Photo Frame',
    price: 899,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 128,
    isOnSale: true,
    category: 'Customized Gifts',
    description: 'Beautiful personalized photo frame with custom engraving, perfect for gifting on special occasions.',
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    ],
    inStock: true,
    tags: ['personalized', 'photo frame', 'engraved', 'gift'],
    is_for_homepage: true
  },
  {
    id: '2',
    name: 'Handcrafted Ceramic Mug Set',
    price: 599,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    rating: 4.2,
    reviewCount: 89,
    isNew: true,
    category: 'Handicrafts',
    description: 'Traditional handcrafted ceramic mug set with beautiful Indian designs, perfect for tea lovers.',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop',
    ],
    inStock: true,
    tags: ['handcrafted', 'ceramic', 'traditional', 'tea'],
    is_for_homepage: true
  },
  {
    id: '3',
    name: 'Custom Name Necklace',
    price: 1499,
    originalPrice: 1999,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 256,
    isOnSale: true,
    category: 'Personalized Items',
    description: 'Elegant custom name necklace with sterling silver chain, perfect for birthdays and anniversaries.',
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    ],
    inStock: true,
    tags: ['custom', 'necklace', 'silver', 'jewelry'],
    is_for_homepage: true
  },
  {
    id: '4',
    name: 'Personalized Diary with Name',
    price: 399,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
    rating: 4.3,
    reviewCount: 67,
    category: 'Customized Gifts',
    description: 'Premium leather diary with personalized name embossing, ideal for students and professionals.',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    ],
    inStock: true,
    tags: ['diary', 'leather', 'personalized', 'embossed']
  },
  {
    id: '5',
    name: 'Corporate Gift Hamper',
    price: 2499,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 143,
    isOnSale: true,
    category: 'Corporate Gifts',
    description: 'Premium corporate gift hamper with branded items, perfect for business clients and partners.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    ],
    inStock: true,
    tags: ['corporate', 'hamper', 'business', 'premium'],
    is_for_homepage: true
  },
  {
    id: '6',
    name: 'Handwoven Silk Scarf',
    price: 899,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    rating: 4.4,
    reviewCount: 92,
    category: 'Handicrafts',
    description: 'Traditional handwoven silk scarf with intricate designs, a perfect gift for fashion lovers.',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    ],
    inStock: true,
    tags: ['silk', 'handwoven', 'traditional', 'scarf'],
    is_for_homepage: true
  },
  {
    id: '7',
    name: 'Custom Birthday Cake Topper',
    price: 299,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    rating: 4.1,
    reviewCount: 78,
    isOnSale: true,
    category: 'Special Occasions',
    description: 'Personalized birthday cake topper with custom name and age, makes every birthday special.',
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    ],
    inStock: true,
    tags: ['birthday', 'cake topper', 'custom', 'celebration'],
    is_for_homepage: true
  },
  {
    id: '8',
    name: 'Personalized Keychain Set',
    price: 199,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 156,
    isNew: true,
    category: 'Personalized Items',
    description: 'Set of 3 personalized keychains with custom names, perfect for friends and family.',
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop',
    ],
    inStock: true,
    tags: ['keychain', 'personalized', 'set', 'accessories'],
    is_for_homepage: true
  }
];

export const categories = [
  { name: 'Gifting', slug: 'gifting', count: 45 },
  { name: 'Pooja Essentials', slug: 'pooja-essentials', count: 32 },
  { name: 'Jewellery', slug: 'jewellery', count: 28 },
  { name: 'Daily Essentials', slug: 'daily-essentials', count: 19 },
  { name: 'Back to School', slug: 'back-to-school', count: 15 },
  { name: 'Interior', slug: 'interior', count: 10 },
];

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
};

export const getFeaturedProducts = () => {
  return products.filter(product => product.is_for_homepage).slice(0, 6);
};

export const getProductById = (id: string) => {
  return products.find(product => product.id === id);
}; 