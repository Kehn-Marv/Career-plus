/**
 * AutoFixModal Component
 * Modal for reviewing and accepting/rejecting AI-improved resume bullets
 */

import { useState, useEffect } from 'react'
import { X, Check, SkipForward, CheckCircle, Loader, AlertCircle, TrendingUp } from 'lucide-react'
import type { BulletRewriteResult } from '../../lib/autofix/batch-orchestrator'

export interface AutoFixModalProps {
  isOpen: boolean
  onClose: () => void
  results: BulletRewriteResult[]
  onAccept: (id: string) => void
  onSkip: (id: string) => void
  onAcceptAll: () => void
  onComplete: () => void
  estimatedImprovement: number
}

export function AutoFixModal({
  isOpen,
  onClose,
  results,
  onAccept,
  onSkip,
  onAcceptAll,
  onComplete,
  estimatedImprovement
}: AutoFixModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set())
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())

  // Reset when results change
  useEffect(() => {
    setCurrentIndex(0)
    setAcceptedIds(new Set())
    setSkippedIds(new Set())
  }, [results])

  if (!isOpen) return null

  const successfulResults = results.filter(r => r.success)
  const currentResult = successfulResults[currentIndex]
  const isLastItem = currentIndex === successfulResults.length - 1
  const reviewedCount = acceptedIds.size + skippedIds.size
  const progress = Math.round((reviewedCount / successfulResults.length) * 100)

  const handleAccept = () => {
    if (!currentResult) return

    setAcceptedIds(prev => new Set(prev).add(currentResult.id))
    onAccept(currentResult.id)

    if (isLastItem) {
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSkip = () => {
    if (!currentResult) return

    setSkippedIds(prev => new Set(prev).add(currentResult.id))
    onSkip(currentResult.id)

    if (isLastItem) {
      onComplete()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleAcceptAll = () => {
    const allIds = new Set(successfulResults.map(r => r.id))
    setAcceptedIds(allIds)
    onAcceptAll()
    onComplete()
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < successfulResults.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (successfulResults.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Changes Available
            </h3>
            <p className="text-gray-600 mb-6">
              Unable to generate improved versions of your resume bullets. Please try again later.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (reviewedCount === successfulResults.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Review Complete!
            </h3>
            <p className="text-gray-600 mb-4">
              You've reviewed all {successfulResults.length} changes.
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Accepted Changes</span>
                <span className="text-2xl font-bold text-green-600">
                  {acceptedIds.size}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">
                  +{Math.round((acceptedIds.size / successfulResults.length) * estimatedImprovement)} estimated score increase
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Auto-Fix: Review Changes
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Change {currentIndex + 1} of {successfulResults.length}
              </span>
              <span>{progress}% reviewed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">
                {acceptedIds.size} Accepted
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-gray-600">
                {skippedIds.size} Skipped
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm ml-auto">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-semibold">
                +{estimatedImprovement} potential score increase
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentResult && (
            <>
              {/* Context Info */}
              <div className="mb-4 text-sm text-gray-600">
                <span className="font-medium">Experience:</span>{' '}
                Position {currentResult.experienceIndex + 1}, Bullet {currentResult.bulletIndex + 1}
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Original */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Original
                  </h3>
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 min-h-[120px]">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {currentResult.original}
                    </p>
                  </div>
                </div>

                {/* Improved */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    AI-Improved
                  </h3>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 min-h-[120px]">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {currentResult.rewritten}
                    </p>
                  </div>
                </div>
              </div>

              {/* Improvements Highlight */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Key Improvements:
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {getImprovements(currentResult.original, currentResult.rewritten).map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3 mb-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <SkipForward className="w-5 h-5" />
              Skip
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Accept
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Accept All Remaining
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === successfulResults.length - 1}
              className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Analyze improvements between original and rewritten
 */
function getImprovements(original: string, rewritten: string): string[] {
  const improvements: string[] = []

  // Check for quantification
  const hasNumbers = /\d+/.test(rewritten) && !/\d+/.test(original)
  if (hasNumbers) {
    improvements.push('Added quantifiable metrics')
  }

  // Check for action verbs
  const actionVerbs = ['led', 'managed', 'developed', 'implemented', 'designed', 'optimized', 'improved']
  const hasActionVerb = actionVerbs.some(verb => 
    rewritten.toLowerCase().startsWith(verb) && !original.toLowerCase().startsWith(verb)
  )
  if (hasActionVerb) {
    improvements.push('Starts with strong action verb')
  }

  // Check for impact/results
  const impactWords = ['increased', 'reduced', 'improved', 'achieved', 'delivered']
  const hasImpact = impactWords.some(word => 
    rewritten.toLowerCase().includes(word) && !original.toLowerCase().includes(word)
  )
  if (hasImpact) {
    improvements.push('Emphasizes results and impact')
  }

  // Check for conciseness
  if (rewritten.length < original.length * 0.9) {
    improvements.push('More concise and focused')
  }

  // Check for specificity
  if (rewritten.length > original.length * 1.1) {
    improvements.push('More specific and detailed')
  }

  // Default if no specific improvements detected
  if (improvements.length === 0) {
    improvements.push('Enhanced clarity and professionalism')
    improvements.push('Better aligned with job requirements')
  }

  return improvements.slice(0, 3)
}

/**
 * Loading Modal Component
 */
export function AutoFixLoadingModal({
  isOpen,
  progress,
  onCancel
}: {
  isOpen: boolean
  progress: { completed: number; total: number; percentage: number }
  onCancel: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Improving Your Resume...
          </h3>
          <p className="text-gray-600 mb-6">
            AI is rewriting your bullets to be more impactful
          </p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Processing bullets</span>
              <span>
                {progress.completed} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This may take 1-2 minutes depending on resume length
            </p>
          </div>

          <button
            onClick={onCancel}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
