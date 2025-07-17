'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function updateCartCount() {
      if (typeof window !== 'undefined') {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        // cart is an array of { id, quantity }
        const count = cart.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      }
    }
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  const categories = [
    { name: 'Gifting', href: '/category/gifting' },
    { name: 'Pooja Essentials', href: '/category/pooja-essentials' },
    { name: 'Jewellery', href: '/category/jewellery' },
    { name: 'Daily Essentials', href: '/category/daily-essentials' },
    { name: 'Back to School', href: '/category/back-to-school' },
    { name: 'Interior', href: '/category/interior' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">Encender</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search for customized gifts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-indigo-600 transition-colors">
              <Heart className="h-6 w-6" />
            </button>
            {/* Account Dropdown */}
            <AccountDropdown />
            <Link href="/cart" className="relative text-gray-700 hover:text-indigo-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full h-3 w-3 border-2 border-white" />
              )}
            </Link>
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 hover:text-indigo-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search for customized gifts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-gray-700 hover:text-indigo-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 

// AccountDropdown component
function AccountDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="text-gray-700 hover:text-indigo-600 transition-colors focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <User className="h-6 w-6" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-50">
          {!session ? (
            <button
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-t-lg"
              onClick={() => { setOpen(false); signIn('google'); }}
            >
              Sign in with Google
            </button>
          ) : (
            <>
              <Link
                href="/account"
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-t-lg"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-b-lg"
                onClick={() => { setOpen(false); signOut(); }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
} 