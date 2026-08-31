export function addToCart(productId: string, quantity: number = 1) {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('cart');
  let cart = stored ? JSON.parse(stored) : [];
  const existing = cart.find((item: any) => String(item.id) === String(productId));
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: String(productId), quantity });
  }
  setTimeout(() => {
    window.dispatchEvent(new Event('cart-updated'));
  }, 0);
} 