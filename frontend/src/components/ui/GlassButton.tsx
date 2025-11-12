import React from 'react';
import { useSupportsBackdropFilter } from '../../hooks/useSupportsBackdropFilter';

export interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

/**
 * GlassButton component with glassmorphic background
 * Features backdrop-filter blur effect with semi-transparent background
 * Includes hover state with increased opacity and blur
 * Supports icon + text layout
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  type = 'button',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
}) => {
  const supportsBackdropFilter = useSupportsBackdropFilter();
  
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out';
  
  // Glassmorphic background with backdrop-filter support
  const glassClasses = supportsBackdropFilter
    ? 'bg-white/70 border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-[12px] text-gray-900'
    : 'bg-white/95 border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-gray-900';
  
  // Hover state: increased opacity + blur
  const hoverClasses = supportsBackdropFilter
    ? 'hover:bg-white/90 hover:border-white/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:backdrop-blur-[16px] hover:-translate-y-0.5 hover:scale-[1.02]'
    : 'hover:bg-white hover:border-gray-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:scale-[1.02]';
  
  // Active state
  const activeClasses = 'active:translate-y-0 active:scale-100';
  
  // Respect prefers-reduced-motion - disable all animations and transitions
  const motionClasses = 'motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none';
  
  // Size variants - Ensure minimum 44px height for touch targets
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[44px] gap-2',
    md: 'px-6 py-3 text-base min-h-[48px] gap-2',
    lg: 'px-8 py-4 text-lg min-h-[52px] gap-3',
  };
  
  // Icon size variants
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  // Disabled state
  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${glassClasses} ${hoverClasses} ${activeClasses} ${motionClasses} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {icon && iconPosition === 'left' && (
        <span className={`flex-shrink-0 ${iconSizeClasses[size]}`}>
          {icon}
        </span>
      )}
      <span>{children}</span>
      {icon && iconPosition === 'right' && (
        <span className={`flex-shrink-0 ${iconSizeClasses[size]}`}>
          {icon}
        </span>
      )}
    </button>
  );
};
