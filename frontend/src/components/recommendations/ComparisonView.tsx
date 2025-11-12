/**
 * ComparisonView Component
 * Side-by-side display of original vs improved content with diff visualization
 */

import { useState } from 'react'
import { Check, X, TrendingUp } from 'lucide-react'

export interface ContentChange {
  id: string
  original: string
  improved: string
  type: 'bullet' | 'section' | 'keyword'
  scoreImpact: number
  accepted?: boolean
}

export interface ComparisonViewProps {
  changes: ContentChange[]
  onAccept: (changeId: string) => void
  onReject: (changeId: string) => void
  onAcceptAll?: () => void
  onRejectAll?: () => void
}

export function ComparisonView({
  changes,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll
}: ComparisonViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    changes.length > 0 ? changes[0].id : null
  )

  const selectedChange = changes.find(c => c.id === selectedId)
  const acceptedCount = changes.filter(c => c.accepted === true).length
  const rejectedCount = changes.filter(c => c.accepted === false).length
  const pendingCount = changes.filter(c => c.accepted === undefined).length
  const totalImpact = changes
    .filter(c => c.accepted === true)
    .reduce((sum, c) => sum + c.scoreImpact, 0)

  const handleAccept = (id: string) => {
    onAccept(id)
    // Move to next pending change
    const currentIndex = changes.findIndex(c => c.id === id)
    const nextPending = changes
      .slice(currentIndex + 1)
      .find(c => c.accepted === undefined)
    if (nextPending) {
      setSelectedId(nextPending.id)
    }
  }

  const handleReject = (id: string) => {
    onReject(id)
    // Move to next pending change
    const currentIndex = changes.findIndex(c => c.id === id)
    const nextPending = changes
      .slice(currentIndex + 1)
      .find(c => c.accepted === undefined)
    if (nextPending) {
      setSelectedId(nextPending.id)
    }
  }

  if (changes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
        <p className="text-gray-600">No changes to review</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Review Changes
            </h2>
            <p className="text-sm text-gray-600">
              Compare original vs improved content and accept or reject changes
            </p>
          </div>
          <div className="flex gap-2">
            {onRejectAll && pendingCount > 0 && (
              <button
                onClick={onRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reject All
              </button>
            )}
            {onAcceptAll && pendingCount > 0 && (
              <button
                onClick={onAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
            )}
          </div>
        </div>

        {/* Progress Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">
              {acceptedCount} Accepted
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">
              {rejectedCount} Rejected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-600">
              {pendingCount} Pending
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-600">
              +{totalImpact} score impact
            </span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Change List Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto max-h-[600px]">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Changes ({changes.length})
            </h3>
            <div className="space-y-2">
              {changes.map((change, index) => (
                <button
                  key={change.id}
                  onClick={() => setSelectedId(change.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedId === change.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-white border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      Change {index + 1}
                    </span>
                    {change.accepted === true && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    {change.accepted === false && (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {change.original}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">
                      +{change.scoreImpact}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison View */}
        <div className="flex-1 p-6">
          {selectedChange ? (
            <>
              {/* Type Badge */}
              <div className="mb-4">
                <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  {selectedChange.type.charAt(0).toUpperCase() + selectedChange.type.slice(1)}
                </span>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Original */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Original
                  </h4>
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 min-h-[120px]">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {selectedChange.original}
                    </p>
                  </div>
                </div>

                {/* Improved */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Improved
                  </h4>
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 min-h-[120px]">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {selectedChange.improved}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diff Highlights */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">
                  What Changed:
                </h5>
                <DiffHighlight
                  original={selectedChange.original}
                  improved={selectedChange.improved}
                />
              </div>

              {/* Impact Info */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Estimated Score Impact: +{selectedChange.scoreImpact} points
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Accepting this change will improve your overall match score
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedChange.accepted === undefined && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(selectedChange.id)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(selectedChange.id)}
                    className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Accept
                  </button>
                </div>
              )}

              {selectedChange.accepted === true && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-800">
                    Change Accepted
                  </p>
                </div>
              )}

              {selectedChange.accepted === false && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
                  <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-red-800">
                    Change Rejected
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a change to review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Simple diff highlight component
 */
function DiffHighlight({ original, improved }: { original: string; improved: string }) {
  // Simple word-level diff
  const originalWords = original.split(/\s+/)
  const improvedWords = improved.split(/\s+/)

  const removedWords = originalWords.filter(w => !improvedWords.includes(w))
  const addedWords = improvedWords.filter(w => !originalWords.includes(w))

  return (
    <div className="space-y-2 text-sm">
      {removedWords.length > 0 && (
        <div>
          <span className="font-medium text-red-700">Removed: </span>
          <span className="text-gray-700">
            {removedWords.slice(0, 5).join(', ')}
            {removedWords.length > 5 && '...'}
          </span>
        </div>
      )}
      {addedWords.length > 0 && (
        <div>
          <span className="font-medium text-green-700">Added: </span>
          <span className="text-gray-700">
            {addedWords.slice(0, 5).join(', ')}
            {addedWords.length > 5 && '...'}
          </span>
        </div>
      )}
      {removedWords.length === 0 && addedWords.length === 0 && (
        <p className="text-gray-600">Minor formatting or structural changes</p>
      )}
    </div>
  )
}
