"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Modal from '@/components/Modal';
import { useSession } from 'next-auth/react';
import { Dialog } from '@headlessui/react';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

// Cart item type: only id and quantity are stored
interface CartItem {
  id: string;
  quantity: number;
}

// Product type for display
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

// Utility to load Razorpay SDK
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPage() {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    const parsed = stored ? (JSON.parse(stored) as { id: string | number; quantity: number }[]).map((item) => ({ ...item, id: String(item.id) })) : [];
    console.log('Initial cartItems state:', parsed);
    return parsed;
  });
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<{ code: string; percentage: number } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Listen for localStorage changes (e.g., from Add to Cart on other pages)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'cart') {
        const stored = event.newValue;
        const parsed = stored ? (JSON.parse(stored) as { id: string | number; quantity: number }[]).map((item) => ({ ...item, id: String(item.id) })) : [];
        setCartItems(parsed);
        console.log('Cart updated from storage event:', parsed);
      }
    };
    window.addEventListener('storage', handleStorage);

    // Also re-hydrate on page focus (for single-tab usage)
    const handleFocus = () => {
      const stored = localStorage.getItem('cart');
      const parsed = stored ? (JSON.parse(stored) as { id: string | number; quantity: number }[]).map((item) => ({ ...item, id: String(item.id) })) : [];
      setCartItems(parsed);
      console.log('Cart updated from page focus:', parsed);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    if (stored) {
      // Always store IDs as strings
      const parsed = (JSON.parse(stored) as { id: string | number; quantity: number }[]).map((item) => ({ ...item, id: String(item.id) }));
      setCartItems(parsed);
      console.log('Loaded cartItems from localStorage:', parsed);
    }
    setLoading(false);
  }, []);

  // Fetch product details for all items in the cart
  useEffect(() => {
    if (cartItems.length === 0) return;
    const fetchProducts = async () => {
      const ids = cartItems.map(item => String(item.id));
      if (ids.length === 0) return;
      const fetchUrl = `${DIRECTUS_URL}/items/Products?fields=*,images.*&limit=100&filter[id][_in]=${ids.join(',')}`;
      console.log('Fetching products with URL:', fetchUrl);
      try {
        const res = await fetch(fetchUrl);
        const json = await res.json();
        const data = json.data;
        if (!Array.isArray(data)) {
          console.error('Failed to fetch products:', json);
          return;
        }
        console.log('Fetched product data:', data);
        const productMap: Record<string, Product> = {};
        for (const item of data as Array<{ id: string | number; name?: string; Discounter_price?: number | string; original_price?: number | string; images?: { directus_files_id: string }[]; }>) {
          const images = Array.isArray(item.images)
            ? item.images.map((img) => img.directus_files_id).filter(Boolean)
            : [];
          productMap[String(item.id)] = {
            id: String(item.id),
            name: item.name || 'Product',
            price: typeof item.Discounter_price === 'number' ? item.Discounter_price : Number(item.Discounter_price) || 0,
            originalPrice: typeof item.original_price === 'number' ? item.original_price : Number(item.original_price) || undefined,
            image: images.length > 0 ? `${DIRECTUS_URL}/assets/${images[0]}` : '',
          };
        }
        setProducts(productMap);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, [cartItems]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Always store IDs as strings
      localStorage.setItem('cart', JSON.stringify(cartItems.map(item => ({ ...item, id: String(item.id) }))));
      console.log('Saved cartItems to localStorage:', cartItems);
    }
  }, [cartItems]);

  // Fetch addresses for user
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!session?.user?.email) return;
      // Fetch user from Directus by email
      const userRes = await fetch(`${DIRECTUS_URL}/items/user?filter[email][_eq]=${session.user.email}`);
      const userJson = await userRes.json();
      const user = userJson.data && userJson.data[0];
      if (!user) return;
      // Fetch addresses for user
      const res = await fetch(`${DIRECTUS_URL}/items/addresses?filter[user][_eq]=${user.id}`);
      const json = await res.json();
      setAddresses(json.data || []);
      if (json.data && json.data.length > 0) {
        const def = json.data.find((a: any) => a.is_default) || json.data[0];
        setSelectedAddressId(def.id);
      }
    };
    fetchAddresses();
  }, [session]);
  // Add new address
  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.email) return;
    // Fetch user from Directus by email
    const userRes = await fetch(`${DIRECTUS_URL}/items/user?filter[email][_eq]=${session.user.email}`);
    const userJson = await userRes.json();
    const user = userJson.data && userJson.data[0];
    if (!user) return;
    // Save address
    await fetch(`${DIRECTUS_URL}/items/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addressForm, user: user.id }),
    });
    setAddressModalOpen(false);
    setAddressForm({ phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '', is_default: false });
    // Refresh addresses
    const res = await fetch(`${DIRECTUS_URL}/items/addresses?filter[user][_eq]=${user.id}`);
    const json = await res.json();
    setAddresses(json.data || []);
    if (json.data && json.data.length > 0) {
      setSelectedAddressId(json.data[json.data.length - 1].id);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items => {
      const updated = items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      console.log('updateQuantity called. New cartItems:', updated);
      return updated;
    });
  };

  // Show confirmation modal before removing
  const confirmRemoveItem = (itemId: string) => {
    setPendingRemoveId(itemId);
  };

  const handleRemoveConfirmed = () => {
    if (pendingRemoveId) {
      setCartItems(items => {
        const updated = items.filter(item => item.id !== pendingRemoveId);
        console.log('removeItem confirmed. New cartItems:', updated);
        return updated;
      });
      setPendingRemoveId(null);
    }
  };

  const handleRemoveCancelled = () => {
    setPendingRemoveId(null);
  };

  // Discount code apply handler
  const handleApplyDiscount = async () => {
    setApplyingDiscount(true);
    setDiscountError(null);
    setDiscountInfo(null);
    try {
      const res = await fetch(`${DIRECTUS_URL}/items/discount?filter[discount_code][_eq]=${encodeURIComponent(discountCode.trim())}`);
      const json = await res.json();
      const found = json.data && json.data[0];
      if (found) {
        setDiscountInfo({ code: found.discount_code, percentage: found.percentage });
      } else {
        setDiscountError('Invalid or expired code.');
      }
    } catch {
      setDiscountError('Error checking code.');
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Razorpay payment handler
  const handleRazorpayPayment = async () => {
    // Calculate total (including discount, shipping, tax)
    const subtotal = mergedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discountInfo ? (subtotal * (discountInfo.percentage / 100)) : 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const shipping = mergedCart.length > 0 ? 99 : 0;
    const tax = subtotalAfterDiscount * 0.18;
    const total = subtotalAfterDiscount + shipping + tax;

    // Create order on backend
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(total * 100), // total in paise
        currency: 'INR',
        receipt: 'order_rcptid_' + Date.now(),
      }),
    });
    const order = await res.json();

    // Load Razorpay SDK if not already loaded
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Failed to load Razorpay SDK. Please try again.');
      return;
    }

    // Open Razorpay modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Encender Fashion',
      description: 'Order Payment',
      order_id: order.id,
      handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
        alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
        // TODO: Verify payment and create order in Directus
      },
      prefill: {},
      theme: { color: '#6366f1' },
    };
    const RazorpayConstructor = (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
    const rzp = new RazorpayConstructor(options);
    rzp.open();
  };

  // Merge cart items with product details
  const mergedCart = cartItems
    .map(item => {
      const product = products[String(item.id)];
      if (!product) return null;
      return {
        ...product,
        quantity: item.quantity,
      };
    })
    .filter(Boolean) as (Product & { quantity: number })[];
  console.log('Merged cart for display:', mergedCart);

  const subtotal = mergedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = mergedCart.length > 0 ? 99 : 0;
  // Discount calculation
  const discountAmount = discountInfo ? (subtotal * (discountInfo.percentage / 100)) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * 0.18; // 18% GST
  const total = subtotalAfterDiscount + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500">Loading cart...</span>
      </div>
    );
  }

  if (mergedCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Instead of calling handleRazorpayPayment directly, open the confirmation modal
  const handleProceedToCheckout = () => {
    setConfirmModalOpen(true);
  };

  // Save order to Directus and then trigger Razorpay
  const handleConfirmAndPay = async () => {
    setConfirmModalOpen(false);
    // 1. Save order to Directus before payment
    try {
      if (!session?.user?.email) throw new Error('User not logged in');
      // Fetch user from Directus by email
      const userRes = await fetch(`${DIRECTUS_URL}/items/user?filter[email][_eq]=${session.user.email}`);
      const userJson = await userRes.json();
      const user = userJson.data && userJson.data[0];
      if (!user) throw new Error('User not found');
      // Build full address string from selected address
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const fullAddressString = selectedAddress
        ? `${selectedAddress.address_line1}${selectedAddress.address_line2 ? ', ' + selectedAddress.address_line2 : ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}, Phone: ${selectedAddress.phone}`
        : '';
      // Prepare order data
      const orderData = {
        users: user.id,
        total: total,
        status: 'pending_payment',
        shipping_address: fullAddressString,
        items: mergedCart.map(item => ({ Products_id: item.id })),
      };
      // Save order
      const orderRes = await fetch(`${DIRECTUS_URL}/items/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!orderRes.ok) {
        const err = await orderRes.text();
        throw new Error('Failed to save order: ' + err);
      }
      // Optionally, you can get the order ID from the response if needed
    } catch (err) {
      alert('Failed to save order: ' + (err instanceof Error ? err.message : String(err)));
      return;
    }
    // 2. Proceed to payment
    handleRazorpayPayment();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {mergedCart.length} item{mergedCart.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 flex-col-reverse lg:flex-row">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {mergedCart.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{item.price.toFixed(2)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-900"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:text-gray-900"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => confirmRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {/* Item Total */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 w-full mt-8 lg:mt-0 lg:w-auto lg:sticky lg:top-8">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {/* Address selection UI */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <div className="flex gap-2 items-center">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
                  value={selectedAddressId || ''}
                  onChange={e => {
                    if (e.target.value === '__add_new__') {
                      setAddressModalOpen(true);
                      // Reset selection to previous if any
                      return;
                    }
                    setSelectedAddressId(e.target.value);
                  }}
                >
                  {addresses.length === 0 && <option value="">No address found</option>}
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Address</option>
                </select>
              </div>
            </div>
            {/* Address Modal */}
            <Dialog open={addressModalOpen} onClose={() => setAddressModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
                <div className="bg-white rounded-lg shadow-lg p-8 z-10 w-full max-w-md relative">
                  <Dialog.Title className="text-lg font-bold mb-4">Add New Address</Dialog.Title>
                  <form onSubmit={handleAddAddress} className="space-y-3">
                    <input required className="w-full border rounded px-3 py-2" placeholder="Phone" value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} />
                    <input required className="w-full border rounded px-3 py-2" placeholder="Address Line 1" value={addressForm.address_line1} onChange={e => setAddressForm(f => ({ ...f, address_line1: e.target.value }))} />
                    <input className="w-full border rounded px-3 py-2" placeholder="Address Line 2" value={addressForm.address_line2} onChange={e => setAddressForm(f => ({ ...f, address_line2: e.target.value }))} />
                    <input required className="w-full border rounded px-3 py-2" placeholder="City" value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} />
                    <input required className="w-full border rounded px-3 py-2" placeholder="State" value={addressForm.state} onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))} />
                    <input required className="w-full border rounded px-3 py-2" placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm(f => ({ ...f, pincode: e.target.value }))} />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm(f => ({ ...f, is_default: e.target.checked }))} /> Set as default</label>
                    <div className="flex gap-2 justify-end mt-4">
                      <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300" onClick={() => setAddressModalOpen(false)}>Cancel</button>
                      <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Save</button>
                    </div>
                  </form>
                </div>
              </div>
            </Dialog>
            {/* Discount code input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={e => setDiscountCode(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter code"
                  disabled={!!discountInfo}
                />
                <button
                  onClick={handleApplyDiscount}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
                  disabled={applyingDiscount || !!discountInfo || !discountCode.trim()}
                >
                  {applyingDiscount ? 'Applying...' : discountInfo ? 'Applied' : 'Apply'}
                </button>
              </div>
              {discountError && <div className="text-red-500 text-xs mt-1">{discountError}</div>}
              {discountInfo && (
                <div className="text-green-600 text-xs mt-1">Code <b>{discountInfo.code}</b> applied: {discountInfo.percentage}% off</div>
              )}
            </div>
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountInfo && (
              <div className="flex justify-between mb-2 text-green-700">
                <span>Discount ({discountInfo.percentage}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Tax (18% GST)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-4 text-lg font-bold text-gray-900 border-t pt-4">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mb-4"
              onClick={handleProceedToCheckout}
              disabled={mergedCart.length === 0 || !selectedAddressId}
            >
              Proceed to Checkout
            </button>
            <Link
              href="/products"
              className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      {/* Remove confirmation modal */}
      <Modal open={!!pendingRemoveId} onClose={handleRemoveCancelled} title="Remove from cart?">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <span className="text-lg text-gray-700">Are you sure you want to remove this item from your cart?</span>
          <div className="flex gap-4 mt-2">
            <button
              className="px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow"
              onClick={handleRemoveConfirmed}
            >
              Yes
            </button>
            <button
              className="px-6 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors shadow"
              onClick={handleRemoveCancelled}
            >
              No
            </button>
          </div>
        </div>
      </Modal>
      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          {/* Blurred background overlay */}
          <div className="fixed inset-0 backdrop-blur-sm bg-black/10" aria-hidden="true" />
          <div className="bg-white rounded-lg shadow-lg p-8 z-10 w-full max-w-lg relative">
            <Dialog.Title className="text-lg font-bold mb-4">Confirm Your Order</Dialog.Title>
            <div className="mb-4">
              <div className="font-semibold mb-2">Shipping Address:</div>
              {addresses.find(a => a.id === selectedAddressId) ? (
                <div className="text-sm text-gray-700">
                  {addresses.find(a => a.id === selectedAddressId).address_line1}, {addresses.find(a => a.id === selectedAddressId).address_line2 && addresses.find(a => a.id === selectedAddressId).address_line2 + ', '}
                  {addresses.find(a => a.id === selectedAddressId).city}, {addresses.find(a => a.id === selectedAddressId).state} - {addresses.find(a => a.id === selectedAddressId).pincode}<br />
                  Phone: {addresses.find(a => a.id === selectedAddressId).phone}
                </div>
              ) : <div className="text-sm text-gray-500">No address selected</div>}
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-2">Items:</div>
              <ul className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                {mergedCart.map(item => (
                  <li key={item.id} className="flex justify-between border-b last:border-b-0 py-1">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300" onClick={() => setConfirmModalOpen(false)}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700" onClick={handleConfirmAndPay}>Confirm & Pay</button>
            </div>
          </div>
        </div>
      </Dialog>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeInScale 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .bg-black.bg-opacity-50 {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
} 