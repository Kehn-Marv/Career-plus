/**
 * AutoFixErrorNotification Component
 * Specialized error notification for auto-fix failures with enhanced troubleshooting
 */

import { AlertCircle, X, RefreshCw, HelpCircle, Terminal, Bug } from 'lucide-react'
import { useState } from 'react'
import { 
  AutoFixError, 
  AutoFixErrorType, 
  ErrorSeverity,
  type TroubleshootingStep 
} from '@/lib/autofix/error-handler'

export interface AutoFixErrorNotificationProps {
  /** The AutoFixError instance */
  error: AutoFixError | Error
  
  /** Retry callback */
  onRetry?: () => void | Promise<void>
  
  /** Dismiss callback */
  onDismiss?: () => void
  
  /** Show detailed error information */
  showDetails?: boolean
  
  /** Help documentation link */
  helpLink?: string
}

/**
 * AutoFixErrorNotification Component
 * 
 * Features:
 * - Displays AutoFixError with full context
 * - Shows troubleshooting steps based on error type
 * - Provides retry functionality for retryable errors
 * - Logs detailed errors to console
 * - Accessible with ARIA attributes
 * - Animated entrance
 */
export function AutoFixErrorNotification({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  helpLink
}: AutoFixErrorNotificationProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [showDetailedInfo, setShowDetailedInfo] = useState(showDetails)

  // Convert generic Error to AutoFixError if needed
  const autoFixError = error instanceof AutoFixError 
    ? error 
    : new AutoFixError(
        AutoFixErrorType.UNKNOWN_ERROR,
        error.message,
        false,
        false,
        []
      )

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } catch (err) {
      console.error('Retry failed:', err)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleViewDetails = () => {
    setShowDetailedInfo(!showDetailedInfo)
    
    // Log detailed error to console
    if (!showDetailedInfo) {
      console.group('🔍 AutoFix Error Details')
      console.error('Type:', autoFixError.type)
      console.error('Message:', autoFixError.message)
      console.error('Severity:', autoFixError.severity)
      console.error('Recoverable:', autoFixError.recoverable)
      console.error('Retryable:', autoFixError.retryable)
      console.error('Timestamp:', new Date(autoFixError.timestamp).toISOString())
      
      if (autoFixError.originalError) {
        console.error('Original Error:', autoFixError.originalError)
      }
      
      if (autoFixError.stack) {
        console.error('Stack Trace:', autoFixError.stack)
      }
      
      console.groupEnd()
    }
  }

  // Determine color scheme based on severity
  const getColorClasses = () => {
    switch (autoFixError.severity) {
      case ErrorSeverity.CRITICAL:
        return {
          bg: 'from-red-50 to-rose-50',
          border: 'border-red-300',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-700',
          titleColor: 'text-red-900',
          textColor: 'text-red-800',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          buttonText: 'text-red-600 hover:text-red-800',
          detailsBg: 'bg-red-50'
        }
      case ErrorSeverity.HIGH:
        return {
          bg: 'from-red-50 to-pink-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          textColor: 'text-red-800',
          buttonBg: 'bg-red-600 hover:bg-red-700',
          buttonText: 'text-red-600 hover:text-red-800',
          detailsBg: 'bg-red-50'
        }
      case ErrorSeverity.MEDIUM:
        return {
          bg: 'from-amber-50 to-orange-50',
          border: 'border-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-900',
          textColor: 'text-amber-800',
          buttonBg: 'bg-amber-600 hover:bg-amber-700',
          buttonText: 'text-amber-600 hover:text-amber-800',
          detailsBg: 'bg-amber-50'
        }
      case ErrorSeverity.LOW:
        return {
          bg: 'from-yellow-50 to-amber-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          textColor: 'text-yellow-800',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
          buttonText: 'text-yellow-600 hover:text-yellow-800',
          detailsBg: 'bg-yellow-50'
        }
      default:
        return {
          bg: 'from-gray-50 to-slate-50',
          border: 'border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-900',
          textColor: 'text-gray-800',
          buttonBg: 'bg-gray-600 hover:bg-gray-700',
          buttonText: 'text-gray-600 hover:text-gray-800',
          detailsBg: 'bg-gray-50'
        }
    }
  }

  const colorClasses = getColorClasses()

  // Get user-friendly title based on error type
  const getErrorTitle = (): string => {
    switch (autoFixError.type) {
      case AutoFixErrorType.DATA_RETRIEVAL_ERROR:
        return 'Unable to Retrieve Analysis Data'
      case AutoFixErrorType.AI_SERVICE_ERROR:
        return 'AI Service Unavailable'
      case AutoFixErrorType.PDF_GENERATION_ERROR:
        return 'PDF Generation Failed'
      case AutoFixErrorType.STORAGE_ERROR:
        return 'Storage Error'
      case AutoFixErrorType.VALIDATION_ERROR:
        return 'Validation Error'
      case AutoFixErrorType.NETWORK_ERROR:
        return 'Network Connection Error'
      case AutoFixErrorType.TIMEOUT_ERROR:
        return 'Operation Timed Out'
      default:
        return 'Optimization Failed'
    }
  }

  return (
    <div
      className={`bg-gradient-to-r ${colorClasses.bg} border-2 ${colorClasses.border} rounded-xl p-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-4">
        {/* Error icon */}
        <div className={`w-12 h-12 ${colorClasses.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <AlertCircle className={`w-7 h-7 ${colorClasses.iconColor}`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className={`font-bold text-lg ${colorClasses.titleColor} mb-2`}>
            {getErrorTitle()}
          </h4>

          {/* Message */}
          <p className={`text-sm ${colorClasses.textColor} mb-4 leading-relaxed`}>
            {autoFixError.getUserMessage()}
          </p>

          {/* Error metadata */}
          <div className={`text-xs ${colorClasses.textColor} opacity-75 mb-4 flex flex-wrap gap-3`}>
            <span>Type: {autoFixError.type}</span>
            <span>•</span>
            <span>Severity: {autoFixError.severity}</span>
            {autoFixError.retryable && (
              <>
                <span>•</span>
                <span className="font-semibold">Retryable</span>
              </>
            )}
          </div>

          {/* Troubleshooting steps */}
          {autoFixError.troubleshooting.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className={`w-5 h-5 ${colorClasses.iconColor}`} aria-hidden="true" />
                <p className={`text-sm font-semibold ${colorClasses.titleColor}`}>
                  Troubleshooting Steps:
                </p>
              </div>
              <ul className={`text-sm ${colorClasses.textColor} space-y-2.5 ml-7`}>
                {autoFixError.troubleshooting.map((step: TroubleshootingStep, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className={`flex-shrink-0 font-bold ${colorClasses.titleColor}`}>
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <span className="font-medium">{step.step}</span>
                      {step.description && (
                        <p className="text-xs mt-1 opacity-90 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                      {step.action && (
                        <button
                          onClick={step.action}
                          className={`text-xs ${colorClasses.buttonText} font-medium underline mt-1`}
                        >
                          Take action
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed error information (collapsible) */}
          {showDetailedInfo && (
            <div className={`${colorClasses.detailsBg} border ${colorClasses.border} rounded-lg p-3 mb-4 text-xs font-mono`}>
              <div className="flex items-center gap-2 mb-2">
                <Terminal className={`w-4 h-4 ${colorClasses.iconColor}`} aria-hidden="true" />
                <span className={`font-semibold ${colorClasses.titleColor}`}>
                  Technical Details
                </span>
              </div>
              <pre className={`${colorClasses.textColor} whitespace-pre-wrap break-words`}>
                {autoFixError.getDetailedInfo()}
              </pre>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Retry button */}
            {autoFixError.retryable && onRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className={`px-4 py-2 ${colorClasses.buttonBg} text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md`}
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
              </button>
            )}

            {/* View details button */}
            <button
              onClick={handleViewDetails}
              className={`px-4 py-2 ${colorClasses.buttonText} text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border ${colorClasses.border} hover:bg-white/50`}
            >
              <Bug className="w-4 h-4" aria-hidden="true" />
              <span>{showDetailedInfo ? 'Hide Details' : 'View Details'}</span>
            </button>

            {/* Help link */}
            {helpLink && (
              <a
                href={helpLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-2 ${colorClasses.buttonText} text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border ${colorClasses.border} hover:bg-white/50`}
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                <span>Get Help</span>
              </a>
            )}

            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`px-4 py-2 ${colorClasses.buttonText} text-sm font-medium rounded-lg transition-colors hover:underline`}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {/* Close button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${colorClasses.iconColor} hover:opacity-80 transition-opacity p-1 rounded-lg hover:bg-white/50`}
            aria-label="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * CompactAutoFixErrorNotification
 * Minimal version for inline use
 */
export interface CompactAutoFixErrorNotificationProps {
  error: AutoFixError | Error
  onDismiss?: () => void
  onRetry?: () => void | Promise<void>
}

export function CompactAutoFixErrorNotification({
  error,
  onDismiss,
  onRetry
}: CompactAutoFixErrorNotificationProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const autoFixError = error instanceof AutoFixError 
    ? error 
    : new AutoFixError(
        AutoFixErrorType.UNKNOWN_ERROR,
        error.message,
        false,
        false,
        []
      )

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } catch (err) {
      console.error('Retry failed:', err)
    } finally {
      setIsRetrying(false)
    }
  }

  const getSeverityColor = () => {
    switch (autoFixError.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'bg-red-50 border-red-200 text-red-800'
      case ErrorSeverity.MEDIUM:
        return 'bg-amber-50 border-amber-200 text-amber-800'
      case ErrorSeverity.LOW:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div
      className={`${getSeverityColor()} border rounded-lg px-3 py-2 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1 duration-200`}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1">{autoFixError.getUserMessage()}</span>
      <div className="flex items-center gap-2">
        {autoFixError.retryable && onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="font-medium hover:underline disabled:opacity-50"
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="hover:opacity-80"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
