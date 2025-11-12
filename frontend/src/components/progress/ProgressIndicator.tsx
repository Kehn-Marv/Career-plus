/**
 * ProgressIndicator Component
 * Reusable progress indicator for long-running operations
 * Displays progress bar, percentage, status messages, and estimated time
 */

import { Loader2, Clock } from 'lucide-react'

export interface ProgressIndicatorProps {
  /** Current progress percentage (0-100) */
  percentage: number
  
  /** Current step/phase name */
  step: string
  
  /** Detailed status message */
  message: string
  
  /** Estimated time remaining in seconds (optional) */
  estimatedTimeRemaining?: number
  
  /** Show compact version */
  compact?: boolean
  
  /** Custom color scheme */
  color?: 'emerald' | 'blue' | 'purple' | 'orange'
  
  /** Show spinner animation */
  showSpinner?: boolean
}

/**
 * Format seconds into human-readable time
 */
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * ProgressIndicator Component
 * 
 * Features:
 * - Animated progress bar with percentage
 * - Step name and status message
 * - Optional estimated time remaining
 * - Accessible with ARIA attributes
 * - Customizable color schemes
 */
export function ProgressIndicator({
  percentage,
  step,
  message,
  estimatedTimeRemaining,
  compact = false,
  color = 'emerald',
  showSpinner = true
}: ProgressIndicatorProps) {
  const colorClasses = {
    emerald: 'from-emerald-600 to-teal-600',
    blue: 'from-blue-600 to-indigo-600',
    purple: 'from-purple-600 to-pink-600',
    orange: 'from-orange-600 to-amber-600'
  }

  const gradientClass = colorClasses[color]

  if (compact) {
    return (
      <div className="space-y-1" role="status" aria-live="polite">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            {showSpinner && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
            <span className="capitalize">{step}</span>
          </div>
          <span className="font-medium">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${gradientClass} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${step}: ${percentage}% complete`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3" role="status" aria-live="polite">
      {/* Header with step and percentage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showSpinner && (
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center`}>
              <Loader2 className="w-5 h-5 text-white animate-spin" aria-hidden="true" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-900 capitalize">
              {step.replace(/-/g, ' ')}
            </h4>
            {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>About {formatTime(estimatedTimeRemaining)} remaining</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`bg-gradient-to-r ${gradientClass} h-3 rounded-full transition-all duration-300 shadow-sm`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${step}: ${percentage}% complete`}
        />
      </div>

      {/* Status message */}
      <p className="text-sm text-gray-600 text-center">
        {message}
      </p>
    </div>
  )
}

/**
 * ProgressSteps Component
 * Shows a list of steps with completion status
 */
export interface ProgressStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'complete' | 'error'
}

export interface ProgressStepsProps {
  steps: ProgressStep[]
  compact?: boolean
}

export function ProgressSteps({ steps, compact = false }: ProgressStepsProps) {
  return (
    <div className={`space-y-${compact ? '2' : '3'}`} role="list" aria-label="Progress steps">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        
        return (
          <div key={step.id} className="relative" role="listitem">
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="relative flex-shrink-0">
                {step.status === 'complete' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {step.status === 'active' && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
                {step.status === 'error' && (
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="w-6 h-6 rounded-full bg-gray-300" />
                )}
                
                {/* Connector line */}
                {!isLast && (
                  <div 
                    className={`absolute top-6 left-3 w-0.5 h-${compact ? '8' : '10'} ${
                      step.status === 'complete' ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
              
              {/* Step label */}
              <span className={`text-sm ${
                step.status === 'active' ? 'font-semibold text-gray-900' :
                step.status === 'complete' ? 'text-gray-700' :
                step.status === 'error' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
