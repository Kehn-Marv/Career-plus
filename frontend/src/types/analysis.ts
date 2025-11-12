/**
 * Enhanced Analysis Type Definitions
 * Comprehensive types for the enhanced analysis dashboard
 */

import type { DimensionScores } from '../lib/analysis/dimension-calculator'
import type { ATSIssue } from '../lib/analysis/ats-analyzer'
import type { GapAnalysis } from '../lib/analysis/gap-detector'
import type { StrengthAnalysis } from '../lib/analysis/strength-analyzer'

/**
 * Recommendation types
 */
export type RecommendationCategory = 'keyword' | 'format' | 'content' | 'bias' | 'localization'
export type RecommendationPriority = 'high' | 'medium' | 'low'

export interface Recommendation {
  id: string
  type: RecommendationCategory
  priority: RecommendationPriority
  title: string
  description: string
  actions: string[]  // Step-by-step actions
  suggestedText?: string
  explanation: string
  impact: number  // Estimated score increase (0-100)
  actionable: boolean  // Can be auto-applied
  applied: boolean
  appliedAt?: Date
}

/**
 * Analysis scores
 */
export interface AnalysisScores {
  total: number
  semantic: number
  keyword: number
  format: number
  ats: number
}

/**
 * Analysis insights
 */
export interface AnalysisInsights {
  strengths: string[]
  gaps: string[]
  recommendations: Recommendation[]
}

/**
 * Complete analysis result
 */
export interface Analysis {
  id?: number
  resumeId: number
  jobDescriptionId: number
  scores: AnalysisScores
  dimensions: DimensionScores
  atsIssues: ATSIssue[]
  insights: AnalysisInsights
  gapAnalysis: GapAnalysis
  strengthAnalysis: StrengthAnalysis
  appliedRecommendations: string[]  // IDs of applied recommendations
  createdAt: Date
  updatedAt: Date
}

/**
 * Analysis comparison data
 */
export interface AnalysisComparison {
  analyses: Analysis[]
  scoreTrends: {
    dates: string[]
    totalScores: number[]
    semanticScores: number[]
    keywordScores: number[]
    formatScores: number[]
    atsScores: number[]
  }
  recommendationDiff: {
    added: Recommendation[]
    removed: Recommendation[]
    unchanged: Recommendation[]
  }
}

/**
 * AutoFix result
 */
export interface BulletRewriteResult {
  id: string
  original: string
  rewritten: string
  changes: string[]
  experienceIndex: number
  bulletIndex: number
  success: boolean
  error?: string
}

/**
 * Chat message
 */
export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  analysisId?: number
}

/**
 * Resume template
 */
export interface ResumeTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  atsScore: number  // How ATS-friendly (0-100)
  style: 'modern' | 'classic' | 'minimal' | 'creative' | 'executive'
  colors: {
    primary: string
    secondary: string
    text: string
    background: string
  }
}

/**
 * Export options
 */
export interface ExportOptions {
  template: ResumeTemplate
  fileName: string
  includePhoto: boolean
  colorScheme: 'color' | 'grayscale'
}
