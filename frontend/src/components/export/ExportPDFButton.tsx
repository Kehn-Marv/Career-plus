/**
 * ExportPDFButton Component
 * Button for exporting optimized resume as PDF
 * Integrates with optimization store and PDF generator
 */

import { useState, useRef } from 'react'
import { Download, Loader, FileText } from 'lucide-react'
import { useOptimizationStore, optimizationSelectors } from '@/store/optimization-store'
import { 
  CompactSuccessNotification, 
  ErrorNotification 
} from '@/components/progress'
import { ariaAnnouncer } from '@/lib/accessibility'

export interface ExportPDFButtonProps {
  analysisId: number
  disabled?: boolean
  className?: string
  variant?: 'primary' | 'secondary'
  onExportComplete?: () => void
  onExportError?: (error: Error) => void
}

/**
 * ExportPDFButton Component
 * 
 * Features:
 * - Checks if optimized resume exists in database
 * - Shows prompt to run Auto Fix if no optimized resume found
 * - Displays loading state during PDF generation
 * - Triggers automatic download on completion
 * - Shows error messages with troubleshooting guidance
 */
export function ExportPDFButton({
  analysisId,
  disabled = false,
  className = '',
  variant = 'primary',
  onExportComplete,
  onExportError
}: ExportPDFButtonProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const {
    currentOptimizedResume,
    isGeneratingPDF,
    error: storeError,
    exportToPDF,
    loadLatestOptimizedResume
  } = useOptimizationStore()
  
  const hasOptimizedResume = optimizationSelectors.hasOptimizedResume(useOptimizationStore.getState())

  const handleExport = async () => {
    try {
      setErrorMessage(null)
      setShowPrompt(false)
      setShowSuccess(false)
      
      // Announce start
      ariaAnnouncer.announce('Starting PDF export', { priority: 'polite' })
      
      // Load latest optimized resume if not already loaded
      if (!currentOptimizedResume) {
        await loadLatestOptimizedResume(analysisId)
      }
      
      // Check if optimized resume exists
      const state = useOptimizationStore.getState()
      if (!state.currentOptimizedResume) {
        setShowPrompt(true)
        ariaAnnouncer.announceWarning('No optimized resume found. Please run Auto Fix first.')
        return
      }
      
      // Export to PDF
      await exportToPDF(state.currentOptimizedResume.id!)
      
      // Show success message
      setShowSuccess(true)
      ariaAnnouncer.announceSuccess('PDF exported successfully')
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Success callback
      onExportComplete?.()
      
    } catch (error: any) {
      console.error('PDF export failed:', error)
      const errorMsg = error.message || 'Failed to export PDF'
      setErrorMessage(errorMsg)
      ariaAnnouncer.announceError(`PDF export failed: ${errorMsg}`)
      onExportError?.(error)
    }
  }

  const baseClasses = 'px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3'
  
  const variantClasses = variant === 'primary'
    ? 'bg-white border-2 border-gray-200 text-gray-900 hover:border-emerald-300 hover:shadow-lg'
    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105'
  
  const disabledClasses = (disabled || isGeneratingPDF)
    ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none'
    : ''

  return (
    <div className="space-y-3">
      <button
        ref={buttonRef}
        onClick={handleExport}
        disabled={disabled || isGeneratingPDF}
        className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className} focus:outline-none focus:ring-4 focus:ring-blue-300`}
        aria-busy={isGeneratingPDF}
        aria-label={isGeneratingPDF ? "Generating PDF, please wait" : "Export resume as PDF"}
        aria-describedby={hasOptimizedResume ? "export-ready-message" : undefined}
      >
        {isGeneratingPDF ? (
          <>
            <Loader className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" aria-hidden="true" />
            <span>Export as PDF</span>
          </>
        )}
      </button>

      {/* Success Message */}
      {showSuccess && (
        <CompactSuccessNotification
          message="PDF downloaded successfully!"
          onDismiss={() => setShowSuccess(false)}
          autoDismiss={3000}
        />
      )}

      {/* Prompt to run Auto Fix */}
      {showPrompt && (
        <ErrorNotification
          title="No Optimized Resume Found"
          message="Please run Auto Fix Resume first to create an optimized version before exporting to PDF."
          severity="warning"
          actions={[
            {
              label: 'Dismiss',
              onClick: () => setShowPrompt(false),
              variant: 'secondary'
            }
          ]}
          onDismiss={() => setShowPrompt(false)}
        />
      )}

      {/* Error Message */}
      {(errorMessage || storeError) && !showPrompt && (
        <ErrorNotification
          title="Export Failed"
          message={errorMessage || storeError || 'An unexpected error occurred'}
          troubleshooting={[
            { step: 'Ensure you\'ve run Auto Fix Resume first' },
            { step: 'Check your browser\'s download settings' },
            { step: 'Try refreshing the page and exporting again' },
            { step: 'Clear your browser cache if the issue persists' }
          ]}
          severity="error"
          showRetry={true}
          onRetry={handleExport}
          onDismiss={() => {
            setErrorMessage(null)
            useOptimizationStore.getState().clearError()
          }}
        />
      )}

      {/* Success State - Show when optimized resume exists */}
      {hasOptimizedResume && !showPrompt && !errorMessage && !storeError && !isGeneratingPDF && (
        <div id="export-ready-message" className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3" role="status">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm text-emerald-800">
                <span className="font-semibold">Ready to export!</span> Your optimized resume will be downloaded as a professionally formatted, ATS-compatible PDF.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact ExportPDFButton
 * Minimal version for toolbars and inline use
 */
export function ExportPDFButtonCompact({
  analysisId,
  disabled = false,
  className = '',
  onExportComplete,
  onExportError
}: ExportPDFButtonProps) {
  const {
    currentOptimizedResume,
    isGeneratingPDF,
    exportToPDF,
    loadLatestOptimizedResume
  } = useOptimizationStore()

  const handleExport = async () => {
    try {
      // Load latest optimized resume if not already loaded
      if (!currentOptimizedResume) {
        await loadLatestOptimizedResume(analysisId)
      }
      
      // Check if optimized resume exists
      const state = useOptimizationStore.getState()
      if (!state.currentOptimizedResume) {
        alert('Please run Auto Fix Resume first to create an optimized version.')
        return
      }
      
      // Export to PDF
      await exportToPDF(state.currentOptimizedResume.id!)
      
      // Success callback
      onExportComplete?.()
      
    } catch (error: any) {
      console.error('PDF export failed:', error)
      alert(`Failed to export PDF: ${error.message}\n\nPlease try again or contact support.`)
      onExportError?.(error)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isGeneratingPDF}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
        isGeneratingPDF || disabled
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
      } ${className}`}
      title="Export to PDF"
      aria-busy={isGeneratingPDF}
      aria-label="Export resume as PDF"
    >
      {isGeneratingPDF ? (
        <>
          <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export PDF</span>
        </>
      )}
    </button>
  )
}
