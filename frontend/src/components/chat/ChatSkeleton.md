# ChatSkeleton Component

## Overview

The `ChatSkeleton` component provides an animated placeholder UI that displays while the chat interface is initializing. It prevents the flash of unstyled content (FOUC) and provides visual feedback to users during loading.

## Features

- **Matches ChatInterface Layout**: Skeleton structure mirrors the actual ChatInterface component (header, messages, input)
- **Smooth Animation**: Uses Tailwind's `animate-pulse` for subtle loading animation
- **Accessible**: Includes proper ARIA attributes for screen readers
- **Consistent Design**: Uses the same design system (colors, spacing, shadows) as the actual chat interface

## Usage

```tsx
import { ChatSkeleton } from './ChatSkeleton'

function ChatInterface({ analysisId }: ChatInterfaceProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  
  // Show skeleton during initialization
  if (isInitializing) {
    return <ChatSkeleton />
  }
  
  return (
    // Actual chat interface
  )
}
```

## Accessibility

The component includes several accessibility features:

- `role="status"` - Indicates a status update region
- `aria-busy="true"` - Indicates content is loading
- `aria-label="Loading chat interface"` - Provides context for screen readers
- `aria-hidden="true"` - Hides decorative skeleton elements from screen readers
- `.sr-only` text - Provides additional context for screen reader users

## Structure

The skeleton matches the ChatInterface structure:

1. **Header**: Bot icon placeholder + title/subtitle placeholders
2. **Messages Area**: 3 message bubble placeholders (assistant, user, assistant)
3. **Input Area**: Textarea placeholder + send button placeholder + help text placeholder

## Styling

- Uses consistent Tailwind classes matching ChatInterface
- Gray color palette for skeleton elements (gray-200, gray-300)
- Maintains same spacing, borders, and shadows as actual interface
- Responsive design matches ChatInterface breakpoints
