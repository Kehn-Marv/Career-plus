# Progress Tracking and Feedback Components

This directory contains comprehensive progress tracking and user feedback components for long-running operations in the Career+ application.

## Components

### ProgressIndicator

A reusable progress indicator that displays:
- Animated progress bar with percentage
- Current step/phase name
- Detailed status message
- Estimated time remaining (optional)
- Spinner animation

**Usage:**

```tsx
import { ProgressIndicator } from '@/components/progress'

<ProgressIndicator
  percentage={45}
  step="applying"
  message="Applying recommendations and fixes..."
  estimatedTimeRemaining={15}
  color="emerald"
  showSpinner={true}
/>
```

**Props:**
- `percentage` (number): Current progress (0-100)
- `step` (string): Current step/phase name
- `message` (string): Detailed status message
- `estimatedTimeRemaining` (number, optional): Seconds remaining
- `compact` (boolean, optional): Show compact version
- `color` ('emerald' | 'blue' | 'purple' | 'orange', optional): Color scheme
- `showSpinner` (boolean, optional): Show spinner animation

### ProgressSteps

Displays a vertical list of steps with completion status indicators.

**Usage:**

```tsx
import { ProgressSteps } from '@/components/progress'

<ProgressSteps
  steps={[
    { id: '1', label: 'Collecting data', status: 'complete' },
    { id: '2', label: 'Applying fixes', status: 'active' },
    { id: '3', label: 'Formatting', status: 'pending' },
    { id: '4', label: 'Saving', status: 'pending' }
  ]}
  compact={false}
/>
```

### SuccessNotification

Displays success messages with action summaries and optional action buttons.

**Usage:**

```tsx
import { SuccessNotification } from '@/components/progress'

<SuccessNotification
  title="Optimization Complete!"
  message="Successfully applied 12 fixes to your resume."
  summary={[
    'Keywords optimized for ATS',
    'Format issues resolved',
    'Content enhanced with metrics',
    'Professional template applied'
  ]}
  actions={[
    {
      label: 'Export PDF',
      icon: 'download',
      onClick: () => handleExport()
    },
    {
      label: 'View History',
      icon: 'history',
      onClick: () => showHistory()
    }
  ]}
  autoDismiss={8000}
  onDismiss={() => setShowSuccess(false)}
/>
```

**Props:**
- `title` (string): Main success title
- `message` (string, optional): Detailed message
- `summary` (string[], optional): List of completed actions
- `actions` (SuccessAction[], optional): Action buttons
- `autoDismiss` (number, optional): Auto-dismiss after X ms (0 = no auto-dismiss)
- `onDismiss` (function, optional): Callback when dismissed
- `animate` (boolean, optional): Show entrance animation

### ErrorNotification

Displays error messages with troubleshooting steps and recovery actions.

**Usage:**

```tsx
import { ErrorNotification } from '@/components/progress'

<ErrorNotification
  title="Optimization Failed"
  message="An unexpected error occurred during optimization."
  troubleshooting={[
    { 
      step: 'Check your internet connection',
      description: 'Ensure you have a stable connection'
    },
    { 
      step: 'Verify your resume data',
      description: 'Make sure the resume was uploaded correctly'
    },
    { step: 'Try a different template' },
    { step: 'Clear browser cache' }
  ]}
  severity="error"
  showRetry={true}
  onRetry={handleRetry}
  onDismiss={() => clearError()}
  helpLink="https://help.careerplus.com/optimization-errors"
/>
```

**Props:**
- `title` (string): Error title
- `message` (string): Error message
- `troubleshooting` (TroubleshootingStep[], optional): Troubleshooting steps
- `actions` (ErrorAction[], optional): Recovery actions
- `severity` ('error' | 'warning', optional): Error severity
- `showRetry` (boolean, optional): Show retry button
- `onRetry` (function, optional): Retry callback
- `onDismiss` (function, optional): Dismiss callback
- `helpLink` (string, optional): Help documentation link

### Compact Variants

Both `SuccessNotification` and `ErrorNotification` have compact variants for inline use:

```tsx
import { 
  CompactSuccessNotification, 
  CompactErrorNotification 
} from '@/components/progress'

<CompactSuccessNotification
  message="PDF downloaded successfully!"
  onDismiss={() => setShowSuccess(false)}
  autoDismiss={3000}
/>

<CompactErrorNotification
  message="Failed to export PDF"
  onDismiss={() => clearError()}
  onRetry={handleRetry}
/>
```

## Time Estimation Utilities

The `time-estimation.ts` utility provides time estimation for long-running operations.

### TimeEstimator Class

Tracks progress and estimates completion time:

```tsx
import { TimeEstimator } from '@/lib/utils/time-estimation'

const estimator = new TimeEstimator()

// Start tracking
estimator.start()

// Update progress and get estimation
const estimation = estimator.update(45) // 45% complete
console.log(estimation.estimatedSeconds) // e.g., 15
console.log(estimation.formattedTime) // e.g., "15s"
console.log(estimation.confidence) // e.g., 0.7

// Reset when done
estimator.reset()
```

### Predefined Time Estimates

```tsx
import { 
  OPERATION_TIME_ESTIMATES,
  getStepEstimate,
  calculateWorkflowEstimate,
  formatTimeRemaining
} from '@/lib/utils/time-estimation'

// Get estimate for a specific step
const applyingTime = getStepEstimate('applying') // 10 seconds

// Calculate total workflow time
const totalTime = calculateWorkflowEstimate([
  'collecting',
  'applying',
  'formatting',
  'saving'
]) // 20 seconds

// Format time for display
const formatted = formatTimeRemaining(75) // "about 1 minute"
```

## Integration Examples

### Auto Fix Button with Progress Tracking

```tsx
import { useState } from 'react'
import { useOptimizationStore } from '@/store/optimization-store'
import { 
  ProgressIndicator, 
  SuccessNotification, 
  ErrorNotification 
} from '@/components/progress'

function AutoFixButton({ analysisId }) {
  const {
    isOptimizing,
    optimizationProgress,
    runAutoFix
  } = useOptimizationStore()
  
  const [showSuccess, setShowSuccess] = useState(false)
  const [result, setResult] = useState(null)

  const handleAutoFix = async () => {
    const result = await runAutoFix(analysisId, templateId)
    if (result.success) {
      setResult(result)
      setShowSuccess(true)
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={handleAutoFix} disabled={isOptimizing}>
        Auto-Fix Resume
      </button>

      {isOptimizing && (
        <ProgressIndicator
          percentage={optimizationProgress.percentage}
          step={optimizationProgress.step}
          message={optimizationProgress.message}
          estimatedTimeRemaining={optimizationProgress.estimatedTimeRemaining}
          color="emerald"
        />
      )}

      {showSuccess && result && (
        <SuccessNotification
          title="Optimization Complete!"
          message={`Applied ${result.appliedFixes} fixes`}
          summary={[
            'Keywords optimized',
            'Format issues resolved',
            'Template applied'
          ]}
          autoDismiss={8000}
          onDismiss={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **ARIA Attributes**: Proper `role`, `aria-live`, `aria-atomic`, `aria-label` attributes
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Status updates announced via `aria-live` regions
- **Focus Management**: Proper focus handling in modals and notifications
- **Color Contrast**: WCAG AA compliant color combinations

## Best Practices

1. **Always show progress for operations > 2 seconds**
   - Use `ProgressIndicator` for long-running operations
   - Include estimated time when available

2. **Provide clear success feedback**
   - Use `SuccessNotification` with action summary
   - Include next steps or action buttons

3. **Handle errors gracefully**
   - Use `ErrorNotification` with troubleshooting steps
   - Provide retry functionality when appropriate
   - Include help links for complex errors

4. **Disable buttons during processing**
   - Prevent duplicate operations
   - Show loading state on buttons

5. **Auto-dismiss success messages**
   - Use 5-8 second auto-dismiss for success
   - Keep errors visible until user dismisses

6. **Use appropriate severity levels**
   - `error`: Critical failures requiring user action
   - `warning`: Non-critical issues or missing prerequisites

## Performance Considerations

- Components use CSS animations for smooth transitions
- Time estimation uses efficient algorithms with limited history
- Auto-dismiss timers are properly cleaned up
- Progress updates are throttled to prevent excessive re-renders

## Testing

All components include comprehensive tests:

```bash
npm test -- progress
```

Test coverage includes:
- Component rendering
- Progress updates
- Time estimation accuracy
- User interactions
- Accessibility compliance
- Error handling
