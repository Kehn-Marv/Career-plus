# Progress Tracking Usage Examples

This document provides practical examples of using the progress tracking components in different scenarios.

## Example 1: Basic Progress Indicator

Simple progress bar for a single operation:

```tsx
import { useState } from 'react'
import { ProgressIndicator } from '@/components/progress'

function SimpleOperation() {
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const runOperation = async () => {
    setIsRunning(true)
    
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsRunning(false)
  }

  return (
    <div>
      <button onClick={runOperation} disabled={isRunning}>
        Start Operation
      </button>
      
      {isRunning && (
        <ProgressIndicator
          percentage={progress}
          step="processing"
          message="Processing your request..."
          compact={false}
        />
      )}
    </div>
  )
}
```

## Example 2: Multi-Step Progress with Time Estimation

Progress tracking through multiple steps with time estimation:

```tsx
import { useState, useEffect } from 'react'
import { ProgressIndicator, ProgressSteps } from '@/components/progress'
import { TimeEstimator } from '@/lib/utils/time-estimation'

function MultiStepOperation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState<number>()
  const [isRunning, setIsRunning] = useState(false)
  
  const steps = [
    { id: '1', label: 'Initializing', duration: 2000 },
    { id: '2', label: 'Processing data', duration: 5000 },
    { id: '3', label: 'Generating output', duration: 3000 },
    { id: '4', label: 'Finalizing', duration: 1000 }
  ]

  const runOperation = async () => {
    setIsRunning(true)
    const estimator = new TimeEstimator()
    estimator.start()

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      
      // Simulate step progress
      const stepDuration = steps[i].duration
      const stepIncrement = 100 / steps.length
      
      for (let p = 0; p <= 100; p += 10) {
        const overallProgress = (i * stepIncrement) + (p * stepIncrement / 100)
        setProgress(overallProgress)
        
        const estimation = estimator.update(overallProgress)
        setEstimatedTime(estimation.estimatedSeconds)
        
        await new Promise(resolve => setTimeout(resolve, stepDuration / 10))
      }
    }
    
    setIsRunning(false)
    estimator.reset()
  }

  const progressSteps = steps.map((step, index) => ({
    ...step,
    status: index < currentStep ? 'complete' as const :
            index === currentStep ? 'active' as const :
            'pending' as const
  }))

  return (
    <div className="space-y-4">
      <button onClick={runOperation} disabled={isRunning}>
        Start Multi-Step Operation
      </button>
      
      {isRunning && (
        <div className="space-y-4">
          <ProgressIndicator
            percentage={progress}
            step={steps[currentStep].label}
            message={`Step ${currentStep + 1} of ${steps.length}`}
            estimatedTimeRemaining={estimatedTime}
            color="blue"
          />
          
          <ProgressSteps steps={progressSteps} />
        </div>
      )}
    </div>
  )
}
```

## Example 3: Complete Operation with Success/Error Handling

Full example with progress, success, and error states:

```tsx
import { useState } from 'react'
import { 
  ProgressIndicator, 
  SuccessNotification, 
  ErrorNotification 
} from '@/components/progress'

function CompleteOperation() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [step, setStep] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const runOperation = async () => {
    setIsRunning(true)
    setShowSuccess(false)
    setShowError(false)
    setProgress(0)

    try {
      // Step 1: Validate
      setStep('validating')
      setProgress(20)
      await simulateWork(1000)

      // Step 2: Process
      setStep('processing')
      setProgress(50)
      await simulateWork(2000)

      // Step 3: Save
      setStep('saving')
      setProgress(80)
      await simulateWork(1000)

      // Complete
      setProgress(100)
      setResult({ itemsProcessed: 42, timeElapsed: '4.2s' })
      setShowSuccess(true)
      
    } catch (err: any) {
      setError(err.message || 'Operation failed')
      setShowError(true)
    } finally {
      setIsRunning(false)
    }
  }

  const simulateWork = (ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms))

  return (
    <div className="space-y-4">
      <button 
        onClick={runOperation} 
        disabled={isRunning}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isRunning ? 'Processing...' : 'Start Operation'}
      </button>

      {/* Progress */}
      {isRunning && (
        <ProgressIndicator
          percentage={progress}
          step={step}
          message={`${step.charAt(0).toUpperCase() + step.slice(1)}...`}
          color="blue"
          showSpinner={true}
        />
      )}

      {/* Success */}
      {showSuccess && result && (
        <SuccessNotification
          title="Operation Complete!"
          message="Your operation completed successfully."
          summary={[
            `Processed ${result.itemsProcessed} items`,
            `Completed in ${result.timeElapsed}`,
            'All data saved successfully'
          ]}
          actions={[
            {
              label: 'View Results',
              icon: 'view',
              onClick: () => console.log('View results')
            }
          ]}
          autoDismiss={5000}
          onDismiss={() => setShowSuccess(false)}
        />
      )}

      {/* Error */}
      {showError && (
        <ErrorNotification
          title="Operation Failed"
          message={error}
          troubleshooting={[
            { step: 'Check your input data' },
            { step: 'Verify your permissions' },
            { step: 'Try again in a few moments' }
          ]}
          severity="error"
          showRetry={true}
          onRetry={runOperation}
          onDismiss={() => setShowError(false)}
        />
      )}
    </div>
  )
}
```

## Example 4: Integration with Zustand Store

Using progress tracking with a Zustand store (like OptimizationStore):

```tsx
import { create } from 'zustand'
import { TimeEstimator } from '@/lib/utils/time-estimation'

interface OperationState {
  isRunning: boolean
  progress: {
    step: string
    percentage: number
    message: string
    estimatedTimeRemaining?: number
  }
  error: string | null
  runOperation: () => Promise<void>
}

const useOperationStore = create<OperationState>((set) => {
  const timeEstimator = new TimeEstimator()

  return {
    isRunning: false,
    progress: {
      step: 'idle',
      percentage: 0,
      message: '',
      estimatedTimeRemaining: undefined
    },
    error: null,

    runOperation: async () => {
      set({ isRunning: true, error: null })
      timeEstimator.start()

      try {
        // Step 1
        const estimation1 = timeEstimator.update(25)
        set({
          progress: {
            step: 'step1',
            percentage: 25,
            message: 'Processing step 1...',
            estimatedTimeRemaining: estimation1.estimatedSeconds
          }
        })
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Step 2
        const estimation2 = timeEstimator.update(50)
        set({
          progress: {
            step: 'step2',
            percentage: 50,
            message: 'Processing step 2...',
            estimatedTimeRemaining: estimation2.estimatedSeconds
          }
        })
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Step 3
        const estimation3 = timeEstimator.update(75)
        set({
          progress: {
            step: 'step3',
            percentage: 75,
            message: 'Processing step 3...',
            estimatedTimeRemaining: estimation3.estimatedSeconds
          }
        })
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Complete
        set({
          progress: {
            step: 'complete',
            percentage: 100,
            message: 'Complete!',
            estimatedTimeRemaining: 0
          }
        })

      } catch (error: any) {
        set({ error: error.message })
      } finally {
        set({ isRunning: false })
        timeEstimator.reset()
      }
    }
  }
})

// Component using the store
function OperationComponent() {
  const { isRunning, progress, error, runOperation } = useOperationStore()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (progress.step === 'complete') {
      setShowSuccess(true)
    }
  }, [progress.step])

  return (
    <div className="space-y-4">
      <button onClick={runOperation} disabled={isRunning}>
        Run Operation
      </button>

      {isRunning && (
        <ProgressIndicator
          percentage={progress.percentage}
          step={progress.step}
          message={progress.message}
          estimatedTimeRemaining={progress.estimatedTimeRemaining}
        />
      )}

      {showSuccess && (
        <SuccessNotification
          title="Success!"
          message="Operation completed successfully"
          autoDismiss={5000}
          onDismiss={() => setShowSuccess(false)}
        />
      )}

      {error && (
        <ErrorNotification
          title="Error"
          message={error}
          showRetry={true}
          onRetry={runOperation}
        />
      )}
    </div>
  )
}
```

## Example 5: Compact Notifications for Inline Use

Using compact variants for minimal UI impact:

```tsx
import { useState } from 'react'
import { 
  CompactSuccessNotification, 
  CompactErrorNotification 
} from '@/components/progress'

function InlineOperation() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    setShowSuccess(false)
    setShowError(false)

    try {
      await saveData()
      setShowSuccess(true)
    } catch (error) {
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>

      {showSuccess && (
        <CompactSuccessNotification
          message="Saved successfully!"
          onDismiss={() => setShowSuccess(false)}
          autoDismiss={3000}
        />
      )}

      {showError && (
        <CompactErrorNotification
          message="Failed to save"
          onDismiss={() => setShowError(false)}
          onRetry={handleSave}
        />
      )}
    </div>
  )
}
```

## Example 6: Custom Progress Colors and Styling

Using different color schemes for different operation types:

```tsx
import { ProgressIndicator } from '@/components/progress'

function ColoredProgress() {
  return (
    <div className="space-y-4">
      {/* Success operation */}
      <ProgressIndicator
        percentage={75}
        step="uploading"
        message="Uploading files..."
        color="emerald"
      />

      {/* Info operation */}
      <ProgressIndicator
        percentage={50}
        step="analyzing"
        message="Analyzing data..."
        color="blue"
      />

      {/* Warning operation */}
      <ProgressIndicator
        percentage={30}
        step="validating"
        message="Validating input..."
        color="orange"
      />

      {/* Creative operation */}
      <ProgressIndicator
        percentage={90}
        step="generating"
        message="Generating content..."
        color="purple"
      />
    </div>
  )
}
```

## Best Practices

1. **Always provide feedback for operations > 2 seconds**
2. **Use time estimation for operations > 5 seconds**
3. **Show success messages for 5-8 seconds**
4. **Keep error messages visible until dismissed**
5. **Disable buttons during processing**
6. **Provide retry functionality for recoverable errors**
7. **Include troubleshooting steps for common errors**
8. **Use appropriate color schemes for different contexts**
9. **Test with screen readers for accessibility**
10. **Clean up timers and estimators on unmount**
