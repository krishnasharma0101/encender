'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    function updateCartCount() {
      if (typeof window !== 'undefined') {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0);
        setCartCount(count);
      }
    }
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-2' : 'bg-white py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#bd60a5] to-[#e187b8] rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity"></div>
              <Image
                src="/encender.svg"
                alt="Encender Logo"
                width={40}
                height={50}
                className="relative h-12 w-auto object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#bd60a5] to-[#7c3aed] tracking-tighter">
              Encender
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="relative px-4 py-2 text-sm font-semibold text-gray-600 hover:text-[#bd60a5] transition-colors group"
              >
                {category.name}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#bd60a5] transform scale-x-0 transition-transform group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-[#bd60a5] transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#bd60a5]/20 focus:bg-white focus:border-[#bd60a5] transition-all outline-none"
              />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-2">
            <button className="p-2.5 text-gray-600 hover:text-[#bd60a5] hover:bg-[#bd60a5]/5 rounded-xl transition-all">
              <Heart className="h-5 w-5" />
            </button>
            
            <AccountDropdown />

            <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-[#bd60a5] hover:bg-[#bd60a5]/5 rounded-xl transition-all">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 bg-gradient-to-tr from-[#bd60a5] to-[#e187b8] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2.5 text-gray-600 hover:text-[#bd60a5] hover:bg-[#bd60a5]/5 rounded-xl transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top duration-300">
            <div className="space-y-1 p-2 bg-gray-50/50 rounded-2xl border border-gray-100">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="block px-4 py-3 text-base font-semibold text-gray-700 hover:text-[#bd60a5] hover:bg-white rounded-xl transition-all"
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

function AccountDropdown() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        className="p-2.5 text-gray-600 hover:text-[#bd60a5] hover:bg-[#bd60a5]/5 rounded-xl transition-all focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <User className="h-5 w-5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {!session ? (
              <button
                className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => { setOpen(false); signIn('google'); }}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                Sign in with Google
              </button>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{session.user?.name}</p>
                </div>
                <Link
                  href="/account"
                  className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Profile Details
                </Link>
                <button
                  className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => { setOpen(false); signOut(); }}
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
} 