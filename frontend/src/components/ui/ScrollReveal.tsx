import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * ScrollReveal component that animates elements when they enter the viewport
 * Uses Intersection Observer API for efficient viewport detection
 * Respects prefers-reduced-motion setting
 * 
 * PERFORMANCE: Lazy loads animations only when elements enter viewport
 * Defers non-critical animations to improve initial page load
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  threshold = 0.1,
  triggerOnce = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // If reduced motion is preferred, show immediately without animation
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    // PERFORMANCE: Lazy load animations using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            
            // If triggerOnce is true, stop observing after first trigger
            // This improves performance by cleaning up observers
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            // If triggerOnce is false, hide when out of view
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element enters viewport
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, triggerOnce]);

  const delayClass = delay > 0 ? `delay-${Math.round(delay * 1000)}` : '';
  const animationClass = isVisible ? 'animate-fade-in-up' : 'opacity-0';

  return (
    <div
      ref={elementRef}
      className={`${animationClass} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
