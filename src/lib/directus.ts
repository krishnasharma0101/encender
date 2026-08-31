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
  allow_inquire?: boolean;
  material?: string;
  coating?: string;
  makers_note?: string;
  craftsmanship_description?: string;
};

interface Schema {
  products: Product;
}

// Server-side Directus client (uses Docker internal network)
export const directus = createDirectus<Schema>('http://encender-backend:8055').with(rest());

// Public URL for client-side API calls (product data)
export const DIRECTUS_PUBLIC_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

// Asset URL helper
// In production: Nginx proxies /assets/ to Directus (same-origin)
// In development: uses NEXT_PUBLIC_DIRECTUS_URL (http://localhost:8055)
export function getAssetUrl(fileId: string): string {
  if (!fileId) return '';
  if (fileId.startsWith('/') || fileId.startsWith('http')) return fileId;
  const base = DIRECTUS_PUBLIC_URL ? DIRECTUS_PUBLIC_URL.replace(/\/$/, '') : '';
  return `${base}/assets/${fileId}`;
}

/**
 * Safely converts any category representation (string, array, comma-separated list, JSON)
 * into a URL-friendly slug. Never returns "undefined".
 */
export function getCategorySlug(categoryInput: any): string {
  if (!categoryInput) return 'products';
  
  let categoryStr = '';
  
  // 1. Extract a string representation
  if (Array.isArray(categoryInput)) {
    // Take the first non-empty element
    const first = categoryInput.find(c => typeof c === 'string' && c.trim() !== '');
    categoryStr = first || '';
  } else if (typeof categoryInput === 'string') {
    // If it's a JSON array representation (e.g. '["Gifting"]')
    if (categoryInput.startsWith('[') && categoryInput.endsWith(']')) {
      try {
        const parsed = JSON.parse(categoryInput);
        if (Array.isArray(parsed) && parsed.length > 0) {
          categoryStr = parsed[0] || '';
        }
      } catch {
        categoryStr = categoryInput;
      }
    } else {
      // If it's a comma-separated list, take the first one
      categoryStr = categoryInput.split(',')[0] || '';
    }
  } else if (categoryInput && typeof categoryInput === 'object') {
    // For general object types, try stringifying or string representation
    categoryStr = String(categoryInput);
  }
  
  categoryStr = categoryStr.trim();
  if (!categoryStr) return 'products';

  // 2. Map known categories to their corresponding slugs
  const lower = categoryStr.toLowerCase();
  
  // Gifting maps
  if (lower.includes('gift') || lower.includes('hamper')) {
    return 'gifting';
  }
  // Pooja Essentials maps
  if (lower.includes('pooja') || lower.includes('festive')) {
    return 'pooja-essentials';
  }
  // Jewellery maps
  if (lower.includes('jewel')) {
    return 'jewellery';
  }
  // Daily Essentials maps
  if (lower.includes('daily') || lower.includes('essential')) {
    return 'daily-essentials';
  }
  // Back to school maps
  if (lower.includes('school') || lower.includes('calendar') || lower.includes('diary')) {
    return 'back-to-school';
  }
  // Interior maps
  if (lower.includes('interior') || lower.includes('decor') || lower.includes('hanging') || lower.includes('showpiece') || lower.includes('chime') || lower.includes('sculpture')) {
    return 'interior';
  }

  // 3. Fallback: URL slugify the string
  return categoryStr
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-'); // collapse double hyphens
}