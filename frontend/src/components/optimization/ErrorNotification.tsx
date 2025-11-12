/**
 * Error Notification Component
 * Displays optimization errors with recovery actions
 */

import { AlertCircle, AlertTriangle, XCircle, RefreshCw, Download, X } from 'lucide-react'
import type { OptimizationError, OptimizationErrorType } from '@/lib/optimization/error-handler'
import { getDetailedErrorMessage } from '@/lib/optimization/error-handler'

export interface ErrorNotificationProps {
  error: OptimizationError
  onRetry?: () => void
  onDismiss?: () => void
  onDownload?: () => void
  className?: string
}

/**
 * Get icon for error type
 */
function getErrorIcon(errorType: OptimizationErrorType) {
  switch (errorType) {
    case 'DATABASE_ERROR':
    case 'NETWORK_ERROR':
      return AlertTriangle
    case 'VALIDATION_ERROR':
    case 'PDF_GENERATION_ERROR':
      return XCircle
    default:
      return AlertCircle
  }
}

/**
 * Get color classes for error type
 */
function getErrorColorClasses(errorType: OptimizationErrorType) {
  switch (errorType) {
    case 'VALIDATION_ERROR':
      return {
        container: 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        title: 'text-red-900',
        message: 'text-red-800',
        button: 'bg-red-600 hover:bg-red-700 text-white'
      }
    case 'DATABASE_ERROR':
    case 'NETWORK_ERROR':
      return {
        container: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        title: 'text-amber-900',
        message: 'text-amber-800',
        button: 'bg-amber-600 hover:bg-amber-700 text-white'
      }
    default:
      return {
        container: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        title: 'text-orange-900',
        message: 'text-orange-800',
        button: 'bg-orange-600 hover:bg-orange-700 text-white'
      }
  }
}

/**
 * Error Notification Component
 */
export function ErrorNotification({
  error,
  onRetry,
  onDismiss,
  onDownload,
  className = ''
}: ErrorNotificationProps) {
  const Icon = getErrorIcon(error.type)
  const colors = getErrorColorClasses(error.type)
  const detailedMessage = getDetailedErrorMessage(error)

  // Determine which action button to show
  const showRetry = error.recoverable && onRetry && 
    (error.suggestedAction === 'retry' || 
     error.suggestedAction === 'retry_pdf' || 
     error.suggestedAction === 'retry_with_backoff')
  
  const showDownload = onDownload && error.suggestedAction === 'direct_download'

  return (
    <div
      className={`border-2 rounded-xl p-4 ${colors.container} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.iconColor}`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`text-sm font-semibold ${colors.title} mb-1`}>
            {getErrorTitle(error.type)}
          </h3>

          {/* Message */}
          <p className={`text-sm ${colors.message} mb-3`}>
            {detailedMessage}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {showRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colors.button}`}
                aria-label="Retry operation"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Retry
              </button>
            )}

            {showDownload && (
              <button
                onClick={onDownload}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colors.button}`}
                aria-label="Download directly"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Download
              </button>
            )}

            {error.recoverable && !showRetry && !showDownload && (
              <p className={`text-xs ${colors.message} italic`}>
                {getRecoveryMessage(error.suggestedAction)}
              </p>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${colors.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Get error title based on type
 */
function getErrorTitle(errorType: OptimizationErrorType): string {
  switch (errorType) {
    case 'DATABASE_ERROR':
      return 'Database Unavailable'
    case 'TEMPLATE_ERROR':
      return 'Template Error'
    case 'PDF_GENERATION_ERROR':
      return 'PDF Generation Failed'
    case 'LOCALIZATION_ERROR':
      return 'Localization Error'
    case 'NETWORK_ERROR':
      return 'Network Error'
    case 'VALIDATION_ERROR':
      return 'Validation Error'
    case 'FIX_APPLICATION_ERROR':
      return 'Fix Application Error'
    case 'CONTENT_OVERFLOW_ERROR':
      return 'Content Too Long'
    case 'UNKNOWN_ERROR':
      return 'Unexpected Error'
    default:
      return 'Error'
  }
}

/**
 * Get recovery message based on suggested action
 */
function getRecoveryMessage(suggestedAction?: string): string {
  switch (suggestedAction) {
    case 'fallback_plain_text':
      return 'Using plain text format...'
    case 'use_default_format':
      return 'Using default format...'
    case 'continue_partial':
      return 'Continuing with partial results...'
    case 'suggest_content_reduction':
      return 'Consider reducing content length'
    case 'check_content':
      return 'Please verify your resume content'
    default:
      return 'Attempting recovery...'
  }
}

/**
 * Compact Error Notification (for inline display)
 */
export interface CompactErrorNotificationProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function CompactErrorNotification({
  message,
  onRetry,
  onDismiss,
  className = ''
}: CompactErrorNotificationProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex-shrink-0"
            aria-label="Retry"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-700 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Error List Component (for displaying multiple errors)
 */
export interface ErrorListProps {
  errors: OptimizationError[]
  onRetry?: (error: OptimizationError) => void
  onDismiss?: (error: OptimizationError) => void
  onDismissAll?: () => void
  className?: string
}

export function ErrorList({
  errors,
  onRetry,
  onDismiss,
  onDismissAll,
  className = ''
}: ErrorListProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      {errors.length > 1 && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            {errors.length} Error{errors.length !== 1 ? 's' : ''} Occurred
          </h3>
          {onDismissAll && (
            <button
              onClick={onDismissAll}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              aria-label="Dismiss all errors"
            >
              Dismiss All
            </button>
          )}
        </div>
      )}

      {/* Error notifications */}
      {errors.map((error, index) => (
        <ErrorNotification
          key={`${error.type}-${error.timestamp.getTime()}-${index}`}
          error={error}
          onRetry={onRetry ? () => onRetry(error) : undefined}
          onDismiss={onDismiss ? () => onDismiss(error) : undefined}
        />
      ))}
    </div>
  )
}
