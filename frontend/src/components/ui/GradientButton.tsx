import React from 'react';

export interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * GradientButton component with premium gradient background
 * Features purple-blue gradient with glow shadow effect
 * Includes hover state with lift and increased glow
 * Supports loading state with spinner
 */
export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  type = 'button',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out';
  
  // Gradient background with glow shadow
  const gradientClasses = 'bg-gradient-button text-white shadow-[0_4px_16px_rgba(102,126,234,0.3)]';
  
  // Hover state: lift + increased glow + pulse animation
  const hoverClasses = 'hover:shadow-[0_8px_24px_rgba(102,126,234,0.4)] hover:-translate-y-0.5 hover:scale-[1.02] hover:animate-glow-pulse';
  
  // Active state
  const activeClasses = 'active:translate-y-0 active:scale-100';
  
  // Respect prefers-reduced-motion - disable all animations and transitions
  const motionClasses = 'motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:animate-none motion-reduce:active:transform-none';
  
  // Size variants - Ensure minimum 44px height for touch targets
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };
  
  // Disabled state
  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${gradientClasses} ${hoverClasses} ${activeClasses} ${motionClasses} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
};
