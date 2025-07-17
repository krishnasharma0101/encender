export function addToCart(productId: string, quantity: number = 1) {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('cart');
  let cart = stored ? JSON.parse(stored) : [];
  const existing = cart.find((item: any) => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
} 