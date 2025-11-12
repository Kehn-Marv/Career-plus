/**
 * ATSScoreCard Component
 * Displays ATS compatibility score with specific issues and fix suggestions
 */

import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export type ATSIssueSeverity = 'critical' | 'warning' | 'info'

export interface ATSIssue {
  id: string
  severity: ATSIssueSeverity
  title: string
  description: string
  suggestion: string
}

export interface ATSScoreCardProps {
  atsScore: number
  issues: ATSIssue[]
}

export function ATSScoreCard({ atsScore, issues }: ATSScoreCardProps) {
  // Group issues by severity
  const criticalIssues = issues.filter(i => i.severity === 'critical')
  const warningIssues = issues.filter(i => i.severity === 'warning')
  const infoIssues = issues.filter(i => i.severity === 'info')

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreColorBg = (score: number): string => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'ATS-Friendly'
    if (score >= 60) return 'Needs Minor Fixes'
    return 'Needs Major Fixes'
  }

  const getSeverityIcon = (severity: ATSIssueSeverity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityBg = (severity: ATSIssueSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        ATS Compatibility
      </h2>

      {/* ATS Score */}
      <div className={`rounded-lg p-4 mb-6 border-2 ${getScoreColorBg(atsScore)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            ATS Compatibility Score
          </span>
          <span className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
            {Math.round(atsScore)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          {atsScore >= 80 ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
          <span className={`font-semibold ${getScoreColor(atsScore)}`}>
            {getScoreLabel(atsScore)}
          </span>
        </div>
      </div>

      {/* Issues Summary */}
      {issues.length > 0 ? (
        <>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Issues Found ({issues.length})
            </h3>
            
            {/* Issue counts */}
            <div className="flex gap-4 mb-4">
              {criticalIssues.length > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">
                    {criticalIssues.length} Critical
                  </span>
                </div>
              )}
              {warningIssues.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {warningIssues.length} Warning
                  </span>
                </div>
              )}
              {infoIssues.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {infoIssues.length} Info
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`rounded-lg p-4 border ${getSeverityBg(issue.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(issue.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">
                      {issue.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {issue.description}
                    </p>
                    <div className="bg-white bg-opacity-50 rounded p-2 border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        💡 Suggestion:
                      </p>
                      <p className="text-xs text-gray-600">
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            No ATS issues found!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Your resume is well-formatted for ATS systems
          </p>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>ATS (Applicant Tracking System)</strong> software is used by employers 
          to scan and filter resumes. Fixing these issues improves your chances of passing 
          automated screening.
        </p>
      </div>
    </div>
  )
}
