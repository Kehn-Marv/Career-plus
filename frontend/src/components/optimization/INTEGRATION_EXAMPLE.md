# Error Notification Integration Example

This document shows how to integrate the new ErrorNotification component into existing components.

## Example: Enhanced AutoFixButton with ErrorNotification

```tsx
import { useState, useEffect } from 'react'
import { Zap, CheckCircle, Loader2 } from 'lucide-react'
import { useOptimizationStore, optimizationSelectors } from '@/store/optimization-store'
import { ErrorNotification } from '@/components/optimization'
import { templateEngine } from '@/lib/templates/template-engine'

export function AutoFixButton({ analysisId, disabled = false, onComplete }) {
  const {
    isOptimizing,
    optimizationProgress,
    selectedTemplate,
    runAutoFix,
    selectTemplate,
    clearError
  } = useOptimizationStore()

  // Use the new optimization error selector
  const optimizationError = useOptimizationStore(
    optimizationSelectors.getOptimizationError
  )

  const [showSuccess, setShowSuccess] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  // Select default template if none selected
  useEffect(() => {
    if (!selectedTemplate) {
      const templates = templateEngine.getAllTemplates()
      if (templates.length > 0) {
        selectTemplate(templates[0].id)
      }
    }
  }, [selectedTemplate, selectTemplate])

  const handleAutoFix = async () => {
    if (!selectedTemplate) {
      return
    }

    clearError()
    setShowSuccess(false)

    try {
      const result = await runAutoFix(analysisId, selectedTemplate.id)

      if (result.success) {
        setLastResult({ appliedFixes: result.appliedFixes })
        setShowSuccess(true)
        onComplete?.(result)

        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000)
      }
    } catch (error) {
      // Error is already handled by the store
      console.error('Auto fix failed:', error)
    }
  }

  const handleRetry = () => {
    clearError()
    handleAutoFix()
  }

  return (
    <div className="space-y-4">
      {/* Auto Fix Button */}
      <button
        onClick={handleAutoFix}
        disabled={disabled || isOptimizing || !selectedTemplate}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isOptimizing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Optimizing...</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            <span>Auto-Fix Resume</span>
          </>
        )}
      </button>

      {/* Progress Bar */}
      {isOptimizing && (
        <div className="space-y-2" role="status" aria-live="polite">
          <div className="flex justify-between text-sm text-gray-600">
            <span className="capitalize">
              {optimizationProgress.step.replace('-', ' ')}
            </span>
            <span>{optimizationProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${optimizationProgress.percentage}%` }}
              role="progressbar"
              aria-valuenow={optimizationProgress.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {optimizationProgress.message}
          </p>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && lastResult && (
        <div
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-green-900 mb-1">
                Optimization Complete!
              </h4>
              <p className="text-sm text-green-800">
                Successfully applied {lastResult.appliedFixes} fix
                {lastResult.appliedFixes !== 1 ? 'es' : ''} to your resume.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Error Notification */}
      {optimizationError && !isOptimizing && (
        <ErrorNotification
          error={optimizationError}
          onRetry={handleRetry}
          onDismiss={clearError}
        />
      )}
    </div>
  )
}
```

## Example: ExportPDFButton with Error Handling

```tsx
import { useState } from 'react'
import { Download, Loader } from 'lucide-react'
import { useOptimizationStore, optimizationSelectors } from '@/store/optimization-store'
import { ErrorNotification } from '@/components/optimization'

export function ExportPDFButton({ analysisId, onExportComplete, onExportError }) {
  const {
    currentOptimizedResume,
    isGeneratingPDF,
    exportToPDF,
    clearError
  } = useOptimizationStore()

  const optimizationError = useOptimizationStore(
    optimizationSelectors.getOptimizationError
  )

  const handleExport = async () => {
    if (!currentOptimizedResume) {
      return
    }

    clearError()

    try {
      await exportToPDF(currentOptimizedResume.id!)
      onExportComplete?.()
    } catch (error) {
      onExportError?.(error)
    }
  }

  const handleRetry = () => {
    clearError()
    handleExport()
  }

  const handleDirectDownload = async () => {
    // Implement direct download fallback
    console.log('Direct download fallback')
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleExport}
        disabled={!currentOptimizedResume || isGeneratingPDF}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGeneratingPDF ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Export as PDF</span>
          </>
        )}
      </button>

      {/* Error Notification with Download Fallback */}
      {optimizationError && !isGeneratingPDF && (
        <ErrorNotification
          error={optimizationError}
          onRetry={handleRetry}
          onDownload={
            optimizationError.suggestedAction === 'direct_download'
              ? handleDirectDownload
              : undefined
          }
          onDismiss={clearError}
        />
      )}
    </div>
  )
}
```

## Key Integration Points

1. **Use the optimization error selector:**
   ```tsx
   const optimizationError = useOptimizationStore(
     optimizationSelectors.getOptimizationError
   )
   ```

2. **Display ErrorNotification when error exists:**
   ```tsx
   {optimizationError && (
     <ErrorNotification
       error={optimizationError}
       onRetry={handleRetry}
       onDismiss={clearError}
     />
   )}
   ```

3. **Clear errors before operations:**
   ```tsx
   const handleOperation = async () => {
     clearError()
     // ... perform operation
   }
   ```

4. **Provide recovery actions:**
   - `onRetry` - Retry the failed operation
   - `onDownload` - Direct download fallback
   - `onDismiss` - Clear the error

## Benefits

- **Consistent Error Display** - All errors shown in the same format
- **Recovery Actions** - Users can retry or use fallbacks
- **Accessibility** - ARIA labels and roles for screen readers
- **User-Friendly** - Clear messages with suggested actions
- **Preserves Content** - Original data never lost on errors
