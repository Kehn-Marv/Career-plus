import React from 'react';
import { useSupportsBackdropFilter } from '../../hooks/useSupportsBackdropFilter';

export interface GlassBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * GlassBadge component for trust indicators and small labels
 * Features glassmorphic styling with icon + text layout
 * Includes fallback for browsers without backdrop-filter support
 * 
 * PERFORMANCE: Optimized blur intensity (8px mobile, 12px desktop)
 */
export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  icon,
  size = 'md',
  className = '',
}) => {
  const supportsBackdropFilter = useSupportsBackdropFilter();
  
  // PERFORMANCE: Reduced blur on mobile (8px) for better performance
  const baseClasses = supportsBackdropFilter
    ? 'inline-flex items-center gap-2 rounded-full backdrop-blur-[8px] md:backdrop-blur-[12px] bg-white/70 border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 transform-gpu'
    : 'inline-flex items-center gap-2 rounded-full bg-white/95 border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 transform-gpu';
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      {icon && (
        <span className={`flex-shrink-0 ${iconSizeClasses[size]}`}>
          {icon}
        </span>
      )}
      <span className="font-medium">{children}</span>
    </div>
  );
};
