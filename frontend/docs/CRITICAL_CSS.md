# Critical CSS Implementation Guide

## Overview

Critical CSS is the minimal CSS required to render above-the-fold content. Inlining critical CSS improves First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

## Current Optimization Status

✅ **Implemented:**
- Tailwind CSS purging (removes unused classes)
- CSS minification via Vite
- CSS code splitting per chunk
- Gzip compression in production

⏳ **To Implement:**
- Critical CSS extraction and inlining
- Deferred loading of non-critical CSS

## Target Metrics

- **CSS Bundle Size:** < 50KB gzipped
- **Critical CSS:** < 14KB inline (for above-the-fold content)
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s

## Implementation Steps

### 1. Identify Critical CSS

Critical CSS for Career+ landing page includes:
- Hero section styles (gradient backgrounds, typography)
- Header/navigation styles
- Glass card base styles (without hover effects)
- Button base styles
- Layout utilities (flexbox, grid)

### 2. Extract Critical CSS

Use one of these tools:

#### Option A: Manual Extraction
```bash
# Build the project
npm run build

# Identify critical styles from index.css
# Extract styles for:
# - .hero-headline
# - .glass-light (base only)
# - .btn-primary (base only)
# - Layout utilities
```

#### Option B: Automated with Critical
```bash
# Install critical package
npm install -D critical

# Add to package.json scripts:
"build:critical": "critical src/index.html --base dist --inline --minify"
```

#### Option C: Vite Plugin
```bash
# Install vite-plugin-critical
npm install -D vite-plugin-critical

# Add to vite.config.ts:
import critical from 'vite-plugin-critical'

plugins: [
  critical({
    pages: ['/'],
    inline: true,
    minify: true,
    extract: true,
    dimensions: [
      { width: 375, height: 667 },  // Mobile
      { width: 1920, height: 1080 } // Desktop
    ]
  })
]
```

### 3. Inline Critical CSS

Add critical CSS to `index.html` in a `<style>` tag:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Career+ - AI Resume Optimizer</title>
    
    <!-- Critical CSS (inline) -->
    <style>
      /* Hero section critical styles */
      .hero-headline { /* ... */ }
      .glass-light { /* ... */ }
      /* Add other critical styles */
    </style>
  </head>
  <body>
    <!-- App content -->
  </body>
</html>
```

### 4. Defer Non-Critical CSS

Load non-critical CSS asynchronously:

```html
<!-- Defer non-critical CSS -->
<link rel="preload" href="/assets/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/assets/main.css"></noscript>
```

### 5. Verify Performance

After implementing critical CSS:

```bash
# Build and analyze
npm run build:analyze

# Run Lighthouse audit
npm run preview
# Open Chrome DevTools > Lighthouse > Run audit
```

## Best Practices

1. **Keep Critical CSS Small:** < 14KB inline
2. **Include Only Above-the-Fold:** Hero, header, first section
3. **Exclude Hover States:** Load with main CSS
4. **Exclude Animations:** Load with main CSS
5. **Test on Multiple Devices:** Mobile and desktop viewports

## Current CSS Structure

```
src/index.css
├── Base styles (critical)
│   ├── Typography
│   ├── Colors
│   └── Layout
├── Component styles (split by chunk)
│   ├── Glass effects
│   ├── Buttons
│   └── Cards
└── Utilities (purged by Tailwind)
    ├── Animations
    ├── Hover states
    └── Responsive utilities
```

## Monitoring

Check CSS bundle size after each build:

```bash
npm run build:analyze
```

Expected output:
```
📊 CSS Bundle Size Analysis

Target: < 50KB gzipped

──────────────────────────────────────────────────────────────────────
✅ index-abc123.css
   Original: 85.42 KB
   Gzipped:  12.34 KB

──────────────────────────────────────────────────────────────────────

Total CSS Size:
   Original: 85.42 KB
   Gzipped:  12.34 KB

✅ All CSS files meet the 50KB gzipped target!
```

## Resources

- [Critical CSS Guide](https://web.dev/extract-critical-css/)
- [Tailwind CSS Optimization](https://tailwindcss.com/docs/optimizing-for-production)
- [Vite CSS Code Splitting](https://vitejs.dev/guide/features.html#css-code-splitting)
