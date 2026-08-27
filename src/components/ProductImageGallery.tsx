"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  isNew?: boolean;
}

export default function ProductImageGallery({ images, alt, className = "", isNew }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 w-full aspect-square flex items-center justify-center text-gray-400 rounded-2xl">
        No Image
      </div>
    );
  }

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Vertical Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-col gap-3 w-16 sm:w-20 shrink-0">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`relative aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all duration-200 hover:shadow-md ${
                activeImage === index
                  ? 'border-[#7c3aed] shadow-md shadow-[#7c3aed]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {failedImages.has(index) ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  N/A
                </div>
              ) : (
                <Image
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(index)}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-1 aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
        {/* Badge */}
        {isNew && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#7c3aed] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              New Arrival
            </span>
          </div>
        )}

        {failedImages.has(activeImage) ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            Image unavailable
          </div>
        ) : (
          <Image
            src={images[activeImage] || images[0]}
            alt={alt}
            fill
            className="object-contain p-4 transition-all duration-500"
            onError={() => handleImageError(activeImage)}
          />
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeImage + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}