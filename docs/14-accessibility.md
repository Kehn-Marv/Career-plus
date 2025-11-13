# Accessibility Guidelines

Career+ is fully compliant with WCAG 2.1 AA standards.

## 📋 Complete Implementation

For the complete accessibility implementation details, see:
- [ACCESSIBILITY_COMPLETE.md](../ACCESSIBILITY_COMPLETE.md) - Full accessibility documentation

## ✅ Key Features

### Keyboard Navigation
- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order
- Escape key closes modals

### Screen Reader Support
- ARIA live regions for dynamic content
- Proper heading structure
- Alt text for images
- Form labels and descriptions

### Visual Accessibility
- WCAG AA color contrast (4.5:1 minimum)
- High contrast mode support
- Focus indicators with 3:1 contrast
- Scalable text and UI

### Motor Accessibility
- Large click targets (44x44px minimum)
- No time limits
- Keyboard alternatives for all actions
- Reduced motion support

## 🛠️ Accessibility Utilities

### ARIA Announcer
```typescript
import { announce } from '@/lib/accessibility/aria-announcer'

// Announce success
announce('Resume uploaded successfully', 'polite')

// Announce error
announce('Upload failed', 'assertive')
```

### Focus Trap
```typescript
import { useFocusTrap } from '@/lib/accessibility/focus-trap'

function Modal({ isOpen, onClose }) {
  const modalRef = useFocusTrap(isOpen)
  
  return (
    <div ref={modalRef} role="dialog">
      {/* Modal content */}
    </div>
  )
}
```

### Keyboard Navigation
```typescript
import { useKeyboardNavigation } from '@/lib/accessibility/keyboard-navigation'

function List({ items }) {
  const { activeIndex, handleKeyDown } = useKeyboardNavigation(items.length)
  
  return (
    <ul onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li key={index} tabIndex={activeIndex === index ? 0 : -1}>
          {item}
        </li>
      ))}
    </ul>
  )
}
```

## 🧪 Testing

### Manual Testing
- [x] Keyboard-only navigation
- [x] Screen reader testing (NVDA, JAWS, VoiceOver)
- [x] Focus indicators visible
- [x] Tab order logical
- [x] ARIA labels present

### Automated Testing
```bash
# Run accessibility tests
npm run test:a11y

# Check with axe-core
npm run test:axe
```

## 📊 WCAG 2.1 AA Compliance

### Perceivable ✅
- 1.1.1 Non-text Content
- 1.3.1 Info and Relationships
- 1.4.3 Contrast (Minimum)
- 1.4.11 Non-text Contrast

### Operable ✅
- 2.1.1 Keyboard
- 2.1.2 No Keyboard Trap
- 2.4.3 Focus Order
- 2.4.7 Focus Visible

### Understandable ✅
- 3.2.1 On Focus
- 3.2.2 On Input
- 3.3.1 Error Identification
- 3.3.2 Labels or Instructions

### Robust ✅
- 4.1.2 Name, Role, Value
- 4.1.3 Status Messages

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)

---

**Status**: ✅ Complete and Production Ready

For full implementation details, see [ACCESSIBILITY_COMPLETE.md](../ACCESSIBILITY_COMPLETE.md)
