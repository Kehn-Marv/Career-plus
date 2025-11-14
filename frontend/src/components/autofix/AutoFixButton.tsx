/**
 * AutoFixButton Component
 * Unified button for applying all recommendations and ATS fixes
 * Integrates with the new AutoFixOrchestrator for comprehensive optimization
 */

import { useState, useEffect, useRef } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { useOptimizationStore } from '@/store/optimization-store'
import { templateEngine } from '@/lib/templates/template-engine'
import { SuccessNotification } from '@/components/progress'
import { ProgressTracker } from './ProgressTracker'
import { AutoFixErrorNotification } from './AutoFixErrorNotification'
import { ariaAnnouncer } from '@/lib/accessibility'
import type { ProgressStep } from '@/lib/autofix/auto-fix-orchestrator'
import { AutoFixError, AutoFixErrorType } from '@/lib/autofix/error-handler'

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
    selectedTemplate,
    error,
    runAutoFixWorkflow,
    selectTemplate,
    clearError,
    autoFixProgress
  } = useOptimizationStore()

  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [lastError, setLastError] = useState<Error | AutoFixError | null>(null)
  const [lastResult, setLastResult] = useState<{ appliedFixes: number; optimizedResumeId: number } | null>(null)
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
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

  // Use autoFixProgress from store instead of mapping
  useEffect(() => {
    if (autoFixProgress.isRunning && autoFixProgress.steps.length > 0) {
      setProgressSteps(autoFixProgress.steps)
      setCurrentStep(autoFixProgress.currentStep)
    }
  }, [autoFixProgress])

  const handleAutoFix = async () => {
    if (!selectedTemplate) {
      alert('Please select a template first')
      ariaAnnouncer.announceError('Please select a template first')
      return
    }

    clearError()
    setShowSuccess(false)
    setShowError(false)
    setLastError(null)
    
    // Announce start
    ariaAnnouncer.announce('Starting resume optimization', { priority: 'polite' })

    try {
      console.log('Starting AutoFix workflow...', {
        analysisId,
        templateId: selectedTemplate.id
      })
      
      // Use the new AutoFixWorkflow which uses AutoFixOrchestrator
      const result = await runAutoFixWorkflow(analysisId, {
        templateId: selectedTemplate.id,
        includeGrammarFixes: true,
        includeKeywordOptimization: true,
        aggressiveness: 'moderate',
        preserveTone: true
      })

      console.log('AutoFix workflow result:', result)

      if (result.success) {
        const appliedFixesCount = result.appliedFixes.length
        setLastResult({ 
          appliedFixes: appliedFixesCount,
          optimizedResumeId: result.optimizedResumeId!
        })
        setShowSuccess(true)

        // Announce success
        ariaAnnouncer.announceSuccess(
          `Resume optimization complete. Applied ${appliedFixesCount} fix${appliedFixesCount !== 1 ? 'es' : ''}.`
        )

        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 10000)

        // Notify parent
        if (onComplete) {
          onComplete({
            optimizedResumeId: result.optimizedResumeId!,
            appliedFixes: appliedFixesCount
          })
        }
      } else {
        // Create error from result
        const errorMessage = result.error || 'Optimization failed'
        console.error('AutoFix workflow failed:', errorMessage)
        const autoFixError = new AutoFixError(
          AutoFixErrorType.AI_SERVICE_ERROR,
          errorMessage,
          false,
          true
        )
        setLastError(autoFixError)
        setShowError(true)
        ariaAnnouncer.announceError('Resume optimization failed')
      }
    } catch (err: any) {
      console.error('Auto fix failed - Full error:', err)
      console.error('Error stack:', err.stack)
      console.error('Error type:', err.constructor.name)
      
      // Create a more detailed error message
      let errorMessage = 'Auto-fix failed. Please try again.'
      if (err.message) {
        errorMessage = err.message
      }
      
      // Check if it's a network error
      if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running at http://localhost:8000'
      }
      
      const autoFixError = new AutoFixError(
        AutoFixErrorType.NETWORK_ERROR,
        errorMessage,
        false,
        true
      )
      
      setLastError(autoFixError)
      setShowError(true)
      ariaAnnouncer.announceError(`Resume optimization failed: ${errorMessage}`)
    }
  }

  const handleDownload = async () => {
    if (!lastResult) return
    
    try {
      // Retrieve PDF blob from IndexedDB
      const { getPDFBlobByOptimizedResumeId } = await import('@/lib/db/optimized-resume-operations')
      const pdfBlob = await getPDFBlobByOptimizedResumeId(lastResult.optimizedResumeId)
      
      if (!pdfBlob) {
        throw new Error('PDF not found. Please run Auto-Fix again.')
      }
      
      // Trigger browser download with descriptive filename
      const url = URL.createObjectURL(pdfBlob.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = pdfBlob.filename
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      ariaAnnouncer.announceSuccess('PDF downloaded successfully')
    } catch (err: any) {
      console.error('Download failed:', err)
      ariaAnnouncer.announceError(`Failed to download PDF: ${err.message}`)
      
      // Show error to user
      alert(`Download failed: ${err.message}`)
    }
  }

  const handleRetry = () => {
    clearError()
    setShowError(false)
    setLastError(null)
    handleAutoFix()
  }

  const isDisabled = disabled || autoFixProgress.isRunning || !selectedTemplate

  return (
    <div className="space-y-4">
      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={handleAutoFix}
        disabled={isDisabled}
        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        aria-label={autoFixProgress.isRunning ? `Auto-fixing resume: ${progressSteps[currentStep]?.message || 'Processing...'}` : "Auto-fix resume with all recommendations"}
        aria-busy={autoFixProgress.isRunning}
        aria-describedby={autoFixProgress.isRunning ? "autofix-progress" : "autofix-description"}
      >
        {autoFixProgress.isRunning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Optimizing...</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" aria-hidden="true" />
            <span>Auto-Fix Resume</span>
          </>
        )}
      </button>

      {/* Progress Tracker */}
      {autoFixProgress.isRunning && progressSteps.length > 0 && (
        <div id="autofix-progress" role="region" aria-label="Optimization progress">
          <ProgressTracker
            steps={progressSteps}
            currentStep={currentStep}
            percentage={autoFixProgress.percentage}
            estimatedTimeRemaining={autoFixProgress.estimatedTimeRemaining}
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
            'Grammar and phrasing improved',
            'Content enhanced with metrics',
            'Professional PDF generated'
          ]}
          actions={[
            {
              label: 'Download PDF',
              icon: 'download',
              onClick: handleDownload
            }
          ]}
          autoDismiss={10000}
          onDismiss={() => setShowSuccess(false)}
          animate={true}
        />
      )}

      {/* Error Notification */}
      {(showError || (error && !autoFixProgress.isRunning)) && lastError && (
        <AutoFixErrorNotification
          error={lastError}
          onRetry={handleRetry}
          onDismiss={() => {
            setShowError(false)
            setLastError(null)
            clearError()
          }}
          helpLink="/docs/troubleshooting"
        />
      )}

      {/* Info Text */}
      {!autoFixProgress.isRunning && !showSuccess && !error && (
        <p id="autofix-description" className="text-xs text-gray-500 text-center">
          Applies all recommendations, fixes ATS issues, and generates a professional PDF
        </p>
      )}
    </div>
  )
}
