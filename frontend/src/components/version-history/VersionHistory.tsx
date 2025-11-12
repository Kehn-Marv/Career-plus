/**
 * VersionHistory Component
 * Displays timeline of optimized resume versions with metadata
 * Allows version selection, preview, restore, and export
 */

import { useState, useEffect } from 'react'
import {
  Clock,
  Download,
  Eye,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useOptimizationStore } from '@/store/optimization-store'
import {
  getVersionChangeSummary,
  compareVersions,
  type VersionComparison
} from '@/lib/db/optimized-resume-operations'
import type { OptimizedResume } from '@/lib/db/schema'

export interface VersionHistoryProps {
  analysisId: number
  onVersionSelect?: (version: OptimizedResume) => void
}

export function VersionHistory({ analysisId, onVersionSelect }: VersionHistoryProps) {
  const {
    versions,
    currentOptimizedResume,
    loadVersionHistory,
    restoreVersion,
    exportToPDF,
    isGeneratingPDF
  } = useOptimizationStore()

  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set())
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)
  const [previewVersion, setPreviewVersion] = useState<OptimizedResume | null>(null)
  const [comparison, setComparison] = useState<VersionComparison | null>(null)
  const [versionSummaries, setVersionSummaries] = useState<Map<number, string[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load version history on mount
  useEffect(() => {
    loadVersionHistory(analysisId)
  }, [analysisId, loadVersionHistory])

  // Load summaries for all versions
  useEffect(() => {
    const loadSummaries = async () => {
      const summaries = new Map<number, string[]>()
      for (const version of versions) {
        if (version.id) {
          const summary = await getVersionChangeSummary(version.id)
          summaries.set(version.id, summary)
        }
      }
      setVersionSummaries(summaries)
    }

    if (versions.length > 0) {
      loadSummaries()
    }
  }, [versions])

  // Set current version as selected by default
  useEffect(() => {
    if (currentOptimizedResume?.id && !selectedVersionId) {
      setSelectedVersionId(currentOptimizedResume.id)
    }
  }, [currentOptimizedResume, selectedVersionId])

  const toggleExpanded = (versionId: number) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId)
    } else {
      newExpanded.add(versionId)
    }
    setExpandedVersions(newExpanded)
  }

  const handlePreview = (version: OptimizedResume) => {
    setPreviewVersion(version)
    if (onVersionSelect) {
      onVersionSelect(version)
    }
  }

  const handleRestore = async (versionId: number) => {
    try {
      setLoading(true)
      setError(null)
      await restoreVersion(versionId)
      setSelectedVersionId(versionId)
      setPreviewVersion(null)
    } catch (err: any) {
      setError(err.message || 'Failed to restore version')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (versionId: number) => {
    try {
      setError(null)
      await exportToPDF(versionId)
    } catch (err: any) {
      setError(err.message || 'Failed to export PDF')
    }
  }

  const handleCompare = async (versionId: number) => {
    if (!currentOptimizedResume?.id) return

    try {
      setLoading(true)
      setError(null)
      const comp = await compareVersions(versionId, currentOptimizedResume.id)
      setComparison(comp)
    } catch (err: any) {
      setError(err.message || 'Failed to compare versions')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVersionLabel = (version: OptimizedResume) => {
    if (version.id === currentOptimizedResume?.id) {
      return 'Current'
    }
    return `Version ${version.version}`
  }

  const getCreatorLabel = (version: OptimizedResume) => {
    if (version.appliedFixes.localizationApplied && version.region) {
      return `Localization (${version.region})`
    }
    if (version.appliedFixes.recommendationIds.length > 0) {
      return 'Auto-Fix'
    }
    return 'Manual'
  }

  if (versions.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Version History
        </h3>
        <p className="text-sm text-gray-600">
          Run Auto-Fix to create your first optimized resume version
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Version History</h3>
          <p className="text-sm text-gray-600">
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Version Timeline */}
      <div className="space-y-3">
        {versions.map((version, index) => {
          const isExpanded = version.id ? expandedVersions.has(version.id) : false
          const isSelected = version.id === selectedVersionId
          const isCurrent = version.id === currentOptimizedResume?.id
          const summary = version.id ? versionSummaries.get(version.id) || [] : []

          return (
            <div
              key={version.id || index}
              className={`bg-white rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-emerald-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Version Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">
                        {getVersionLabel(version)}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                      {version.region && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {version.region}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(version.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{getCreatorLabel(version)}</span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>ATS: {version.atsCompatibilityScore}</span>
                      <span>Words: {version.wordCount}</span>
                      <span>Template: {version.templateId}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => version.id && handlePreview(version)}
                      className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Preview version"
                      aria-label="Preview version"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    {!isCurrent && (
                      <button
                        onClick={() => version.id && handleRestore(version.id)}
                        disabled={loading}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Restore this version"
                        aria-label="Restore this version"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-5 h-5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => version.id && handleExport(version.id)}
                      disabled={isGeneratingPDF}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Export as PDF"
                      aria-label="Export as PDF"
                    >
                      {isGeneratingPDF ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => version.id && toggleExpanded(version.id)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Change Summary */}
                    {summary.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">
                          Changes
                        </h5>
                        <ul className="space-y-1">
                          {summary.map((change, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-emerald-600 mt-1">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Compare Button */}
                    {!isCurrent && currentOptimizedResume && (
                      <button
                        onClick={() => version.id && handleCompare(version.id)}
                        disabled={loading}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline disabled:opacity-50"
                      >
                        Compare with current version
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison Modal */}
      {comparison && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setComparison(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Version Comparison
            </h3>

            <div className="space-y-4">
              {/* Template Change */}
              {comparison.changes.templateChanged && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Template Changed</h4>
                  <p className="text-sm text-blue-800">
                    {comparison.oldVersion.templateId} → {comparison.newVersion.templateId}
                  </p>
                </div>
              )}

              {/* Region Change */}
              {comparison.changes.regionChanged && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Region Changed</h4>
                  <p className="text-sm text-purple-800">
                    {comparison.oldVersion.region || 'None'} → {comparison.newVersion.region || 'None'}
                  </p>
                </div>
              )}

              {/* ATS Score Change */}
              {comparison.changes.atsScoreChange !== 0 && (
                <div className={`rounded-lg p-4 ${
                  comparison.changes.atsScoreChange > 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    comparison.changes.atsScoreChange > 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    ATS Score Change
                  </h4>
                  <div className="flex items-center gap-2">
                    {comparison.changes.atsScoreChange > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : comparison.changes.atsScoreChange < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    ) : (
                      <Minus className="w-5 h-5 text-gray-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      comparison.changes.atsScoreChange > 0 ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {comparison.changes.atsScoreChange > 0 ? '+' : ''}
                      {comparison.changes.atsScoreChange} points
                    </span>
                  </div>
                </div>
              )}

              {/* Content Changes */}
              {Object.entries(comparison.changes.contentChanges).some(([_, changes]) =>
                Array.isArray(changes) ? changes.length > 0 : changes
              ) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Content Changes</h4>
                  <ul className="space-y-1">
                    {comparison.changes.contentChanges.contact.length > 0 && (
                      <li className="text-sm text-gray-700">
                        Contact: {comparison.changes.contentChanges.contact.join(', ')}
                      </li>
                    )}
                    {comparison.changes.contentChanges.summary && (
                      <li className="text-sm text-gray-700">Summary modified</li>
                    )}
                    {comparison.changes.contentChanges.experience.map((change, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{change}</li>
                    ))}
                    {comparison.changes.contentChanges.education.map((change, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{change}</li>
                    ))}
                    {comparison.changes.contentChanges.skills.map((change, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{change}</li>
                    ))}
                    {comparison.changes.contentChanges.projects.map((change, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fixes Changes */}
              {(comparison.changes.fixesChanges.addedRecommendations.length > 0 ||
                comparison.changes.fixesChanges.addedATSFixes.length > 0 ||
                comparison.changes.fixesChanges.biasFixesDelta !== 0) && (
                <div className="bg-emerald-50 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-900 mb-2">Applied Fixes</h4>
                  <ul className="space-y-1">
                    {comparison.changes.fixesChanges.addedRecommendations.length > 0 && (
                      <li className="text-sm text-emerald-800">
                        +{comparison.changes.fixesChanges.addedRecommendations.length} recommendations
                      </li>
                    )}
                    {comparison.changes.fixesChanges.addedATSFixes.length > 0 && (
                      <li className="text-sm text-emerald-800">
                        +{comparison.changes.fixesChanges.addedATSFixes.length} ATS fixes
                      </li>
                    )}
                    {comparison.changes.fixesChanges.biasFixesDelta !== 0 && (
                      <li className="text-sm text-emerald-800">
                        {comparison.changes.fixesChanges.biasFixesDelta > 0 ? '+' : ''}
                        {comparison.changes.fixesChanges.biasFixesDelta} bias fixes
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setComparison(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewVersion && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewVersion(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {getVersionLabel(previewVersion)} Preview
              </h3>
              <button
                onClick={() => setPreviewVersion(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Preview Content */}
            <div className="space-y-6">
              {/* Contact */}
              <div>
                <h4 className="font-bold text-2xl text-gray-900 mb-1">
                  {previewVersion.content.contact.name}
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{previewVersion.content.contact.email}</p>
                  <p>{previewVersion.content.contact.phone}</p>
                  {previewVersion.content.contact.location && (
                    <p>{previewVersion.content.contact.location}</p>
                  )}
                </div>
              </div>

              {/* Summary */}
              {previewVersion.content.summary && (
                <div>
                  <h5 className="font-bold text-lg text-gray-900 mb-2">Summary</h5>
                  <p className="text-sm text-gray-700">{previewVersion.content.summary}</p>
                </div>
              )}

              {/* Experience */}
              {previewVersion.content.experience.length > 0 && (
                <div>
                  <h5 className="font-bold text-lg text-gray-900 mb-3">Experience</h5>
                  <div className="space-y-4">
                    {previewVersion.content.experience.map((exp, idx) => (
                      <div key={idx}>
                        <h6 className="font-semibold text-gray-900">{exp.title}</h6>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <ul className="mt-2 space-y-1">
                          {exp.bullets.map((bullet, bidx) => (
                            <li key={bidx} className="text-sm text-gray-700 flex gap-2">
                              <span>•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div>
                <h5 className="font-bold text-lg text-gray-900 mb-2">Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {previewVersion.content.skills.technical.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreviewVersion(null)}
              className="mt-6 w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
