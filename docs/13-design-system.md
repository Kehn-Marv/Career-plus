# Design System

## 🎨 Visual Identity

### Brand Colors

#### Primary Palette
```css
--primary-50: #f0f9ff;
--primary-100: #e0f2fe;
--primary-200: #bae6fd;
--primary-300: #7dd3fc;
--primary-400: #38bdf8;
--primary-500: #0ea5e9;  /* Main brand color */
--primary-600: #0284c7;
--primary-700: #0369a1;
--primary-800: #075985;
--primary-900: #0c4a6e;
```

#### Secondary Palette
```css
--secondary-50: #faf5ff;
--secondary-100: #f3e8ff;
--secondary-200: #e9d5ff;
--secondary-300: #d8b4fe;
--secondary-400: #c084fc;
--secondary-500: #a855f7;  /* Accent color */
--secondary-600: #9333ea;
--secondary-700: #7e22ce;
--secondary-800: #6b21a8;
--secondary-900: #581c87;
```

#### Neutral Palette
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

#### Semantic Colors
```css
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography

#### Font Families
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

#### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Line Heights
```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

---

## 📐 Spacing System

### Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Layout Spacing
- **Component padding**: 16px (space-4)
- **Section padding**: 32px (space-8)
- **Page margins**: 24px (space-6)
- **Grid gap**: 16px (space-4)

---

## 🔲 Components

### Buttons

#### Primary Button
```tsx
<button className="
  px-6 py-3
  bg-primary-500 hover:bg-primary-600
  text-white font-medium
  rounded-lg
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="
  px-6 py-3
  bg-white hover:bg-gray-50
  text-gray-700 font-medium
  border border-gray-300
  rounded-lg
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  Secondary Action
</button>
```

#### Sizes
- **Small**: `px-3 py-1.5 text-sm`
- **Medium**: `px-4 py-2 text-base` (default)
- **Large**: `px-6 py-3 text-lg`

### Input Fields

```tsx
<input className="
  w-full px-4 py-2
  border border-gray-300 rounded-lg
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
  placeholder:text-gray-400
  disabled:bg-gray-100 disabled:cursor-not-allowed
" />
```

### Cards

```tsx
<div className="
  bg-white
  border border-gray-200
  rounded-xl
  shadow-sm
  p-6
  hover:shadow-md
  transition-shadow duration-200
">
  Card Content
</div>
```

### Modals

```tsx
<div className="
  fixed inset-0 z-50
  flex items-center justify-center
  bg-black bg-opacity-50
  backdrop-blur-sm
">
  <div className="
    bg-white
    rounded-2xl
    shadow-2xl
    max-w-2xl w-full
    max-h-[90vh]
    overflow-y-auto
    p-6
  ">
    Modal Content
  </div>
</div>
```

### Badges

```tsx
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium
  bg-primary-100 text-primary-800
">
  Badge
</span>
```

---

## 🎭 Icons

### Icon Library
Using **Lucide React** for consistent, customizable icons.

```tsx
import { Upload, Check, X, AlertCircle } from 'lucide-react'

<Upload className="w-5 h-5" />
```

### Icon Sizes
- **Small**: `w-4 h-4` (16px)
- **Medium**: `w-5 h-5` (20px)
- **Large**: `w-6 h-6` (24px)
- **XLarge**: `w-8 h-8` (32px)

---

## 📱 Responsive Design

### Breakpoints
```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

### Usage
```tsx
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
  Responsive Grid
</div>
```

---

## ✨ Animations

### Transitions
```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
```

### Common Animations
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale in */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## ♿ Accessibility

### Focus States
```css
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Color Contrast
- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

### ARIA Labels
```tsx
<button aria-label="Upload resume">
  <Upload />
</button>
```

---

## 📋 Usage Guidelines

### Do's ✅
- Use consistent spacing
- Follow color palette
- Maintain hierarchy
- Ensure accessibility
- Test responsiveness

### Don'ts ❌
- Don't use custom colors
- Don't skip focus states
- Don't ignore mobile
- Don't use tiny text
- Don't overcomplicate

---

**Next**: [Accessibility Guidelines](./14-accessibility.md)
