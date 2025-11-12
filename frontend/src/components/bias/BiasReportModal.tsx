/**
 * BiasReportModal Component
 * Displays detailed bias analysis report with categorized issues
 * Shows biased phrases highlighted in context with neutral alternatives
 */

import { useState, useEffect, useRef } from 'react'
import { X, AlertTriangle, CheckCircle, Loader, Shield, TrendingDown } from 'lucide-react'
import { biasAnalyzer } from '@/lib/bias'
import type { BiasReport, BiasIssue } from '@/lib/bias'
import type { Resume } from '@/lib/db/schema'
import { ariaAnnouncer, useFocusTrap } from '@/lib/accessibility'

export interface BiasReportModalProps {
  resume: Resume | null
  isOpen: boolean
  onClose: () => void
  onApplyFixes?: (fixedResume: Resume) => void
}

/**
 * Category display configuration
 */
const CATEGORY_CONFIG = {
  gender: {
    label: 'Gender',
    icon: '⚧',
    color: 'purple',
    description: 'Gender-specific terms and pronouns'
  },
  age: {
    label: 'Age',
    icon: '📅',
    color: 'blue',
    description: 'Age-related references'
  },
  race: {
    label: 'Race/Ethnicity',
    icon: '🌍',
    color: 'green',
    description: 'Race and ethnicity references'
  },
  religion: {
    label: 'Religion',
    icon: '🕊',
    color: 'indigo',
    description: 'Religious references'
  },
  disability: {
    label: 'Disability',
    icon: '♿',
    color: 'orange',
    description: 'Ableist language'
  },
  marital_status: {
    label: 'Marital Status',
    icon: '💍',
    color: 'pink',
    description: 'Marital status references'
  },
  socioeconomic: {
    label: 'Socioeconomic',
    icon: '💰',
    color: 'yellow',
    description: 'Socioeconomic references'
  },
  other: {
    label: 'Other',
    icon: '⚠',
    color: 'gray',
    description: 'Other potentially biased terms'
  }
} as const

export function BiasReportModal({
  resume,
  isOpen,
  onClose,
  onApplyFixes
}: BiasReportModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isApplyingFixes, setIsApplyingFixes] = useState(false)
  const [report, setReport] = useState<BiasReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    setReport(null)
    setError(null)
    setSelectedCategory(null)
    ariaAnnouncer.announce('Bias report modal closed', { priority: 'polite' })
    onClose()
  }
  
  // Focus trap for modal
  useFocusTrap(modalRef, isOpen, {
    escapeDeactivates: true,
    onEscape: handleClose
  })

  // Load bias report when modal opens
  useEffect(() => {
    if (isOpen && resume && !report && !isLoading) {
      loadBiasReport()
    }
  }, [isOpen, resume])

  const loadBiasReport = async () => {
    if (!resume) return

    setIsLoading(true)
    setError(null)
    ariaAnnouncer.announce('Loading bias report', { priority: 'polite' })

    try {
      const biasReport = await biasAnalyzer.getDetailedReport(resume)
      setReport(biasReport)
      
      if (biasReport.detectedIssues.length === 0) {
        ariaAnnouncer.announceSuccess('No bias detected in resume')
      } else {
        ariaAnnouncer.announce(
          `Bias report loaded. Found ${biasReport.detectedIssues.length} issue${biasReport.detectedIssues.length !== 1 ? 's' : ''}`,
          { priority: 'polite' }
        )
      }
    } catch (err) {
      console.error('Error loading bias report:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to load bias report'
      setError(errorMsg)
      ariaAnnouncer.announceError(`Failed to load bias report: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyFixes = async () => {
    if (!resume || !report || !onApplyFixes) return

    setIsApplyingFixes(true)
    setError(null)
    ariaAnnouncer.announce('Applying bias fixes', { priority: 'polite' })

    try {
      const fixedResume = await biasAnalyzer.applyBiasFixes(resume, report)
      ariaAnnouncer.announceSuccess(`Applied ${report.detectedIssues.length} bias fix${report.detectedIssues.length !== 1 ? 'es' : ''}`)
      onApplyFixes(fixedResume)
      onClose()
    } catch (err) {
      console.error('Error applying bias fixes:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to apply fixes'
      setError(errorMsg)
      ariaAnnouncer.announceError(`Failed to apply fixes: ${errorMsg}`)
    } finally {
      setIsApplyingFixes(false)
    }
  }

  if (!isOpen) return null

  // Filter issues by selected category
  const filteredIssues = selectedCategory
    ? report?.detectedIssues.filter(issue => issue.category === selectedCategory) || []
    : report?.detectedIssues || []

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bias-modal-title"
      aria-describedby="bias-modal-description"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 id="bias-modal-title" className="text-2xl font-bold text-gray-800">
                  Bias Detection Report
                </h2>
                <p id="bias-modal-description" className="text-sm text-gray-600">
                  Inclusive language analysis across 8 categories
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Close bias report modal"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader className="w-16 h-16 text-purple-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-800 mb-2">
                Analyzing Resume...
              </p>
              <p className="text-sm text-gray-600">
                Checking for biased language across 8 categories
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">
                      Error Loading Report
                    </h3>
                    <p className="text-sm text-red-800 mb-4">{error}</p>
                    <button
                      onClick={loadBiasReport}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Content */}
          {report && !isLoading && (
            <div className="p-6">
              {/* Overall Score */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        Overall Bias Score
                      </h3>
                      <p className="text-sm text-gray-600">
                        {report.overallScore === 0
                          ? 'No bias detected - excellent!'
                          : report.overallScore < 20
                          ? 'Low bias detected - minor improvements suggested'
                          : report.overallScore < 50
                          ? 'Moderate bias detected - review recommended'
                          : 'High bias detected - immediate action recommended'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold ${
                          report.overallScore === 0
                            ? 'text-green-600'
                            : report.overallScore < 20
                            ? 'text-blue-600'
                            : report.overallScore < 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {report.overallScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">out of 100</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty State - No Bias Detected */}
              {report.detectedIssues.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No Bias Detected!
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your resume uses inclusive language and doesn't contain any
                    potentially biased terms. Great job!
                  </p>
                </div>
              )}

              {/* Category Filters */}
              {report.detectedIssues.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Filter by Category
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === null
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All ({report.detectedIssues.length})
                      </button>
                      {Object.entries(report.categories).map(([category, count]) => {
                        if (count === 0) return null
                        const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
                        return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedCategory === category
                                ? `bg-${config.color}-600 text-white`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {config.icon} {config.label} ({count})
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Issues List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Detected Issues ({filteredIssues.length})
                    </h3>
                    {filteredIssues.map((issue) => {
                      const config = CATEGORY_CONFIG[issue.category]
                      return (
                        <BiasIssueCard key={issue.id} issue={issue} config={config} />
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {report && report.detectedIssues.length > 0 && !isLoading && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span>
                  Applying fixes will improve your resume's inclusivity
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  disabled={isApplyingFixes}
                >
                  Close
                </button>
                {onApplyFixes && (
                  <button
                    onClick={handleApplyFixes}
                    disabled={isApplyingFixes}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isApplyingFixes ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Applying Fixes...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Apply All Fixes
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Individual Bias Issue Card Component
 */
function BiasIssueCard({
  issue,
  config
}: {
  issue: BiasIssue
  config: typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]
}) {
  const severityColors = {
    high: 'red',
    medium: 'yellow',
    low: 'blue'
  }

  const severityColor = severityColors[issue.severity]

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <div>
            <span className="text-sm font-semibold text-gray-700">
              {config.label}
            </span>
            <span
              className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-${severityColor}-100 text-${severityColor}-700`}
            >
              {issue.severity}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {Math.round(issue.confidence * 100)}% confidence
        </div>
      </div>

      {/* Context with highlighted phrase */}
      {issue.context && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Context:</p>
          <p className="text-sm text-gray-700">
            {highlightPhrase(issue.context, issue.original)}
          </p>
        </div>
      )}

      {/* Original and Suggestion */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Original:</p>
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-gray-800">
            "{issue.original}"
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Suggestion:</p>
          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-gray-800">
            "{issue.suggestion}"
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p>{issue.reason}</p>
      </div>
    </div>
  )
}

/**
 * Highlight the biased phrase in context
 */
function highlightPhrase(context: string, phrase: string): React.ReactNode {
  const regex = new RegExp(`(${phrase})`, 'gi')
  const parts = context.split(regex)

  return (
    <>
      {parts.map((part, index) => {
        if (part.toLowerCase() === phrase.toLowerCase()) {
          return (
            <mark
              key={index}
              className="bg-yellow-200 text-gray-900 font-semibold px-1 rounded"
            >
              {part}
            </mark>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
