/**
 * RecommendationList Component
 * Displays prioritized recommendations with expand/collapse and apply actions
 */

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  Type,
  Shield,
  Globe,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import type { Recommendation, RecommendationCategory, RecommendationPriority } from '../../lib/recommendations/recommendation-engine'

export interface RecommendationListProps {
  recommendations: Recommendation[]
  onApply?: (recommendationId: string) => void
  appliedIds?: string[]
}

export function RecommendationList({
  recommendations,
  onApply,
  appliedIds = []
}: RecommendationListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'keyword':
        return <Type className="w-5 h-5" />
      case 'format':
        return <FileText className="w-5 h-5" />
      case 'content':
        return <FileText className="w-5 h-5" />
      case 'bias':
        return <Shield className="w-5 h-5" />
      case 'localization':
        return <Globe className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: RecommendationCategory): string => {
    switch (category) {
      case 'keyword':
        return 'text-purple-600 bg-purple-100'
      case 'format':
        return 'text-blue-600 bg-blue-100'
      case 'content':
        return 'text-green-600 bg-green-100'
      case 'bias':
        return 'text-orange-600 bg-orange-100'
      case 'localization':
        return 'text-indigo-600 bg-indigo-100'
    }
  }

  const getPriorityColor = (priority: RecommendationPriority): string => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-100 border-red-300'
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'low':
        return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getPriorityLabel = (priority: RecommendationPriority): string => {
    switch (priority) {
      case 'high':
        return 'High Priority'
      case 'medium':
        return 'Medium Priority'
      case 'low':
        return 'Low Priority'
    }
  }

  // Group by priority
  const highPriority = recommendations.filter(r => r.priority === 'high')
  const mediumPriority = recommendations.filter(r => r.priority === 'medium')
  const lowPriority = recommendations.filter(r => r.priority === 'low')

  const totalImpact = recommendations.reduce((sum, r) => sum + r.impact, 0)

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Great Job!
        </h3>
        <p className="text-gray-600">
          Your resume looks excellent. No recommendations at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Recommendations
        </h2>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            {recommendations.length} suggestions to improve your resume
          </p>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">
              +{totalImpact} potential score increase
            </span>
          </div>
        </div>
      </div>

      {/* High Priority */}
      {highPriority.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            High Priority ({highPriority.length})
          </h3>
          <div className="space-y-3">
            {highPriority.map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isExpanded={expandedIds.has(rec.id)}
                isApplied={appliedIds.includes(rec.id)}
                onToggle={() => toggleExpand(rec.id)}
                onApply={onApply}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
                getPriorityColor={getPriorityColor}
                getPriorityLabel={getPriorityLabel}
              />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority */}
      {mediumPriority.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            Medium Priority ({mediumPriority.length})
          </h3>
          <div className="space-y-3">
            {mediumPriority.map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isExpanded={expandedIds.has(rec.id)}
                isApplied={appliedIds.includes(rec.id)}
                onToggle={() => toggleExpand(rec.id)}
                onApply={onApply}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
                getPriorityColor={getPriorityColor}
                getPriorityLabel={getPriorityLabel}
              />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority */}
      {lowPriority.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-600" />
            Low Priority ({lowPriority.length})
          </h3>
          <div className="space-y-3">
            {lowPriority.map(rec => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isExpanded={expandedIds.has(rec.id)}
                isApplied={appliedIds.includes(rec.id)}
                onToggle={() => toggleExpand(rec.id)}
                onApply={onApply}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
                getPriorityColor={getPriorityColor}
                getPriorityLabel={getPriorityLabel}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: Recommendation
  isExpanded: boolean
  isApplied: boolean
  onToggle: () => void
  onApply?: (id: string) => void
  getCategoryIcon: (category: RecommendationCategory) => JSX.Element
  getCategoryColor: (category: RecommendationCategory) => string
  getPriorityColor: (priority: RecommendationPriority) => string
  getPriorityLabel: (priority: RecommendationPriority) => string
}

function RecommendationCard({
  recommendation,
  isExpanded,
  isApplied,
  onToggle,
  onApply,
  getCategoryIcon,
  getCategoryColor,
  getPriorityColor,
  getPriorityLabel
}: RecommendationCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          {/* Category Icon */}
          <div className={`p-2 rounded-lg ${getCategoryColor(recommendation.category)}`}>
            {getCategoryIcon(recommendation.category)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-gray-800">
                {recommendation.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Impact Badge */}
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  +{recommendation.impact}
                </span>
                {/* Expand Icon */}
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              {recommendation.description}
            </p>

            {/* Priority Badge */}
            <span className={`inline-block text-xs px-2 py-1 rounded-full border font-medium ${getPriorityColor(recommendation.priority)}`}>
              {getPriorityLabel(recommendation.priority)}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">
            Action Steps:
          </h5>
          <ul className="space-y-2 mb-4">
            {recommendation.actions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>

          {/* Apply Button */}
          {recommendation.actionable && onApply && (
            <button
              onClick={() => onApply(recommendation.id)}
              disabled={isApplied}
              className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                isApplied
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isApplied ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Applied
                </span>
              ) : (
                'Apply Recommendation'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
