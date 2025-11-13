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
import { AutoFixError } from '@/lib/autofix/error-handler'

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

  // Map optimization progress to progress steps
  useEffect(() => {
    if (isOptimizing) {
      // Map the orchestrator step to our progress steps
      const stepMap: Record<string, number> = {
        'collecting': 0,
        'analyzing': 0,
        'optimizing': 1,
        'generating': 2,
        'saving': 3,
        'complete': 3
      }

      const stepIndex = stepMap[optimizationProgress.step] ?? 0
      setCurrentStep(stepIndex)

      // Update progress steps based on orchestrator progress
      setProgressSteps([
        {
          id: 'retrieve-data',
          title: 'Retrieving analysis data',
          status: stepIndex > 0 ? 'completed' : stepIndex === 0 ? 'in-progress' : 'pending',
          message: stepIndex === 0 ? optimizationProgress.message : undefined
        },
        {
          id: 'optimize-content',
          title: 'Optimizing resume content',
          status: stepIndex > 1 ? 'completed' : stepIndex === 1 ? 'in-progress' : 'pending',
          message: stepIndex === 1 ? optimizationProgress.message : undefined
        },
        {
          id: 'generate-pdf',
          title: 'Generating PDF',
          status: stepIndex > 2 ? 'completed' : stepIndex === 2 ? 'in-progress' : 'pending',
          message: stepIndex === 2 ? optimizationProgress.message : undefined
        },
        {
          id: 'save-results',
          title: 'Saving results',
          status: stepIndex >= 3 ? 'completed' : 'pending',
          message: stepIndex === 3 ? optimizationProgress.message : undefined
        }
      ])
    }
  }, [isOptimizing, optimizationProgress])

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
    
    // Initialize progress steps
    setProgressSteps([
      { id: 'retrieve-data', title: 'Retrieving analysis data', status: 'pending' },
      { id: 'optimize-content', title: 'Optimizing resume content', status: 'pending' },
      { id: 'generate-pdf', title: 'Generating PDF', status: 'pending' },
      { id: 'save-results', title: 'Saving results', status: 'pending' }
    ])
    setCurrentStep(0)
    
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

        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 10000)

        // Notify parent
        if (onComplete) {
          onComplete({
            optimizedResumeId: result.optimizedResumeId,
            appliedFixes: result.appliedFixes
          })
        }
      } else {
        // Create error from result
        const errorMessage = result.errors?.join(', ') || 'Optimization failed'
        const autoFixError = new AutoFixError(
          'UNKNOWN_ERROR' as any,
          errorMessage,
          false,
          true
        )
        setLastError(autoFixError)
        setShowError(true)
        ariaAnnouncer.announceError('Resume optimization failed')
      }
    } catch (err: any) {
      console.error('Auto fix failed:', err)
      setLastError(err)
      setShowError(true)
      ariaAnnouncer.announceError(`Resume optimization failed: ${err.message}`)
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

  const isDisabled = disabled || isOptimizing || !selectedTemplate

  return (
    <div className="space-y-4">
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
      {isOptimizing && progressSteps.length > 0 && (
        <div id="autofix-progress" role="region" aria-label="Optimization progress">
          <ProgressTracker
            steps={progressSteps}
            currentStep={currentStep}
            percentage={optimizationProgress.percentage}
            estimatedTimeRemaining={optimizationProgress.estimatedTimeRemaining}
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
      {(showError || (error && !isOptimizing)) && lastError && (
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
      {!isOptimizing && !showSuccess && !error && (
        <p id="autofix-description" className="text-xs text-gray-500 text-center">
          Applies all recommendations, fixes ATS issues, and generates a professional PDF
        </p>
      )}
    </div>
  )
}
