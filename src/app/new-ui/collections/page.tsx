'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/new-ui/Navbar';

export default function CollectionsPage() {
  const collectionGridItems = [
    {
      title: 'Handcrafted Jewellery',
      subtitle: 'Signature',
      colSpan: 'md:col-span-8',
      height: 'h-[360px] md:h-[500px]',
      image:
        'https://lh3.googleusercontent.com/aida/AEtjO1UZD5-U-CnnArxetvAb3ANq1iVPHIYIhK-5wzjIL-XeCAmWc3n5jojDOMKkXbt84djJi9w3qiZMlXaGs-S7u1P0H4t2APCoPbAo-Dl6WwG7krry2EbKQv_ezIyOf0M4YUZfsFD-_ysUX3PhRO_f6zUr13Dj_mxPmK6L0NT1nONK_aNFPtKbwclxIkVmnpTLm3rnolI3EJ9fT6jGm-Xy7IDr9c1GlGtYWXyghgaKkw6GPfdFImd2sQnCYA',
      link: '/new-ui/category/jewellery',
    },
    {
      title: 'Festive Pooja Essentials',
      colSpan: 'md:col-span-4',
      height: 'h-[360px] md:h-[500px]',
      image:
        'https://lh3.googleusercontent.com/aida/AEtjO1UmgPNajBMpZB8L0xsQ3L4kei3hPCLMWz6bpTJmcCTfMMT2XfrvHyP-jOTNmMNWTxle2ux34KA6VsTLGk1vCke0hmwHz27qpp78n9tZGxEK9BbYjqZ7o7Z6sRsJfkgbHv5ZCxXk6E3zI1wXTcq59n5ul4XbaehmOfn_j6YC5Czxu0JApuSw8LcO7kjhNqMVkTWWpkej0V-Fk_30ugWpn6LzUDe3vcNAMTqaZlJkIj0gQCBtb6tVtSPClQ',
      link: '/new-ui/category/pooja-essentials',
    },
    {
      title: 'Customized Gifting',
      badge: 'Bestseller',
      colSpan: 'md:col-span-4',
      height: 'h-[360px]',
      image:
        'https://lh3.googleusercontent.com/aida/AEtjO1UnRiuDey5hsZj80Qh7lgLxq8lixWqKzG5FkTtRdua_dhP3GfE903R86f2xO9kK3E644ROnOYth9DrtPlQvOP1pRiYlduCdNW6rslfol62TJNHm0ucgKZk7qnFPBYl7g0678o1YotU2uWNSNERjdewDUz_em4l02Rgyo9csjYVgx6UxGzikpKX7Rj2qepdVMdFjb-dNZxcE_2OTpcxE1_SY80stcI-deAOc5GcYBgdZKvRe2pQcgItYo1s',
      link: '/new-ui/category/gifting',
    },
    {
      title: 'Artisanal Home Decor',
      colSpan: 'md:col-span-4',
      height: 'h-[360px]',
      image:
        'https://lh3.googleusercontent.com/aida/AEtjO1UxW4VbLo-d4Y4RTpn0EW35QBeITW6nXzUZHVa7q_9XtNTa7Mc7NluKBeg03jM5NGjfP1PTWQhnPsU3nxdVQ7xC23KD0DrSJ4nCuKfZNq3Bi8AyaOjX3iuALKS4z5aLP97vFUWV-YE_ck48-TghCWFdft-mkIc4RAKLNbw6ZbLrIJbdHEII8OcGvqIF88bThupgZWP4rDE2ZLkisMQVls5ieurc4919muB5KU9SvwXnlyX81Us2M2PTbQ',
      link: '/new-ui/category/interior',
    },
    {
      title: 'Daily Lifestyle',
      colSpan: 'md:col-span-4',
      height: 'h-[360px]',
      image:
        'https://lh3.googleusercontent.com/aida/AEtjO1VhRWgCvbO7n5NmnNJNXAb0tTW9IhVr7n0K1DOTgJ-ciL_PCBO_bLdBZaCXb9bPGHuHgfbvp3gL1OdFEncJKHZx8M7k8az1t99uGfgJIJ1ENDdKTBKfj46FHiMlF5StUfrFx6KAZAyJ-s_hSXRFiKQFTwayraQFQMEv_jczcBwbkEDL9gVBb3QEcZe2MkJeNTaFrnqyFMTbd-DpGB0IAfUDtbN155Dt25Uf9hIDxc1by5SIrv_w81_DiMk',
      link: '/new-ui/category/daily-essentials',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] font-sans antialiased overflow-x-hidden flex flex-col">
      {/* External Fonts */}
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
      `}</style>

      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Page Header */}
        <section className="py-12 md:py-16 px-6 md:px-10 text-center max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.2em] text-[#f59e0b] font-bold mb-3">
            The Heart of Heritage
          </span>
          <h1 className="font-serif-heading text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Curated Collections
          </h1>
          <p className="font-sans-body text-base text-gray-600 max-w-2xl leading-relaxed">
            Discover our meticulously curated selection of modern luxury Indian artistry. Every piece tells a story of tradition seamlessly blended with contemporary elegance, crafted for the discerning eye.
          </p>
        </section>

        {/* Bento Grid Collections */}
        <section className="px-6 md:px-10 pb-20 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {collectionGridItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className={`${item.colSpan} ${item.height} group relative block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-gray-100 border border-gray-200/50`}
              >
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                </div>

                {item.badge && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#b188ff]/90 backdrop-blur text-purple-950 font-semibold px-3 py-1 rounded-full text-xs shadow-sm">
                      {item.badge}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex flex-col justify-end">
                  {item.subtitle && (
                    <span className="text-xs uppercase tracking-wider text-[#ffddb8] font-bold mb-1">
                      {item.subtitle}
                    </span>
                  )}
                  <h2 className="font-serif-heading text-2xl md:text-3xl text-white font-bold mb-2">
                    {item.title}
                  </h2>
                  <div className="flex items-center text-white/90 group-hover:text-[#f59e0b] transition-colors font-sans-body text-sm font-medium">
                    <span>Shop Collection</span>
                    <span className="material-symbols-outlined text-sm ml-2 transition-transform group-hover:translate-x-1.5">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Feature Horizontal Banner (Full 12 Columns) */}
            <Link
              href="/new-ui/category/back-to-school"
              className="md:col-span-12 group block relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-white border border-gray-200/60 flex flex-col md:flex-row items-center mt-2"
            >
              <div className="w-full md:w-1/2 h-[260px] md:h-[380px] relative overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1U2EOvKs8APGmvsIrnlZA4s9sSR80FG1taCdBALi9P32hBlTmzfrNjaQs57mTWSZUxWpC45HFaiQvm3VAdUu7XjURNaiR5RjRehMjimzsK97gTs8t8D4BmnGXqI_Fp6Yq6omuWuZeZXGS0AmxW74WrLojxXrtOeDHNIHvuyKLkNLqa1EuIcXoeKnr9QM04lTaAhjdfMkMBl6HeUp6ssCkXpxPWTbyxktTODn9dDTgow171sxJypl8_HRmo"
                  alt="Kids & Back to School"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-[#faf9f6]">
                <span className="bg-[#f59e0b]/15 text-[#855300] w-max px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                  New Arrival
                </span>
                <h2 className="font-serif-heading text-2xl md:text-4xl text-gray-900 font-bold mb-3">
                  Kids & Back to School
                </h2>
                <p className="font-sans-body text-sm text-gray-600 mb-6 max-w-md leading-relaxed">
                  Inspire young minds with essentials rooted in heritage. Discover handcrafted stationery and vibrant accessories designed for modern schooling.
                </p>
                <div className="inline-flex items-center justify-center bg-[#f59e0b] text-white px-6 py-3 rounded-xl font-sans-body font-semibold text-sm hover:bg-[#d97706] transition-colors shadow-sm w-max">
                  Explore Collection
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#2f312f] text-white py-12 px-6 md:px-10 mt-auto">
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
