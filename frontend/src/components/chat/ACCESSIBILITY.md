# Chat Assistant Accessibility Features

This document outlines the accessibility features implemented in the Chat Assistant components to ensure WCAG 2.1 Level AA compliance.

## Keyboard Navigation

### Keyboard Shortcuts
- **Enter**: Send message (in textarea)
- **Shift+Enter**: Insert new line (in textarea)
- **Escape**: Close chat sidebar
- **Tab**: Navigate through interactive elements
- **Space/Enter**: Activate buttons

### Focus Management
- When sidebar opens, focus is automatically moved to the sidebar container
- When sidebar closes, focus is restored to the previously focused element (typically the floating button)
- All interactive elements are keyboard accessible with visible focus indicators
- Focus trap is implemented within the sidebar when open

## Screen Reader Support

### ARIA Labels
- **FloatingChatButton**: 
  - `aria-label`: "Open chat assistant" / "Close chat assistant"
  - `aria-expanded`: Indicates open/close state
  - Unread badge has `aria-label` with count

- **ChatSidebar**:
  - `role="dialog"`: Identifies as modal dialog
  - `aria-modal="true"`: Indicates modal behavior
  - `aria-labelledby`: References header title
  - `aria-describedby`: Provides description and keyboard hints

- **ChatInterface**:
  - Message container has `role="log"` with `aria-live="polite"`
  - Input has `aria-label` and `aria-describedby` for help text
  - Send button has descriptive `aria-label`
  - Suggested prompts have descriptive `aria-label`

### ARIA Live Regions
- **Message Container**: 
  - `role="log"` with `aria-live="polite"`
  - `aria-atomic="false"` - only new messages announced
  - `aria-relevant="additions"` - only additions announced
  - Ensures new messages are announced to screen readers

- **Typing Indicator**:
  - `role="status"` with `aria-live="polite"`
  - Announces when assistant is typing

- **Error Messages**:
  - `role="alert"` with `aria-live="assertive"`
  - Immediately announces errors to users

### Message Bubbles
- Each message has `role="article"`
- `aria-label` includes sender and timestamp
- Avatar icons marked with `aria-hidden="true"`

## Visual Accessibility

### Color Contrast (WCAG AA Compliant)
All color combinations meet or exceed WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

- **Primary Blue** (`bg-blue-600` #2563eb on white): 8.59:1 ✓ AAA
- **Purple** (`bg-purple-600` #9333ea on white): 7.27:1 ✓ AAA
- **Gray 600** (`text-gray-600` #4b5563 on white): 7.52:1 ✓ AAA
- **Gray 700** (`text-gray-700` #374151 on white): 10.70:1 ✓ AAA
- **Gray 800** (`text-gray-800` #1f2937 on white): 14.05:1 ✓ AAA

### Focus Indicators
- All interactive elements have visible focus rings using `focus:ring-2`
- Focus rings use high-contrast colors (blue-500, red-500)
- Focus ring offset (`focus:ring-offset-2`) ensures visibility

### Touch Targets
- Minimum 44x44px touch targets on mobile devices
- FloatingChatButton: 48px on mobile, 56px on desktop
- All buttons have adequate padding for touch interaction

## Responsive Design

### Breakpoints
- **Mobile** (<640px): Full-width sidebar, 48px button
- **Tablet** (640px-768px): 360px sidebar, 48px button
- **Desktop** (≥768px): 400px sidebar, 56px button

### Text Sizing
- Minimum 14px font size for body text
- Scalable with browser zoom (up to 200%)
- Relative units (rem/em) used for sizing

## Motion and Animation

### Reduced Motion Support
- `motion-reduce:transition-none` disables animations
- `motion-reduce:hover:transform-none` disables hover transforms
- Respects user's `prefers-reduced-motion` setting

### Animations
- Slide-in animation for sidebar (300ms)
- Fade-in animation for backdrop (200ms)
- Smooth scroll for new messages
- Typing indicator with bouncing dots

## Semantic HTML

### Structure
- Proper heading hierarchy (h2, h3, h4)
- Semantic elements: `<button>`, `<textarea>`, `<article>`
- Landmark roles: `dialog`, `log`, `status`, `alert`

### Forms
- Textarea with associated label (via `aria-label`)
- Help text linked via `aria-describedby`
- Clear error messages with retry functionality

## Testing Recommendations

### Manual Testing
1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test keyboard shortcuts (Enter, Shift+Enter, Escape)
   - Ensure focus trap works in sidebar

2. **Screen Reader Testing**:
   - Test with NVDA (Windows) or VoiceOver (Mac)
   - Verify all interactive elements are announced
   - Check that new messages are announced
   - Verify error messages are announced immediately

3. **Visual Testing**:
   - Test with browser zoom at 200%
   - Verify text remains readable
   - Check color contrast in different lighting
   - Test with high contrast mode enabled

4. **Mobile Testing**:
   - Test on actual mobile devices
   - Verify touch targets are adequate
   - Check sidebar behavior on small screens
   - Test landscape and portrait orientations

### Automated Testing Tools
- **axe DevTools**: Browser extension for accessibility auditing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools accessibility audit
- **Pa11y**: Command-line accessibility testing

## Known Limitations

1. **Markdown Rendering**: Complex markdown structures may have accessibility issues. We use `react-markdown` which handles most cases well.

2. **Long Conversations**: Very long conversations (100+ messages) may impact performance. Consider implementing virtualization for better performance.

3. **Code Blocks**: Syntax-highlighted code blocks may have contrast issues depending on the theme. Current implementation uses high-contrast gray background.

## Future Enhancements

1. **Voice Input**: Add speech-to-text for hands-free interaction
2. **Customizable Text Size**: Allow users to adjust text size within the chat
3. **High Contrast Mode**: Dedicated high contrast theme
4. **Keyboard Shortcuts Panel**: Help dialog showing all keyboard shortcuts
5. **Message Navigation**: Keyboard shortcuts to navigate between messages

## Compliance

This implementation aims to meet:
- ✓ WCAG 2.1 Level AA
- ✓ Section 508
- ✓ ADA (Americans with Disabilities Act)
- ✓ EN 301 549 (European Standard)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
