export function getWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function isInWishlist(productId: string | number): boolean {
  if (typeof window === 'undefined') return false;
  const list = getWishlist();
  return list.includes(String(productId));
}

export function toggleWishlist(productId: string | number): boolean {
  if (typeof window === 'undefined') return false;
  const idStr = String(productId);
  let list = getWishlist();
  const exists = list.includes(idStr);
  if (exists) {
    list = list.filter((id) => id !== idStr);
  } else {
    list.push(idStr);
  }
  localStorage.setItem('wishlist', JSON.stringify(list));
  setTimeout(() => {
    window.dispatchEvent(new Event('wishlist-updated'));
  }, 0);
  return !exists;
}

export function removeFromWishlist(productId: string | number) {
  if (typeof window === 'undefined') return;
  const idStr = String(productId);
  let list = getWishlist();
  list = list.filter((id) => id !== idStr);
  localStorage.setItem('wishlist', JSON.stringify(list));
  setTimeout(() => {
    window.dispatchEvent(new Event('wishlist-updated'));
  }, 0);
}

export function clearWishlist() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('wishlist');
  setTimeout(() => {
    window.dispatchEvent(new Event('wishlist-updated'));
  }, 0);
}
