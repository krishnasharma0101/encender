'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname() || '';

  const navLinks = [
    { label: 'Gifting', href: '/category/gifting', match: ['/category/gifting', '/new-ui/category/gifting'] },
    { label: 'Festive', href: '/category/pooja-essentials', match: ['/category/pooja-essentials', '/new-ui/category/pooja-essentials'] },
    { label: 'Jewellery', href: '/category/jewellery', match: ['/category/jewellery', '/new-ui/category/jewellery'] },
    { label: 'Interior Decor', href: '/category/interior', match: ['/category/interior', '/new-ui/category/interior'] },
    { label: 'Daily Essentials', href: '/category/daily-essentials', match: ['/category/daily-essentials', '/new-ui/category/daily-essentials'] },
    { label: 'Collections', href: '/collections', match: ['/collections', '/new-ui/collections'] },
    { label: 'Shop All', href: '/products', match: ['/products', '/new-ui/products'] },
  ];

  const isLinkActive = (matchPaths: string[]) => {
    return matchPaths.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p)));
  };

  return (
    <header className="relative z-50">
      {/* Announcement Ticker */}
      <div className="bg-[#6f46b9] text-white py-1.5 px-3 text-center text-[11px] sm:text-sm font-sans-body relative z-50">
        <p className="truncate">
          ✨ Free Shipping Above ₹999 | Buy on WhatsApp:{' '}
          <a
            href="https://wa.me/919028502581?text=Hi%2C%20I%20would%20like%20to%20inquire%20about%20Encender%20products"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-[#f59e0b] transition-colors"
          >
            +91 90285 02581
          </a>
        </p>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md relative z-40 border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-3 max-w-[1280px] mx-auto">
          
          {/* Brand Logo (Positioned Left on all screens) */}
          <Link href="/" className="group relative inline-flex items-center transition-all duration-300">
            <div className="relative flex items-center gap-2.5 sm:gap-3 transition-transform duration-300 group-hover:scale-105">
              <div className="relative flex items-center">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#855300] via-[#f59e0b] to-[#6f46b9] rounded-full blur-md opacity-0 group-hover:opacity-75 transition-all duration-500 group-hover:scale-110"></div>
                <img
                  src="/encender.svg"
                  alt="Encender Logo"
                  className="relative h-8 sm:h-9 w-auto object-contain"
                />
              </div>
              <span className="font-serif-heading text-xl sm:text-2xl font-black text-[#bd60a5] tracking-tight group-hover:text-[#9c3f85] transition-colors">
                Encender
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Visible on Laptop >= lg) */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 font-sans-body text-sm font-medium text-gray-700">
            {navLinks.map((link) => {
              const active = isLinkActive(link.match);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "text-[#855300] font-bold border-b-2 border-[#855300] pb-0.5"
                      : "hover:text-[#f59e0b] transition-colors"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Header Action Icons (Right side) */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-[#855300]">
            <button className="hover:text-[#f59e0b] p-1.5 rounded-lg active:bg-gray-100" aria-label="Favorites">
              <span className="material-symbols-outlined text-xl sm:text-2xl block">favorite</span>
            </button>
            <Link href="/account" className="hover:text-[#f59e0b] p-1.5 rounded-lg active:bg-gray-100" aria-label="User Account">
              <span className="material-symbols-outlined text-xl sm:text-2xl block">person</span>
            </Link>
            <Link href="/cart" className="hover:text-[#f59e0b] p-1.5 rounded-lg active:bg-gray-100" aria-label="Cart">
              <span className="material-symbols-outlined text-xl sm:text-2xl block">shopping_bag</span>
            </Link>
          </div>
        </div>

        {/* Horizontal Category Scroll Bar (Mobile/Phone Mode) */}
        <div className="lg:hidden flex items-center overflow-x-auto whitespace-nowrap px-3 py-2 bg-gray-50/80 border-t border-gray-100 gap-1.5 hide-scrollbar">
          {navLinks.map((link) => {
            const active = isLinkActive(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                  active
                    ? 'bg-[#855300] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200/70 hover:border-[#855300]/40'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
