# Optimization Error Components

Comprehensive error handling UI components for resume optimization operations.

## Components

### ErrorNotification
Full-featured error notification with recovery actions.

### CompactErrorNotification
Inline error display for space-constrained areas.

### ErrorList
Display multiple errors with batch dismiss functionality.

## Usage

```tsx
import { ErrorNotification } from '@/components/optimization'
import { handleOptimizationError } from '@/lib/optimization/error-handler'

// In your component
const [error, setError] = useState<OptimizationError | null>(null)

try {
  await optimizeResume()
} catch (err) {
  const optimizationError = handleOptimizationError(err, 'resume optimization')
  setError(optimizationError)
}

// Render
{error && (
  <ErrorNotification
    error={error}
    onRetry={handleRetry}
    onDismiss={() => setError(null)}
  />
)}
```

## Features

- Automatic error classification
- Recovery action buttons
- User-friendly messages
- Accessibility compliant
- Preserves original content on errors
