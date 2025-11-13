/**
 * ProgressTracker Component
 * Displays real-time progress for auto-fix optimization workflow
 * Shows progress percentage, optimization steps with status indicators, and estimated time
 */

import { CheckCircle, Loader2, Clock, AlertCircle } from 'lucide-react'
import type { ProgressStep } from '@/lib/autofix/auto-fix-orchestrator'

export interface ProgressTrackerProps {
  /** List of optimization steps with status */
  steps: ProgressStep[]
  
  /** Current step index (0-based) */
  currentStep: number
  
  /** Overall progress percentage (0-100) */
  percentage: number
  
  /** Estimated time remaining in seconds (optional) */
  estimatedTimeRemaining?: number
  
  /** Compact mode for smaller displays */
  compact?: boolean
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
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * ProgressTracker Component
 * 
 * Features:
 * - Animated progress bar with percentage
 * - List of optimization steps with status indicators
 * - Animated checkmarks (✅) when steps complete
 * - Estimated time remaining display
 * - Accessible with ARIA attributes
 * - Smooth animations and transitions
 */
export function ProgressTracker({
  steps,
  currentStep,
  percentage,
  estimatedTimeRemaining,
  compact = false
}: ProgressTrackerProps) {
  if (compact) {
    return (
      <div className="space-y-2" role="status" aria-live="polite" aria-label="Optimization progress">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Optimization ${percentage}% complete`}
          />
        </div>
        
        {/* Current step and percentage */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
            {steps[currentStep]?.title || 'Processing...'}
          </span>
          <span className="font-semibold">{percentage}%</span>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4"
      role="status" 
      aria-live="polite"
      aria-label="Optimization progress"
    >
      {/* Header with percentage and time */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Optimizing Your Resume
          </h3>
          {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>About {formatTime(estimatedTimeRemaining)} remaining</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-emerald-600">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-emerald-600 to-teal-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Optimization ${percentage}% complete`}
        />
      </div>

      {/* Steps list */}
      <div className="space-y-3" role="list" aria-label="Optimization steps">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = step.status === 'completed'
          const isFailed = step.status === 'failed'
          const isPending = step.status === 'pending'
          
          return (
            <div 
              key={step.id} 
              className={`flex items-start gap-3 transition-all duration-300 ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
              role="listitem"
            >
              {/* Status icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted && (
                  <div 
                    className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in"
                    aria-label="Completed"
                  >
                    <CheckCircle className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                )}
                {isActive && (
                  <div 
                    className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                    aria-label="In progress"
                  >
                    <Loader2 className="w-4 h-4 text-white animate-spin" aria-hidden="true" />
                  </div>
                )}
                {isFailed && (
                  <div 
                    className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                    aria-label="Failed"
                  >
                    <AlertCircle className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                )}
                {isPending && (
                  <div 
                    className="w-6 h-6 rounded-full bg-gray-300"
                    aria-label="Pending"
                  />
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${
                  isActive ? 'text-gray-900' :
                  isCompleted ? 'text-gray-700' :
                  isFailed ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </div>
                
                {/* Step message or error */}
                {(step.message || step.error) && (
                  <div className={`text-xs mt-1 ${
                    step.error ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {step.error || step.message}
                  </div>
                )}
              </div>
              
              {/* Checkmark animation for completed steps */}
              {isCompleted && (
                <div className="flex-shrink-0 text-emerald-600 animate-fade-in">
                  <span className="text-lg" role="img" aria-label="Completed">✅</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info message */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Please wait while we optimize your resume with AI-powered improvements
        </p>
      </div>
    </div>
  )
}

/**
 * Add custom animations to global CSS or Tailwind config:
 * 
 * @keyframes scale-in {
 *   0% { transform: scale(0); opacity: 0; }
 *   50% { transform: scale(1.1); }
 *   100% { transform: scale(1); opacity: 1; }
 * }
 * 
 * @keyframes fade-in {
 *   0% { opacity: 0; transform: translateX(-10px); }
 *   100% { opacity: 1; transform: translateX(0); }
 * }
 * 
 * .animate-scale-in {
 *   animation: scale-in 0.3s ease-out;
 * }
 * 
 * .animate-fade-in {
 *   animation: fade-in 0.3s ease-out;
 * }
 */
