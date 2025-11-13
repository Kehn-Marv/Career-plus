/**
 * Enhanced Analysis Progress Component
 * Displays detailed progress with stage information, estimated time, and feature status
 */

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import type { AnalysisProgress, AnalysisCapabilities } from '@/lib/ai/enhanced-types'

export interface AnalysisProgressProps {
  progress: AnalysisProgress
  capabilities: AnalysisCapabilities
  show: boolean
  isDetectingCapabilities?: boolean
}

interface StageInfo {
  label: string
  description: string
  icon: React.ReactNode
}

const STAGE_INFO: Record<AnalysisProgress['stage'], StageInfo> = {
  parsing: {
    label: 'Parsing Documents',
    description: 'Extracting text and structure from your files',
    icon: <Loader2 className="h-5 w-5 animate-spin" />
  },
  keyword: {
    label: 'Keyword Analysis',
    description: 'Matching skills and requirements with enhanced algorithms',
    icon: <Loader2 className="h-5 w-5 animate-spin" />
  },
  semantic: {
    label: 'Semantic Analysis',
    description: 'Understanding context and meaning with AI',
    icon: <Loader2 className="h-5 w-5 animate-spin" />
  },
  format: {
    label: 'Format Analysis',
    description: 'Evaluating structure, bullets, and visual quality',
    icon: <Loader2 className="h-5 w-5 animate-spin" />
  },
  ats: {
    label: 'ATS Simulation',
    description: 'Testing compatibility with applicant tracking systems',
    icon: <Loader2 className="h-5 w-5 animate-spin" />
  },
  'ai-enhancement': {
    label: 'AI Enhancement',
    description: 'Generating intelligent insights and recommendations',
    icon: <Loader2 className="h-5 w-5 animate-spin" />
  },
  complete: {
    label: 'Complete',
    description: 'Analysis finished successfully',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function getFeatureStatus(capabilities: AnalysisCapabilities): {
  active: string[]
  degraded: string[]
} {
  const active: string[] = []
  const degraded: string[] = []

  // Keyword matching
  if (capabilities.keywordMatching === 'enhanced') {
    active.push('Enhanced Keyword Matching')
  } else {
    degraded.push('Basic Keyword Matching')
  }

  // Semantic analysis
  if (capabilities.semanticAnalysis === 'ai') {
    active.push('AI Semantic Analysis')
  } else if (capabilities.semanticAnalysis === 'embedding') {
    degraded.push('Embedding-based Analysis')
  } else {
    degraded.push('Keyword-only Analysis')
  }

  // Bullet quality
  if (capabilities.bulletQuality === 'ai') {
    active.push('AI Bullet Quality Scoring')
  } else {
    degraded.push('Rule-based Bullet Scoring')
  }

  // Format analysis
  if (capabilities.formatAnalysis === 'comprehensive') {
    active.push('Comprehensive Format Analysis')
  } else {
    degraded.push('Basic Format Analysis')
  }

  // ATS simulation
  if (capabilities.atsSimulation === 'full') {
    active.push('Full ATS Simulation')
  } else {
    degraded.push('Basic ATS Check')
  }

  // Industry rules
  if (capabilities.industryRules) {
    active.push('Industry-Specific Rules')
  }

  // Adaptive thresholds
  if (capabilities.adaptiveThresholds) {
    active.push('Adaptive Scoring')
  }

  return { active, degraded }
}

export default function AnalysisProgress({
  progress,
  capabilities,
  show,
  isDetectingCapabilities = false
}: AnalysisProgressProps) {
  const [featureStatus, setFeatureStatus] = useState<{
    active: string[]
    degraded: string[]
  }>({ active: [], degraded: [] })

  useEffect(() => {
    setFeatureStatus(getFeatureStatus(capabilities))
  }, [capabilities])

  if (!show) return null

  const stageInfo = STAGE_INFO[progress.stage]
  const isComplete = progress.stage === 'complete'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="transition-transform duration-300">
              {stageInfo.icon}
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              {isComplete ? 'Analysis Complete!' : 'Analyzing Your Resume'}
            </h3>
          </div>
          <p className="text-emerald-50 text-sm leading-relaxed">
            {stageInfo.description}
          </p>
        </div>

        {/* Capability Detection Loading State */}
        {isDetectingCapabilities && (
          <div className="px-6 py-3 bg-blue-50 border-l-4 border-blue-400">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                Detecting AI capabilities...
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {stageInfo.label}
            </span>
            <span className="text-sm font-bold text-emerald-600">
              {progress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-600 h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Estimated Time Remaining */}
        {!isComplete && progress.estimatedTimeRemaining > 0 && (
          <div className="px-6 pt-4 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">
                Estimated time remaining: <span className="text-gray-700">{formatTime(progress.estimatedTimeRemaining)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Current Message */}
        {progress.message && (
          <div className="px-6 pt-3 transition-opacity duration-300">
            <p className="text-sm text-gray-600 italic leading-relaxed">
              {progress.message}
            </p>
          </div>
        )}

        {/* Feature Status */}
        <div className="px-6 py-6 border-t border-gray-100 mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 tracking-tight">
            Analysis Features
          </h4>
          
          {/* Active Features */}
          {featureStatus.active.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                  Active Features
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {featureStatus.active.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md border border-emerald-200 transition-all duration-200 hover:bg-emerald-100"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Degraded Features - Only show when AI features are unavailable */}
          {featureStatus.degraded.length > 0 && (
            <div className="transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Fallback Mode
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {featureStatus.degraded.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-md border border-amber-200 transition-all duration-200 hover:bg-amber-100"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Some AI features are unavailable. Using rule-based analysis as fallback.
              </p>
            </div>
          )}
        </div>

        {/* Stage Progress Indicators */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {Object.entries(STAGE_INFO).map(([stage, info], index) => {
              const stages = Object.keys(STAGE_INFO)
              const currentIndex = stages.indexOf(progress.stage)
              const stageIndex = stages.indexOf(stage)
              const isCompleted = stageIndex < currentIndex
              const isCurrent = stage === progress.stage
              const isLast = index === stages.length - 1

              return (
                <div key={stage} className="flex items-center flex-1">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      transition-all duration-300 shadow-sm
                      ${isCompleted
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : isCurrent
                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-600 animate-pulse shadow-emerald-100'
                        : 'bg-gray-200 text-gray-400'
                      }
                    `}
                    title={info.label}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`
                        flex-1 h-1 mx-1 rounded-full
                        transition-all duration-500 ease-out
                        ${isCompleted ? 'bg-emerald-600' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
