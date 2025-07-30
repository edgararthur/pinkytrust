'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  link?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  showNavigation = true,
  className = '',
  aspectRatio = 'video',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  };

  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, autoPlayInterval, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`${aspectRatioClasses[aspectRatio]} bg-gray-200 rounded-2xl flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg group ${className}`}>
      {/* Main Image Container */}
      <div className={`relative ${aspectRatioClasses[aspectRatio]} overflow-hidden`}>
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}

        {/* Main Image */}
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          onLoad={handleImageLoad}
          onError={() => setIsLoading(false)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

        {/* Content Overlay */}
        {(currentImage.title || currentImage.description) && (
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {currentImage.title && (
              <h3 className="text-xl font-bold mb-2 drop-shadow-lg">
                {currentImage.title}
              </h3>
            )}
            {currentImage.description && (
              <p className="text-sm opacity-90 drop-shadow-md">
                {currentImage.description}
              </p>
            )}
          </div>
        )}

        {/* Navigation Arrows */}
        {showNavigation && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Play/Pause Button */}
        {autoPlay && images.length > 1 && (
          <button
            onClick={togglePlayPause}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <PauseIcon className="w-4 h-4 text-white" />
            ) : (
              <PlayIcon className="w-4 h-4 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Link Overlay */}
      {currentImage.link && (
        <a
          href={currentImage.link}
          className="absolute inset-0 z-10"
          aria-label={`View ${currentImage.title || currentImage.alt}`}
        />
      )}
    </div>
  );
};

export default ImageCarousel; 