/**
 * AutoFixButton Component
 * Unified button for applying all recommendations and ATS fixes
 * Integrates with the optimization orchestrator
 */

import { useState, useEffect, useRef } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { useOptimizationStore } from '@/store/optimization-store'
import { templateEngine } from '@/lib/templates/template-engine'
import { 
  ProgressIndicator, 
  SuccessNotification, 
  ErrorNotification 
} from '@/components/progress'
import { ariaAnnouncer } from '@/lib/accessibility'

export interface AutoFixButtonProps {
  analysisId: number
  disabled?: boolean
  onComplete?: (result: { optimizedResumeId: number; appliedFixes: number }) => void
}

export function AutoFixButton({
  analysisId,
  disabled = false,
  onComplete
}: AutoFixButtonProps) {
  const {
    isOptimizing,
    optimizationProgress,
    selectedTemplate,
    error,
    runAutoFix,
    selectTemplate,
    clearError
  } = useOptimizationStore()

  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [lastResult, setLastResult] = useState<{ appliedFixes: number; optimizedResumeId: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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
      alert('Please select a template first')
      ariaAnnouncer.announceError('Please select a template first')
      return
    }

    clearError()
    setShowSuccess(false)
    setShowError(false)
    
    // Announce start
    ariaAnnouncer.announce('Starting resume optimization', { priority: 'polite' })

    try {
      const result = await runAutoFix(analysisId, selectedTemplate.id)

      if (result.success) {
        setLastResult({ 
          appliedFixes: result.appliedFixes,
          optimizedResumeId: result.optimizedResumeId
        })
        setShowSuccess(true)

        // Announce success
        ariaAnnouncer.announceSuccess(
          `Resume optimization complete. Applied ${result.appliedFixes} fix${result.appliedFixes !== 1 ? 'es' : ''}.`
        )

        // Auto-hide success message after 8 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 8000)

        // Notify parent
        if (onComplete) {
          onComplete({
            optimizedResumeId: result.optimizedResumeId,
            appliedFixes: result.appliedFixes
          })
        }
      } else {
        setShowError(true)
        ariaAnnouncer.announceError('Resume optimization failed')
      }
    } catch (err: any) {
      console.error('Auto fix failed:', err)
      setShowError(true)
      ariaAnnouncer.announceError(`Resume optimization failed: ${err.message}`)
    }
  }

  // Announce progress updates
  useEffect(() => {
    if (isOptimizing && optimizationProgress.message) {
      ariaAnnouncer.announceProgress(
        optimizationProgress.step,
        optimizationProgress.percentage,
        optimizationProgress.message
      )
    }
  }, [isOptimizing, optimizationProgress.step, optimizationProgress.percentage, optimizationProgress.message])

  const isDisabled = disabled || isOptimizing || !selectedTemplate

  return (
    <div className="space-y-3">
      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={handleAutoFix}
        disabled={isDisabled}
        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        aria-label={isOptimizing ? `Auto-fixing resume: ${optimizationProgress.message}` : "Auto-fix resume with all recommendations"}
        aria-busy={isOptimizing}
        aria-describedby={isOptimizing ? "autofix-progress" : "autofix-description"}
      >
        {isOptimizing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{optimizationProgress.message || 'Processing...'}</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            <span>Auto-Fix Resume</span>
          </>
        )}
      </button>

      {/* Progress Indicator */}
      {isOptimizing && (
        <div id="autofix-progress" role="region" aria-label="Optimization progress">
          <ProgressIndicator
            percentage={optimizationProgress.percentage}
            step={optimizationProgress.step}
            message={optimizationProgress.message}
            estimatedTimeRemaining={optimizationProgress.estimatedTimeRemaining}
            color="emerald"
            showSpinner={true}
          />
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && lastResult && (
        <SuccessNotification
          title="Optimization Complete!"
          message={`Successfully applied ${lastResult.appliedFixes} fix${lastResult.appliedFixes !== 1 ? 'es' : ''} to your resume.`}
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
              onClick: () => {
                // Trigger PDF export
                if (onComplete) {
                  onComplete(lastResult)
                }
              }
            }
          ]}
          autoDismiss={8000}
          onDismiss={() => setShowSuccess(false)}
          animate={true}
        />
      )}

      {/* Error Notification */}
      {(showError || (error && !isOptimizing)) && (
        <ErrorNotification
          title="Optimization Failed"
          message={error || 'An unexpected error occurred during optimization.'}
          troubleshooting={[
            { step: 'Check your internet connection', description: 'Ensure you have a stable connection' },
            { step: 'Verify your resume data', description: 'Make sure the resume was uploaded correctly' },
            { step: 'Try a different template', description: 'Some templates may work better with your content' },
            { step: 'Clear browser cache', description: 'Refresh the page and try again' }
          ]}
          severity="error"
          showRetry={true}
          onRetry={handleAutoFix}
          onDismiss={() => {
            setShowError(false)
            clearError()
          }}
        />
      )}

      {/* Info Text */}
      {!isOptimizing && !showSuccess && !error && (
        <p id="autofix-description" className="text-xs text-gray-500 text-center">
          Applies all recommendations, fixes ATS issues, and formats with professional template
        </p>
      )}
    </div>
  )
}
