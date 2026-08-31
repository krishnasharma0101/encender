'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/new-ui/Navbar';

export default function NewUIPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const collections = [
    {
      name: 'Daily Essentials',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBUPT9hLBbjN47f2mOlKIx2Tl0Pw_qL2_iJ9snERcGZqjfs8_2IYJV5_tl0slLDRPESsIlFzda4HfPbnLlDJjPd6KYQDkEdQf9_d0ibv6gw8DpsQ7S8av_Txg9bijntDzbAriszbPqx52NPA6aBE0kkjh7wic9CTKHsOkxmk9KnNIH7RAXCCa7FHItlqApdQGk16Ef2-OG8OgxSV-FdJ7-Ii3J_3sDVz0WO6IwwD2qRYslu6K2Gn4DrGQ',
      link: '/new-ui/category/daily-essentials',
    },
    {
      name: 'Back to School',
      image: '/backtoschool.jpg',
      link: '/new-ui/category/back-to-school',
    },
    {
      name: 'Interior',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCoZ7ew2_iXT_r50Z8-BaLO4APsBHL9V4F6PACGsFxNZkIDzShsXqS3--WQSrkDb9vgTkDBfyJuq_I0O2ATzalVsDGG0kuGHctUI_zRdEgcjCnKO_LOuuPo29XEAnDELHr0ovkwE3igmye933ad1wJ2EAGTEgm_m9XKwjWKbv3F1Vb8-6-DyryQAGAg8mr9kkucjK2THDA4D_1ekBWlVw4EG-9WwdeSEsM8zeWt2Nok66vFmJuPaAaCaQ',
      link: '/new-ui/category/interior',
    },
    {
      name: 'Gifting',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBUxFuIudJKEj8aJ0gw1v92zxjFAZktD3COt7_plxoHQQ9N_q54pOSdf4U_3sA_yyvR4uVIR7MB1uAvtavF1GSeuaYZDldNa1kx_9u0VXZIqwb8PMeUzeROZ6iBfBew5ks_ZcziQlnzLm7pehLBID0p9YF0njy2LMgAn8C69OO8dHMMFpRTPMavRlrlw9EyFmMZ4VYzkC5HXG94qrCDt1NGyLG5VtsciruaZGnApAfKQfB2IBL3GDZO',
      link: '/new-ui/category/gifting',
    },
    {
      name: 'Pooja Essentials',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA04FOnpKmW2PATzHqvuvJTFuRkTROBTCa2Bx79DvuQVrPfl-x-6Gj965KD7XHUtuejyn_Ze0GICbZw7_KuJAAapd9dC-ruCHOW8xCJWfl-DXDEUtAwabJeCjCtd0IyNfyPpBlZpkVyLltBkfHRJicWSs-E8Jy6CvErXhQx6j1WYbdZCEmfB5IrhEWTTlmtuj00IRpm_qN7EYoKCBiy1IxjbsMa194qe3E_KuFoDBb3H9eCnlXQfaC7',
      link: '/new-ui/category/pooja-essentials',
    },
    {
      name: 'Jewellery',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBm1m4FrWEsRLh8mKK2lux6Z7AR270m4UtaZftgoXgzbcvoWFy9OjmPrIkWl2kMdK9cC3RDNn3sStD7qJ9UYeaZAC60EUwNyn88rxlzpx5b48ustUPszxGQdaSWXZ5DOC85Q8Sq9m5bgpVIwnoO8qLzIkh5ZKiKBhVr8WIZSOL76A313QJhnnCdLnc18cfB3E2O9itB4JwEtXgJw7L44onDdAoRfgRE4jYkqI4-Cp8bQNWrQtKDD6Vl',
      link: '/new-ui/category/jewellery',
    },
  ];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
      }
    }
  };

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPositionRatio = (e.clientX - rect.left) / rect.width;
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: clickPositionRatio * maxScroll,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Handle scroll progress update
    el.addEventListener('scroll', handleScroll);

    // Mouse wheel horizontal scroll handler
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.2;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });

    // Drag-to-scroll logic
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      el.classList.add('cursor-grabbing');
      el.classList.remove('cursor-grab');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
      el.classList.add('cursor-grab');
    };

    const handleMouseUp = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
      el.classList.add('cursor-grab');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mousemove', handleMouseMove);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans antialiased overflow-x-hidden">
      {/* Styles & External Font Loading */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <style jsx global>{`
        .font-serif-heading {
          font-family: 'Playfair Display', serif;
        }
        .font-sans-body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Navbar />

      {/* Main Content */}
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative w-full h-[75vh] min-h-[550px] flex items-center justify-center px-4 md:px-10 mb-20">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCPZwA9UNhFwjwfOf3yDeVBOElUBBTLCXSXI6VZ-lzX-3HTcx7AJLr5hSSXnLYoyxK1tNPC-i-zCeW1PG5eAiJTh6yI8jgFMfKZOQiIf6vrxAlMIEiR23a5vZLIGOtXuWX-LHV9DcjiEcMn3EpON3447fHx_diMHLtbQ6tkzhio9Ds5_zsassGCwEbqmkvfpU74iJmXj2_wdkorKWZA93Wsv6NFd9Sg0xt2RjTR-bF_BDj7g7T5C224')",
              }}
            ></div>
            <div className="absolute inset-0 bg-[#faf9f6]/30 backdrop-blur-[2px]"></div>
          </div>
          <div className="relative z-10 max-w-2xl text-center bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-2xl border border-white/50">
            <h1 className="font-serif-heading text-3xl md:text-5xl font-bold text-[#855300] mb-5 leading-tight">
              Personalized Gifts & Daily Essentials Delivered Across India
            </h1>
            <p className="font-sans-body text-base md:text-lg text-gray-700 mb-8">
              Curated with heritage, designed for the modern home.
            </p>
            <Link
              href="/new-ui/products"
              className="inline-block bg-[#f59e0b] hover:bg-[#d97706] text-white font-sans-body font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-95 transition-all duration-300"
            >
              Explore Catalogs
            </Link>
          </div>
        </section>

        {/* Trust Ticker */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-10 mb-16">
          <div className="py-6 border-y border-gray-200 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 text-gray-700 font-sans-body font-medium text-base">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#855300]">sentiment_satisfied</span>
              <span>500+ Happy Customers</span>
            </div>
            <div className="hidden md:block w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#855300]">workspace_premium</span>
              <span>100+ Custom Designs</span>
            </div>
          </div>
        </section>

        {/* Curated Collections with Horizontal Scroll & Interactive Indicators */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-10 mb-24 group">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#6f46b9] font-bold block mb-1">
                Handcrafted & Curated
              </span>
              <h2 className="font-serif-heading text-3xl md:text-4xl font-bold text-gray-900">
                Curated Collections
              </h2>
            </div>
            <Link
              href="/new-ui/collections"
              className="text-[#855300] hover:text-[#f59e0b] font-sans-body font-semibold text-sm flex items-center transition-colors"
            >
              <span>Explore More</span>
              <span className="material-symbols-outlined text-base ml-1">arrow_forward</span>
            </Link>
          </div>

          {/* Cards Carousel */}
          <div
            ref={scrollRef}
            className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-5 md:gap-6 hide-scrollbar pb-3 cursor-grab select-none"
          >
            {collections.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="group relative w-[210px] sm:w-[240px] md:w-[260px] aspect-[4/5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex-shrink-0 snap-start bg-gray-100 border border-gray-200/60 block"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 flex flex-col justify-end">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#ffddb8] mb-1 opacity-90">
                    Collection
                  </span>
                  <h3 className="font-serif-heading text-base sm:text-lg text-white font-bold tracking-wide leading-snug group-hover:text-[#ffddb8] transition-colors">
                    {item.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Interactive Scrollbar Progress Track & Controls */}
          <div className="relative mt-4 pt-2">
            {/* Clickable Track */}
            <div
              onClick={handleTrackClick}
              className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
              title="Click anywhere on the bar to jump"
            >
              {/* Active Indicator Thumb */}
              <div
                className="h-full bg-[#855300] rounded-full transition-all duration-150"
                style={{
                  width: '25%',
                  transform: `translateX(${scrollProgress * 3}%)`,
                }}
              ></div>
            </div>

            {/* Navigation Chevron Buttons */}
            <div className="flex justify-end items-center mt-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => scrollByAmount(-240)}
                  className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-[#855300] hover:bg-[#855300] hover:text-white transition-all duration-200"
                  aria-label="Scroll left"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button
                  onClick={() => scrollByAmount(240)}
                  className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-[#855300] hover:bg-[#855300] hover:text-white transition-all duration-200"
                  aria-label="Scroll right"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#2f312f] text-white py-12 px-6 md:px-10 mt-20">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8 font-sans-body">
          <div className="flex flex-col gap-3">
            <span className="font-serif-heading text-2xl font-bold text-[#ffddb8]">Encender</span>
            <p className="text-sm text-gray-300">© 2026 Encender. Crafted with Heritage across India.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto text-sm text-gray-300">
            <div className="flex flex-col gap-2">
              <Link href="/shipping" className="hover:text-white transition-colors">
                Shipping Policy
              </Link>
              <Link href="/refunds" className="hover:text-white transition-colors">
                Refunds
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/919028502581"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors text-[#f59e0b] font-medium"
              >
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
