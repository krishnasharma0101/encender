"use client";
import { useState } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function ProductImageGallery({ images, alt, className = "" }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  if (!images || images.length === 0) {
    return <div className="bg-gray-100 w-full h-48 flex items-center justify-center text-gray-400 rounded-t-lg">No Image</div>;
  }
  const handlePrev = () => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image with slider */}
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center">
        <Image
          src={images[activeImage] || images[0]}
          alt={alt}
          fill
          className="object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
              aria-label="Previous image"
            >
              &#8592;
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
              aria-label="Next image"
            >
              &#8594;
            </button>
          </>
        )}
      </div>
      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 cursor-pointer ${activeImage === index ? 'border-indigo-500' : 'border-gray-200'}`}
              onClick={() => setActiveImage(index)}
            >
              <Image
                src={image}
                alt={`${alt} ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 