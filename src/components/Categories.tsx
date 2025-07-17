'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const categoryData = [
  {
    name: 'Gifting',
    slug: 'gifting',
    image: '/gifting.jpg', // Gift box
    count: 45,
    description: 'Unique gifts for every occasion'
  },
  {
    name: 'Pooja Essentials',
    slug: 'pooja-essentials',
    image: '/pooja.jpg', // Pooja thali
    count: 32,
    description: 'Sacred items for your pooja rituals'
  },
  {
    name: 'Jewellery',
    slug: 'jewellery',
    image: '/jewellery.jpg', // Jewellery
    count: 28,
    description: 'Elegant and traditional jewellery for every style'
  },
  {
    name: 'Daily Essentials',
    slug: 'daily-essentials',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=300&fit=crop', // Home essentials
    count: 19,
    description: 'Everyday must-haves for your home'
  },
  {
    name: 'Back to School',
    slug: 'back-to-school',
    image: '/backtoschool.jpg', // School supplies
    count: 15,
    description: 'Essentials for students and learning'
  },
  {
    name: 'Interior',
    slug: 'interior',
    image: '/interior.jpg', // Interior decor
    count: 10,
    description: 'Decor and interior products for your space'
  },
];

export default function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of customized gifts, handicrafts and daily essentials for every special moment
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categoryData.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {category.description}
                </p>
                <p className="text-xs text-gray-500">
                  {category.count} items
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 