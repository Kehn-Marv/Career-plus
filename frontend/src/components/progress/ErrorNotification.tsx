/**
 * ErrorNotification Component
 * Displays error messages with troubleshooting steps and recovery actions
 */

import { AlertCircle, X, RefreshCw, HelpCircle } from 'lucide-react'
import { useState } from 'react'

export interface TroubleshootingStep {
  step: string
  description?: string
}

export interface ErrorAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export interface ErrorNotificationProps {
  /** Error title */
  title: string
  
  /** Error message */
  message: string
  
  /** Troubleshooting steps */
  troubleshooting?: TroubleshootingStep[]
  
  /** Recovery actions */
  actions?: ErrorAction[]
  
  /** Error severity */
  severity?: 'error' | 'warning'
  
  /** Show retry button */
  showRetry?: boolean
  
  /** Retry callback */
  onRetry?: () => void
  
  /** Dismiss callback */
  onDismiss?: () => void
  
  /** Show help link */
  helpLink?: string
}

/**
 * ErrorNotification Component
 * 
 * Features:
 * - Clear error messaging
 * - Troubleshooting steps
 * - Recovery action buttons
 * - Retry functionality
 * - Help link support
 * - Accessible with ARIA attributes
 */
export function ErrorNotification({
  title,
  message,
  troubleshooting = [],
  actions = [],
  severity = 'error',
  showRetry = false,
  onRetry,
  onDismiss,
  helpLink
}: ErrorNotificationProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const colorClasses = severity === 'error' 
    ? {
        bg: 'from-red-50 to-pink-50',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-800',
        buttonBg: 'bg-red-600 hover:bg-red-700',
        buttonText: 'text-red-600 hover:text-red-800'
      }
    : {
        bg: 'from-amber-50 to-orange-50',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        titleColor: 'text-amber-900',
        textColor: 'text-amber-800',
        buttonBg: 'bg-amber-600 hover:bg-amber-700',
        buttonText: 'text-amber-600 hover:text-amber-800'
      }

  return (
    <div
      className={`bg-gradient-to-r ${colorClasses.bg} border-2 ${colorClasses.border} rounded-xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Error icon */}
        <div className={`w-10 h-10 ${colorClasses.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <AlertCircle className={`w-6 h-6 ${colorClasses.iconColor}`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className={`font-bold ${colorClasses.titleColor} mb-1`}>
            {title}
          </h4>

          {/* Message */}
          <p className={`text-sm ${colorClasses.textColor} mb-3`}>
            {message}
          </p>

          {/* Troubleshooting steps */}
          {troubleshooting.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className={`w-4 h-4 ${colorClasses.iconColor}`} aria-hidden="true" />
                <p className={`text-sm font-semibold ${colorClasses.titleColor}`}>
                  Troubleshooting:
                </p>
              </div>
              <ul className={`text-sm ${colorClasses.textColor} space-y-1.5 ml-6`}>
                {troubleshooting.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0">•</span>
                    <div>
                      <span className="font-medium">{step.step}</span>
                      {step.description && (
                        <p className="text-xs mt-0.5 opacity-90">{step.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Retry button */}
            {showRetry && onRetry && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className={`px-3 py-1.5 ${colorClasses.buttonBg} text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
              </button>
            )}

            {/* Custom actions */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  action.variant === 'primary'
                    ? `${colorClasses.buttonBg} text-white`
                    : `${colorClasses.buttonText} underline`
                }`}
              >
                {action.label}
              </button>
            ))}

            {/* Help link */}
            {helpLink && (
              <a
                href={helpLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 ${colorClasses.buttonText} text-sm font-medium underline`}
              >
                Get Help
              </a>
            )}

            {/* Dismiss button */}
            {onDismiss && !showRetry && (
              <button
                onClick={onDismiss}
                className={`${colorClasses.buttonText} text-sm font-medium underline`}
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
            className={`flex-shrink-0 ${colorClasses.iconColor} hover:opacity-80 transition-opacity`}
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
 * CompactErrorNotification
 * Minimal version for inline use
 */
export interface CompactErrorNotificationProps {
  message: string
  onDismiss?: () => void
  onRetry?: () => void
}

export function CompactErrorNotification({
  message,
  onDismiss,
  onRetry
}: CompactErrorNotificationProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-red-800 animate-in fade-in slide-in-from-top-1 duration-200"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
