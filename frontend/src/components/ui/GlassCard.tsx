import React from 'react';
import { useSupportsBackdropFilter } from '../../hooks/useSupportsBackdropFilter';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark';
  hover?: boolean;
  onClick?: () => void;
}

/**
 * GlassCard component with glassmorphism effect
 * Features semi-transparent background with backdrop blur
 * Includes fallback for browsers without backdrop-filter support
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Mobile: 8px blur (reduced from 12px for better performance)
 * - Desktop: 12px blur
 * - GPU acceleration via transform
 * - Optimized for 60fps on mid-range devices
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'light',
  hover = true,
  onClick,
}) => {
  const supportsBackdropFilter = useSupportsBackdropFilter();
  
  // GPU acceleration for smooth animations
  const baseClasses = 'rounded-xl transition-all duration-300 ease-out transform-gpu';
  
  // Glassmorphism styles with backdrop-filter support
  const variantClasses = {
    light: supportsBackdropFilter
      ? 'bg-white/70 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
      : 'bg-white/95 border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
    dark: supportsBackdropFilter
      ? 'bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
      : 'bg-gray-900/95 border border-gray-800 shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
  };
  
  const hoverClasses = hover
    ? supportsBackdropFilter
      ? 'hover:bg-white/80 hover:border-white/40 hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:backdrop-blur-[16px]'
      : 'hover:bg-white hover:border-gray-300 hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] hover:-translate-y-0.5'
    : '';
  
  // PERFORMANCE: Mobile 8px blur vs Desktop 12px blur for optimal performance
  const backdropBlurClass = supportsBackdropFilter ? 'backdrop-blur-[8px] md:backdrop-blur-[12px]' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${backdropBlurClass} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
