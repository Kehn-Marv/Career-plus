/**
 * Feature Status Indicator Component
 * Shows which analysis features are active or degraded
 * Enhanced with tooltips explaining feature status
 */

import { useState } from 'react'
import { CheckCircle2, AlertCircle, Info, HelpCircle } from 'lucide-react'
import type { AnalysisCapabilities } from '@/lib/ai/enhanced-types'

export interface FeatureStatusIndicatorProps {
  capabilities: AnalysisCapabilities
  compact?: boolean
  showDetails?: boolean
}

interface TooltipProps {
  content: string
  children: React.ReactNode
}

function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}

interface FeatureInfo {
  name: string
  status: 'active' | 'degraded' | 'disabled'
  description: string
  tooltip: string
}

function getFeatureList(capabilities: AnalysisCapabilities): FeatureInfo[] {
  const features: FeatureInfo[] = []

  // Keyword matching
  features.push({
    name: 'Keyword Matching',
    status: capabilities.keywordMatching === 'enhanced' ? 'active' : 'degraded',
    description: capabilities.keywordMatching === 'enhanced'
      ? 'Enhanced matching with stemming and synonyms'
      : 'Basic keyword matching',
    tooltip: capabilities.keywordMatching === 'enhanced'
      ? 'Using advanced algorithms to match word variations, synonyms, and multi-word phrases'
      : 'Using basic exact keyword matching only'
  })

  // Semantic analysis
  features.push({
    name: 'Semantic Analysis',
    status: capabilities.semanticAnalysis === 'ai' ? 'active' :
            capabilities.semanticAnalysis === 'embedding' ? 'degraded' : 'disabled',
    description: capabilities.semanticAnalysis === 'ai'
      ? 'AI-powered context understanding'
      : capabilities.semanticAnalysis === 'embedding'
      ? 'Embedding-based similarity'
      : 'Keyword-only analysis',
    tooltip: capabilities.semanticAnalysis === 'ai'
      ? 'Using AI to understand context and meaning beyond keywords'
      : capabilities.semanticAnalysis === 'embedding'
      ? 'Using embeddings for semantic similarity (AI unavailable)'
      : 'Fallback to keyword-only matching (AI and embeddings unavailable)'
  })

  // Bullet quality
  features.push({
    name: 'Bullet Quality Scoring',
    status: capabilities.bulletQuality === 'ai' ? 'active' : 'degraded',
    description: capabilities.bulletQuality === 'ai'
      ? 'AI-powered bullet evaluation'
      : 'Rule-based bullet scoring',
    tooltip: capabilities.bulletQuality === 'ai'
      ? 'Using AI to evaluate bullet specificity, relevance, and impact'
      : 'Using rule-based scoring (action verbs, metrics, outcomes)'
  })

  // Format analysis
  features.push({
    name: 'Format Analysis',
    status: capabilities.formatAnalysis === 'comprehensive' ? 'active' : 'degraded',
    description: capabilities.formatAnalysis === 'comprehensive'
      ? 'Comprehensive format checking'
      : 'Basic format validation',
    tooltip: capabilities.formatAnalysis === 'comprehensive'
      ? 'Analyzing dates, headers/footers, visual quality, and layout'
      : 'Basic format validation only'
  })

  // ATS simulation
  features.push({
    name: 'ATS Simulation',
    status: capabilities.atsSimulation === 'full' ? 'active' : 'degraded',
    description: capabilities.atsSimulation === 'full'
      ? 'Full ATS parser simulation'
      : 'Basic ATS compatibility check',
    tooltip: capabilities.atsSimulation === 'full'
      ? 'Simulating real ATS systems (Workday, Taleo, Greenhouse)'
      : 'Basic ATS compatibility checking only'
  })

  // Industry rules
  features.push({
    name: 'Industry Rules',
    status: capabilities.industryRules ? 'active' : 'disabled',
    description: capabilities.industryRules
      ? 'Industry-specific validation'
      : 'Generic validation only',
    tooltip: capabilities.industryRules
      ? 'Applying industry-specific rules and best practices'
      : 'Using generic validation rules for all industries'
  })

  // Adaptive thresholds
  features.push({
    name: 'Adaptive Scoring',
    status: capabilities.adaptiveThresholds ? 'active' : 'disabled',
    description: capabilities.adaptiveThresholds
      ? 'Seniority-adjusted scoring'
      : 'Standard scoring thresholds',
    tooltip: capabilities.adaptiveThresholds
      ? 'Adjusting expectations based on job seniority level'
      : 'Using standard scoring thresholds for all levels'
  })

  return features
}

export default function FeatureStatusIndicator({
  capabilities,
  compact = false,
  showDetails = true
}: FeatureStatusIndicatorProps) {
  const features = getFeatureList(capabilities)
  const activeCount = features.filter(f => f.status === 'active').length
  const degradedCount = features.filter(f => f.status === 'degraded').length
  const totalCount = features.length

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-gray-700">{activeCount}/{totalCount} features active</span>
        </div>
        {degradedCount > 0 && (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-gray-600">{degradedCount} degraded</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Analysis Features</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            {activeCount} Active
          </span>
          {degradedCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="h-3 w-3" />
              {degradedCount} Degraded
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="mt-0.5">
              {feature.status === 'active' && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
              {feature.status === 'degraded' && (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
              {feature.status === 'disabled' && (
                <Info className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {feature.name}
                </span>
                <span
                  className={`
                    px-1.5 py-0.5 text-xs rounded
                    ${feature.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : feature.status === 'degraded'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-50 text-gray-600'
                    }
                  `}
                >
                  {feature.status}
                </span>
                <Tooltip content={feature.tooltip}>
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                </Tooltip>
              </div>
              {showDetails && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {feature.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {degradedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Some features are running in fallback mode. This may occur when AI services are unavailable.
            Analysis will still complete with rule-based methods.
          </p>
        </div>
      )}
    </div>
  )
}
