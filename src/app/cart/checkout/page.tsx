"use client";

import React, { useEffect, useState } from 'react';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    const parsed = stored ? JSON.parse(stored) : [];
    setCartItems(parsed);
    // Calculate total (assume each item has price and quantity)
    // In a real app, fetch product details for accurate price
    let sum = 0;
    parsed.forEach((item: any) => {
      sum += (item.price || 0) * (item.quantity || 1);
    });
    setTotal(sum);
  }, []);

  const handleRazorpayPayment = async () => {
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

    // Open Razorpay modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Encender Fashion',
      description: 'Order Payment',
      order_id: order.id,
      handler: function (response: any) {
        alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
        // TODO: Verify payment and create order in Directus
      },
      prefill: {},
      theme: { color: '#6366f1' },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        {cartItems.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          <ul className="mb-4">
            {cartItems.map((item: any, idx: number) => (
              <li key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                <span>{item.name || 'Product'}</span>
                <span>Qty: {item.quantity || 1}</span>
                <span>₹{item.price || 0}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={handleRazorpayPayment}
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all w-full"
        disabled={cartItems.length === 0}
      >
        Pay with Razorpay
      </button>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default CheckoutPage; 