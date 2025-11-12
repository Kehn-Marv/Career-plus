import React, { useState, useEffect, useRef } from 'react';

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  webpSrc?: string; // WebP version for better performance
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage component with Intersection Observer
 * Loads images only when they enter the viewport
 * Supports WebP format with JPEG fallback
 * 
 * PERFORMANCE: Defers image loading until needed
 * Optimizes initial page load time
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3C/svg%3E',
  webpSrc,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Check if browser supports IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // Fallback: load image immediately
      loadImage();
      return;
    }

    // PERFORMANCE: Use Intersection Observer to lazy load image
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, webpSrc]);

  const loadImage = () => {
    // Try WebP first if available
    if (webpSrc && supportsWebP()) {
      const webpImg = new Image();
      webpImg.onload = () => {
        setImageSrc(webpSrc);
        setIsLoaded(true);
        onLoad?.();
      };
      webpImg.onerror = loadFallbackImage;
      webpImg.src = webpSrc;
    } else {
      loadFallbackImage();
    }
  };

  const loadFallbackImage = () => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = onError || (() => {});
    img.src = src;
  };

  const supportsWebP = (): boolean => {
    // Check if browser supports WebP
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      loading="lazy" // Native lazy loading as additional optimization
      decoding="async" // Async decoding for better performance
      onError={onError}
    />
  );
};

export default LazyImage;
