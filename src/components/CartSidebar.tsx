import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  cartItems: { id: string; name: string; price: number; quantity: number; image?: string }[];
}

const CartSidebar: React.FC<CartSidebarProps> = ({ open, onClose, cartItems }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-[100] transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ boxShadow: open ? '0 0 32px rgba(0,0,0,0.15)' : undefined }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Cart</h2>
        <button onClick={onClose} aria-label="Close sidebar" className="text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length === 0 ? (
          <div className="text-gray-500 text-center mt-8">Your cart is empty.</div>
        ) : (
          <ul className="space-y-4">
            {cartItems.map(item => (
              <li key={item.id} className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded border" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 truncate">{item.name}</div>
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                  <div className="text-sm text-gray-800 font-semibold">₹{item.price}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-gray-700">Subtotal</span>
          <span className="font-bold text-gray-900">₹{subtotal}</span>
        </div>
        <Link
          href="/cart"
          className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          onClick={onClose}
        >
          View Cart
        </Link>
      </div>
    </div>
  );
};

export default CartSidebar; 