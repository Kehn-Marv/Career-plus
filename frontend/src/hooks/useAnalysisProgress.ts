/**
 * Hook for tracking analysis progress
 * Provides easy access to progress state and capabilities
 */

import { useAnalysisStore } from '@/store/analysis-store'
import type { AnalysisProgress, AnalysisCapabilities } from '@/lib/ai/enhanced-types'

export interface UseAnalysisProgressReturn {
  progress: AnalysisProgress
  capabilities: AnalysisCapabilities
  isAnalyzing: boolean
  isComplete: boolean
  hasAIFeatures: boolean
  hasDegradedFeatures: boolean
}

/**
 * Hook to access analysis progress and capabilities
 */
export function useAnalysisProgress(): UseAnalysisProgressReturn {
  const { analysisProgress, analysisCapabilities, isAnalyzing } = useAnalysisStore()

  // Convert store progress to AnalysisProgress type
  const progress: AnalysisProgress = {
    stage: analysisProgress.step === 'idle' ? 'parsing' :
           analysisProgress.step === 'embedding' ? 'keyword' :
           analysisProgress.step === 'scoring' ? 'semantic' :
           analysisProgress.step === 'recommendations' ? 'ai-enhancement' :
           analysisProgress.step as any,
    percentage: analysisProgress.percentage,
    message: analysisProgress.message,
    estimatedTimeRemaining: analysisProgress.estimatedTimeRemaining
  }

  const isComplete = analysisProgress.step === 'complete'

  // Check if AI features are active
  const hasAIFeatures = 
    analysisCapabilities.semanticAnalysis === 'ai' ||
    analysisCapabilities.bulletQuality === 'ai'

  // Check if any features are degraded
  const hasDegradedFeatures =
    analysisCapabilities.keywordMatching === 'basic' ||
    analysisCapabilities.semanticAnalysis !== 'ai' ||
    analysisCapabilities.bulletQuality !== 'ai' ||
    analysisCapabilities.formatAnalysis === 'basic' ||
    analysisCapabilities.atsSimulation === 'basic'

  return {
    progress,
    capabilities: analysisCapabilities,
    isAnalyzing,
    isComplete,
    hasAIFeatures,
    hasDegradedFeatures
  }
}
