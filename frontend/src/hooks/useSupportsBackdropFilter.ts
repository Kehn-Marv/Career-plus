import { useEffect, useState } from 'react';

/**
 * Hook to detect if the browser supports backdrop-filter CSS property
 * Returns true if supported, false otherwise
 * 
 * This is used to provide fallback styles for glassmorphism effects
 * on browsers that don't support backdrop-filter (mainly older browsers)
 */
export const useSupportsBackdropFilter = (): boolean => {
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    // Check if backdrop-filter is supported
    const testElement = document.createElement('div');
    testElement.style.cssText = 'backdrop-filter: blur(1px);';
    
    const supportsBackdropFilter = 
      testElement.style.backdropFilter !== '' ||
      // @ts-ignore - checking for webkit prefix
      testElement.style.webkitBackdropFilter !== '';
    
    setIsSupported(supportsBackdropFilter);
  }, []);

  return isSupported;
};

/**
 * Utility function to detect backdrop-filter support synchronously
 * Useful for server-side rendering or initial checks
 */
export const detectBackdropFilterSupport = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const testElement = document.createElement('div');
  testElement.style.cssText = 'backdrop-filter: blur(1px);';
  
  return (
    testElement.style.backdropFilter !== '' ||
    // @ts-ignore - checking for webkit prefix
    testElement.style.webkitBackdropFilter !== ''
  );
};
