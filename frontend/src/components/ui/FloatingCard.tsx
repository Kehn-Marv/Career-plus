import React from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

/**
 * FloatingCard component with subtle floating animation
 * Optimized for performance using transform only
 * Respects prefers-reduced-motion setting
 */
export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  duration = 6,
  delay = 0,
}) => {
  const style = {
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };

  return (
    <div
      className={`animate-float ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default FloatingCard;
