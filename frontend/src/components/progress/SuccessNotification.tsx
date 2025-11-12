/**
 * SuccessNotification Component
 * Displays success messages with action summaries
 */

import { CheckCircle, X, Download, Eye, History } from 'lucide-react'
import { useState, useEffect } from 'react'

export interface SuccessAction {
  label: string
  icon?: 'download' | 'view' | 'history'
  onClick: () => void
}

export interface SuccessNotificationProps {
  /** Main success title */
  title: string
  
  /** Detailed message */
  message?: string
  
  /** List of completed actions/changes */
  summary?: string[]
  
  /** Action buttons */
  actions?: SuccessAction[]
  
  /** Auto-dismiss after X milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number
  
  /** Callback when dismissed */
  onDismiss?: () => void
  
  /** Show animation */
  animate?: boolean
}

const iconMap = {
  download: Download,
  view: Eye,
  history: History
}

/**
 * SuccessNotification Component
 * 
 * Features:
 * - Animated entrance
 * - Action summary list
 * - Optional action buttons
 * - Auto-dismiss capability
 * - Accessible with ARIA attributes
 */
export function SuccessNotification({
  title,
  message,
  summary = [],
  actions = [],
  autoDismiss = 0,
  onDismiss,
  animate = true
}: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoDismiss)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss?.()
    }, 300) // Wait for exit animation
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-lg ${
        animate ? 'animate-in fade-in slide-in-from-top-2 duration-300' : ''
      }`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Success icon */}
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-bold text-green-900 mb-1">
            {title}
          </h4>

          {/* Message */}
          {message && (
            <p className="text-sm text-green-800 mb-2">
              {message}
            </p>
          )}

          {/* Summary list */}
          {summary.length > 0 && (
            <ul className="text-xs text-green-700 space-y-1 mb-3">
              {summary.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Action buttons */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, index) => {
                const Icon = action.icon ? iconMap[action.icon] : null
                
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5"
                  >
                    {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
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
 * CompactSuccessNotification
 * Minimal version for inline use
 */
export interface CompactSuccessNotificationProps {
  message: string
  onDismiss?: () => void
  autoDismiss?: number
}

export function CompactSuccessNotification({
  message,
  onDismiss,
  autoDismiss = 3000
}: CompactSuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss?.(), 300)
      }, autoDismiss)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss, onDismiss])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-green-800 animate-in fade-in slide-in-from-top-1 duration-200"
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onDismiss(), 300)
          }}
          className="text-green-600 hover:text-green-800"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
