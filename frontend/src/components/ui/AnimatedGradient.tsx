import React, { useEffect, useState } from 'react';

interface AnimatedGradientProps {
  children?: React.ReactNode;
  className?: string;
  colors?: string[];
  duration?: number;
}

/**
 * AnimatedGradient component with smooth color transitions
 * Uses GPU acceleration for optimal performance
 * Respects prefers-reduced-motion setting
 * 
 * PERFORMANCE: Non-critical animation that doesn't block initial render
 * Animation starts immediately but uses GPU acceleration for smooth 60fps
 */
export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
  children,
  className = '',
  colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
  duration = 15,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes to the preference
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const gradientStyle = prefersReducedMotion
    ? {
        // Static gradient when reduced motion is preferred
        background: `linear-gradient(270deg, ${colors.join(', ')})`,
        backgroundSize: '100% 100%',
      }
    : {
        // Animated gradient with GPU acceleration
        background: `linear-gradient(270deg, ${colors.join(', ')})`,
        backgroundSize: '400% 400%',
        animation: `gradient-shift ${duration}s ease infinite`,
        // Use will-change sparingly - only during animation
        // GPU acceleration via transform (even though we're animating background-position)
        transform: 'translateZ(0)', // Force GPU acceleration
      };

  return (
    <div className={`animated-gradient ${className}`} style={gradientStyle}>
      {children}
    </div>
  );
};

export default AnimatedGradient;
