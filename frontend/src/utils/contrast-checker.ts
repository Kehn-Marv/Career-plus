/**
 * Contrast Checker Utility
 * Verifies WCAG AA compliance for text and icon contrast ratios
 * 
 * WCAG AA Requirements:
 * - Normal text (< 18px): 4.5:1 minimum
 * - Large text (≥ 18px or ≥ 14px bold): 3:1 minimum
 * - UI components and icons: 3:1 minimum
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex format (e.g., #FFFFFF)');
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  options: {
    fontSize?: number; // in pixels
    isBold?: boolean;
    isIcon?: boolean;
  } = {}
): { passes: boolean; ratio: number; required: number } {
  const ratio = getContrastRatio(foreground, background);
  const { fontSize = 16, isBold = false, isIcon = false } = options;

  let required: number;

  if (isIcon) {
    // UI components and icons require 3:1
    required = 3;
  } else if (fontSize >= 18 || (fontSize >= 14 && isBold)) {
    // Large text requires 3:1
    required = 3;
  } else {
    // Normal text requires 4.5:1
    required = 4.5;
  }

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
}

/**
 * Verify all color combinations used in the app
 * Returns a report of contrast ratios
 */
export function verifyAppContrasts(): {
  passed: Array<{ name: string; ratio: number; required: number }>;
  failed: Array<{ name: string; ratio: number; required: number }>;
} {
  const tests = [
    // Text on white backgrounds
    { name: 'gray-900 on white (body text)', fg: '#1C1917', bg: '#FFFFFF', fontSize: 16 },
    { name: 'gray-800 on white (body text)', fg: '#292524', bg: '#FFFFFF', fontSize: 16 },
    { name: 'gray-700 on white (body text)', fg: '#44403C', bg: '#FFFFFF', fontSize: 16 },
    { name: 'gray-600 on white (body text)', fg: '#57534E', bg: '#FFFFFF', fontSize: 16 },
    
    // Text on gray-50 backgrounds
    { name: 'gray-900 on gray-50 (body text)', fg: '#1C1917', bg: '#FAFAF9', fontSize: 16 },
    { name: 'gray-700 on gray-50 (body text)', fg: '#44403C', bg: '#FAFAF9', fontSize: 16 },
    { name: 'gray-600 on gray-50 (body text)', fg: '#57534E', bg: '#FAFAF9', fontSize: 16 },
    
    // Large text (headings)
    { name: 'gray-900 on white (heading)', fg: '#1C1917', bg: '#FFFFFF', fontSize: 24, isBold: true },
    { name: 'gray-900 on gray-50 (heading)', fg: '#1C1917', bg: '#FAFAF9', fontSize: 24, isBold: true },
    
    // Icons
    { name: 'blue-500 icon on white', fg: '#3B82F6', bg: '#FFFFFF', isIcon: true },
    { name: 'purple-500 icon on white', fg: '#8B5CF6', bg: '#FFFFFF', isIcon: true },
    { name: 'success icon on white', fg: '#10B981', bg: '#FFFFFF', isIcon: true },
    { name: 'gray-700 icon on white', fg: '#44403C', bg: '#FFFFFF', isIcon: true },
    
    // Button text
    { name: 'white on purple-500 (button)', fg: '#FFFFFF', bg: '#8B5CF6', fontSize: 16, isBold: true },
    { name: 'white on blue-500 (button)', fg: '#FFFFFF', bg: '#3B82F6', fontSize: 16, isBold: true },
    
    // Glass card text (semi-transparent backgrounds - testing worst case)
    { name: 'gray-800 on glass-light', fg: '#292524', bg: '#FFFFFF', fontSize: 16 },
    { name: 'gray-700 on glass-light', fg: '#44403C', bg: '#FFFFFF', fontSize: 16 },
  ];

  const passed: Array<{ name: string; ratio: number; required: number }> = [];
  const failed: Array<{ name: string; ratio: number; required: number }> = [];

  tests.forEach((test) => {
    const result = meetsWCAGAA(test.fg, test.bg, {
      fontSize: test.fontSize,
      isBold: test.isBold,
      isIcon: test.isIcon,
    });

    const entry = {
      name: test.name,
      ratio: result.ratio,
      required: result.required,
    };

    if (result.passes) {
      passed.push(entry);
    } else {
      failed.push(entry);
    }
  });

  return { passed, failed };
}

/**
 * Log contrast verification results to console
 * Useful for development and testing
 */
export function logContrastReport(): void {
  const { passed, failed } = verifyAppContrasts();

  console.group('🎨 WCAG AA Contrast Verification Report');
  
  console.group(`✅ Passed (${passed.length})`);
  passed.forEach(({ name, ratio, required }) => {
    console.log(`${name}: ${ratio}:1 (required: ${required}:1)`);
  });
  console.groupEnd();

  if (failed.length > 0) {
    console.group(`❌ Failed (${failed.length})`);
    failed.forEach(({ name, ratio, required }) => {
      console.warn(`${name}: ${ratio}:1 (required: ${required}:1)`);
    });
    console.groupEnd();
  }

  console.groupEnd();
}
