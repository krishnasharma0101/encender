'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
      {/* Background Pattern - Themed Animated Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gift Box */}
        <svg className="absolute top-10 left-10 w-10 h-10 animate-float-slow opacity-80" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="20" width="32" height="20" rx="4" fill="#fffbe6" stroke="#fbbf24" strokeWidth="2"/>
          <rect x="8" y="20" width="32" height="8" fill="#fde68a"/>
          <rect x="20" y="8" width="8" height="12" rx="2" fill="#fbbf24"/>
          <path d="M24 8C22 4 16 8 20 14" stroke="#fbbf24" strokeWidth="2"/>
          <path d="M24 8C26 4 32 8 28 14" stroke="#fbbf24" strokeWidth="2"/>
        </svg>
        {/* Diya Lamp */}
        <svg className="absolute top-24 right-24 w-10 h-10 animate-float-medium opacity-80" viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="32" rx="12" ry="6" fill="#fde68a" stroke="#fbbf24" strokeWidth="2"/>
          <ellipse cx="24" cy="32" rx="8" ry="3" fill="#fbbf24"/>
          <path d="M24 26c2-2 4-6 0-10-4 4-2 8 0 10z" fill="#f59e42"/>
          <circle cx="24" cy="16" r="2" fill="#fbbf24"/>
        </svg>
        {/* Pooja Thali */}
        <svg className="absolute bottom-24 left-1/4 w-12 h-12 animate-float-fast opacity-80" viewBox="0 0 48 48" fill="none">
          <ellipse cx="24" cy="36" rx="14" ry="6" fill="#fffbe6" stroke="#fbbf24" strokeWidth="2"/>
          <circle cx="18" cy="34" r="2" fill="#fbbf24"/>
          <circle cx="24" cy="34" r="2" fill="#fbbf24"/>
          <circle cx="30" cy="34" r="2" fill="#fbbf24"/>
          <rect x="22" y="28" width="4" height="4" rx="2" fill="#f59e42"/>
        </svg>
        {/* Flower */}
        <svg className="absolute bottom-10 right-1/3 w-10 h-10 animate-float-slow opacity-80" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="4" fill="#fbbf24"/>
          <ellipse cx="24" cy="16" rx="3" ry="7" fill="#f472b6"/>
          <ellipse cx="24" cy="32" rx="3" ry="7" fill="#f472b6"/>
          <ellipse cx="16" cy="24" rx="7" ry="3" fill="#f472b6"/>
          <ellipse cx="32" cy="24" rx="7" ry="3" fill="#f472b6"/>
        </svg>
        {/* Ribbon */}
        <svg className="absolute top-1/2 left-1/2 w-12 h-12 animate-float-medium opacity-70" style={{transform: 'translate(-50%, -50%)'}} viewBox="0 0 48 48" fill="none">
          <rect x="20" y="8" width="8" height="32" rx="4" fill="#fbbf24"/>
          <path d="M24 8C20 4 8 12 24 24" stroke="#f472b6" strokeWidth="2"/>
          <path d="M24 8c4-4 16 4 0 16" stroke="#f472b6" strokeWidth="2"/>
        </svg>
        {/* Sparkles */}
        <svg className="absolute bottom-16 right-10 w-8 h-8 animate-twinkle opacity-60" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#fffbe6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Keyframes for floating and twinkle animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-24px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-32px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3.5s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2.5s ease-in-out infinite; }
      `}</style>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Customized Gifting Made Easy</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Personalized Gifts & Daily Essentials
              <span className="block text-yellow-300">Delivered Across India</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-white/90 mb-8 max-w-lg mx-auto lg:mx-0">
              Discover unique customized gifts for every special occasion. Quality handicrafts and personalized items delivered to your doorstep.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                Explore Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-8 mt-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-white/80 text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100+</div>
                <div className="text-white/80 text-sm">Custom Designs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Pan India</div>
                <div className="text-white/80 text-sm">Delivery</div>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-yellow-300 rounded-lg mb-3"></div>
                    <div className="h-3 bg-white/60 rounded w-3/4"></div>
                    <div className="h-2 bg-white/40 rounded w-1/2"></div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-pink-300 rounded-lg mb-3"></div>
                    <div className="h-3 bg-white/60 rounded w-2/3"></div>
                    <div className="h-2 bg-white/40 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-green-300 rounded-lg mb-3"></div>
                    <div className="h-3 bg-white/60 rounded w-4/5"></div>
                    <div className="h-2 bg-white/40 rounded w-2/3"></div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-blue-300 rounded-lg mb-3"></div>
                    <div className="h-3 bg-white/60 rounded w-3/4"></div>
                    <div className="h-2 bg-white/40 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </section>
  );
} 