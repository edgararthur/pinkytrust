import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/utils';
import { PlayIcon, PauseIcon, SpeakerWaveIcon as VolumeUpIcon, SpeakerXMarkIcon as VolumeXIcon, ArrowsPointingOutIcon as FullscreenIcon } from '@heroicons/react/24/outline';

// Enhanced Image Component with lazy loading and optimizations
interface EnhancedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
  rounded?: boolean;
  shadow?: boolean;
  overlay?: boolean;
  overlayContent?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
  rounded = false,
  shadow = false,
  overlay = false,
  overlayContent,
  aspectRatio,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  return (
    <div className={cn(
      'relative overflow-hidden',
      rounded && 'rounded-lg',
      shadow && 'shadow-md',
      getAspectRatioClass(),
      className
    )}>
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            `object-${objectFit}`,
            objectPosition && `object-${objectPosition}`
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">📷</div>
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Overlay content */}
      {overlay && overlayContent && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          {overlayContent}
        </div>
      )}
    </div>
  );
};

// Hero Video Component
interface HeroVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  overlay?: boolean;
  overlayContent?: React.ReactNode;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({
  src,
  poster,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  overlay = false,
  overlayContent,
  onPlay,
  onPause,
  onEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onPlay, onPause, onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Custom controls */}
      {!controls && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
            >
              {isMuted ? (
                <VolumeXIcon className="h-5 w-5" />
              ) : (
                <VolumeUpIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
          >
            <FullscreenIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Overlay content */}
      {overlay && overlayContent && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          {overlayContent}
        </div>
      )}
    </div>
  );
};

// Image Gallery Component
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }>;
  className?: string;
  columns?: number;
  spacing?: number;
  rounded?: boolean;
  shadow?: boolean;
  onImageClick?: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className,
  columns = 3,
  spacing = 4,
  rounded = true,
  shadow = true,
  onImageClick,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    onImageClick?.(index);
  };

  return (
    <div className={cn('grid gap-4', className)} style={{
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${spacing * 0.25}rem`
    }}>
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            'relative overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105',
            rounded && 'rounded-lg',
            shadow && 'shadow-md hover:shadow-lg'
          )}
          onClick={() => handleImageClick(index)}
        >
          <EnhancedImage
            src={image.src}
            alt={image.alt}
            fill
            aspectRatio="square"
            className="group-hover:scale-110 transition-transform duration-300"
          />
          {image.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              <p className="text-sm font-medium">{image.title}</p>
              {image.description && (
                <p className="text-xs opacity-80">{image.description}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Awareness Content Media Component
interface AwarenessMediaProps {
  type: 'prevention' | 'screening' | 'support' | 'education' | 'testimonial';
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  className?: string;
  ctaText?: string;
  ctaLink?: string;
  onCTAClick?: () => void;
}

export const AwarenessMedia: React.FC<AwarenessMediaProps> = ({
  type,
  title,
  description,
  mediaUrl,
  mediaType,
  className,
  ctaText,
  ctaLink,
  onCTAClick,
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'prevention':
        return 'from-green-500 to-emerald-600';
      case 'screening':
        return 'from-blue-500 to-cyan-600';
      case 'support':
        return 'from-purple-500 to-indigo-600';
      case 'education':
        return 'from-orange-500 to-red-600';
      case 'testimonial':
        return 'from-pink-500 to-rose-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'prevention':
        return '🛡️';
      case 'screening':
        return '🔍';
      case 'support':
        return '🤝';
      case 'education':
        return '📚';
      case 'testimonial':
        return '💬';
      default:
        return '📱';
    }
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden', className)}>
      <div className="relative">
        {mediaType === 'image' ? (
          <EnhancedImage
            src={mediaUrl}
            alt={title}
            fill
            aspectRatio="video"
            className="group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <HeroVideo
            src={mediaUrl}
            className="aspect-video"
            controls
            autoPlay={false}
          />
        )}
        
        {/* Type badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getTypeColor()}`}>
          <span className="mr-1">{getTypeIcon()}</span>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
        
        {ctaText && (
          <button
            onClick={onCTAClick}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 bg-gradient-to-r ${getTypeColor()}`}
          >
            {ctaText}
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Testimonial Video Component
interface TestimonialVideoProps {
  videoSrc: string;
  thumbnailSrc: string;
  personName: string;
  personRole: string;
  testimonialText: string;
  className?: string;
}

export const TestimonialVideo: React.FC<TestimonialVideoProps> = ({
  videoSrc,
  thumbnailSrc,
  personName,
  personRole,
  testimonialText,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={cn('bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden', className)}>
      <div className="relative">
        {!isPlaying ? (
          <div className="relative cursor-pointer" onClick={() => setIsPlaying(true)}>
            <EnhancedImage
              src={thumbnailSrc}
              alt={`${personName} testimonial`}
              fill
              aspectRatio="video"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <PlayIcon className="h-8 w-8 text-gray-900 ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <HeroVideo
            src={videoSrc}
            className="aspect-video"
            controls
            autoPlay
            onEnded={() => setIsPlaying(false)}
          />
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <span className="text-pink-600 font-bold text-lg">
              {personName.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{personName}</h4>
            <p className="text-sm text-gray-600">{personRole}</p>
          </div>
        </div>
        
        <blockquote className="text-gray-700 italic">
          "{testimonialText}"
        </blockquote>
      </div>
    </div>
  );
};

export default {
  EnhancedImage,
  HeroVideo,
  ImageGallery,
  AwarenessMedia,
  TestimonialVideo,
}; 