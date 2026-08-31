export function addToCart(productId: string | number, quantity: number = 1) {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('cart');
  let cart = stored ? JSON.parse(stored) : [];
  const existing = cart.find((item: any) => String(item.id) === String(productId));
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: String(productId), quantity });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  setTimeout(() => {
    window.dispatchEvent(new Event('cart-updated'));
  }, 0);
}

export function getCartQuantity(productId: string | number): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem('cart');
    const cart = stored ? JSON.parse(stored) : [];
    const existing = cart.find((item: any) => String(item.id) === String(productId));
    return existing ? Number(existing.quantity) || 0 : 0;
  } catch {
    return 0;
  }
}

export function updateCartItemQuantity(productId: string | number, delta: number) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('cart');
    let cart: any[] = stored ? JSON.parse(stored) : [];
    const idStr = String(productId);
    const existingIdx = cart.findIndex((item) => String(item.id) === idStr);
    if (existingIdx >= 0) {
      const newQty = (Number(cart[existingIdx].quantity) || 1) + delta;
      if (newQty <= 0) {
        cart.splice(existingIdx, 1);
      } else {
        cart[existingIdx].quantity = newQty;
      }
    } else if (delta > 0) {
      cart.push({ id: idStr, quantity: delta });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setTimeout(() => {
      window.dispatchEvent(new Event('cart-updated'));
    }, 0);
  } catch (err) {
    console.error('Error updating cart quantity:', err);
  }
}