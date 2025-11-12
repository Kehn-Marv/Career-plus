/**
 * ScoreCard Component
 * Displays overall match score with breakdown and visual indicators
 * Enhanced with AI-powered insights
 */

import { useEffect, useState } from 'react'
import type { 
  EnhancedKeywordAnalysis, 
  BulletQualityAnalysis,
  IndustryAnalysis,
  SeniorityAnalysis,
  ATSParseResult 
} from '@/lib/ai/enhanced-types'

export interface ScoreBreakdown {
  semantic: number
  keyword: number
  format: number
}

export interface ScoreCardProps {
  overallScore: number
  breakdown: ScoreBreakdown
  animate?: boolean
  // Enhanced analysis data (optional)
  enhancedKeywordAnalysis?: EnhancedKeywordAnalysis
  bulletQualityAnalysis?: BulletQualityAnalysis
  industryAnalysis?: IndustryAnalysis
  seniorityAnalysis?: SeniorityAnalysis
  atsResult?: ATSParseResult
}

export function ScoreCard({ 
  overallScore, 
  breakdown, 
  animate = true,
  enhancedKeywordAnalysis,
  bulletQualityAnalysis,
  industryAnalysis,
  seniorityAnalysis,
  atsResult
}: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : overallScore)
  const [isAnimating, setIsAnimating] = useState(animate)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Animate score reveal
  useEffect(() => {
    if (!animate) return

    setIsAnimating(true)
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const increment = overallScore / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= overallScore) {
        setDisplayScore(overallScore)
        setIsAnimating(false)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [overallScore, animate])

  // Determine color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreColorBg = (score: number): string => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Needs Improvement'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Match Score</h2>

      <div className="flex flex-col items-center mb-8">
        {/* Progress Ring */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : overallScore >= 40 ? '#f97316' : '#ef4444'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 85}`}
              strokeDashoffset={`${2 * Math.PI * 85 * (1 - displayScore / 100)}`}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          
          {/* Score text in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl sm:text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(displayScore)}
            </span>
            <span className="text-gray-500 text-xs sm:text-sm mt-1">out of 100</span>
          </div>
        </div>

        {/* Score label */}
        <div className={`px-4 py-2 rounded-full ${getScoreColorBg(overallScore)}`}>
          <span className={`font-semibold ${getScoreColor(overallScore)}`}>
            {getScoreLabel(overallScore)}
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Score Breakdown
        </h3>

        {/* Semantic Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Semantic Match</span>
            <span className="text-sm font-semibold text-gray-800">
              {Math.round(breakdown.semantic)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${isAnimating ? 0 : breakdown.semantic}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            How well your experience aligns with job requirements
          </p>
        </div>

        {/* Keyword Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Keyword Match</span>
            <span className="text-sm font-semibold text-gray-800">
              {Math.round(breakdown.keyword)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${isAnimating ? 0 : breakdown.keyword}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Percentage of important keywords from job description
          </p>
        </div>

        {/* Format Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Format Quality</span>
            <span className="text-sm font-semibold text-gray-800">
              {Math.round(breakdown.format)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${isAnimating ? 0 : breakdown.format}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            ATS-friendly formatting and structure
          </p>
        </div>
      </div>

      {/* Weight info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Overall score: Semantic (50%) + Keyword (30%) + Format (20%)
        </p>
      </div>

      {/* Enhanced Keyword Analysis */}
      {enhancedKeywordAnalysis && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'keywords' ? null : 'keywords')}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Enhanced Keyword Matching
              </h3>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'keywords' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'keywords' && (
            <div className="mt-4 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Exact Matches</p>
                  <p className="text-2xl font-bold text-blue-700">{enhancedKeywordAnalysis.exactMatches}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium mb-1">Stemmed</p>
                  <p className="text-2xl font-bold text-purple-700">{enhancedKeywordAnalysis.stemmedMatches}</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                  <p className="text-xs text-pink-600 font-medium mb-1">Synonyms</p>
                  <p className="text-2xl font-bold text-pink-700">{enhancedKeywordAnalysis.synonymMatches}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Phrases</p>
                  <p className="text-2xl font-bold text-emerald-700">{enhancedKeywordAnalysis.phraseMatchCount}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Match rate: <strong>{Math.round(enhancedKeywordAnalysis.matchRate * 100)}%</strong> of required keywords found
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bullet Quality Analysis */}
      {bulletQualityAnalysis && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'bullets' ? null : 'bullets')}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Bullet Point Quality
              </h3>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'bullets' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'bullets' && (
            <div className="mt-4 space-y-3 animate-fadeIn">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Quality Score</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {Math.round(bulletQualityAnalysis.averageScore)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${bulletQualityAnalysis.averageScore}%` }}
                  />
                </div>
              </div>
              
              {bulletQualityAnalysis.topBullets.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-semibold text-green-700 mb-2">✓ Top Performing Bullets</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {bulletQualityAnalysis.topBullets.slice(0, 2).map((bullet, idx) => (
                      <li key={idx} className="truncate">{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {bulletQualityAnalysis.weakBullets.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-xs font-semibold text-orange-700 mb-2">⚠ Needs Improvement</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {bulletQualityAnalysis.weakBullets.slice(0, 2).map((bullet, idx) => (
                      <li key={idx} className="truncate">{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Industry Analysis */}
      {industryAnalysis && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'industry' ? null : 'industry')}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Industry Insights
              </h3>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'industry' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'industry' && (
            <div className="mt-4 space-y-3 animate-fadeIn">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Detected Industry</span>
                  <span className="text-sm font-bold text-blue-700 capitalize">
                    {industryAnalysis.detectedIndustry}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Industry Score</span>
                  <span className="text-lg font-bold text-blue-600">
                    {Math.round(industryAnalysis.industryScore)}
                  </span>
                </div>
              </div>
              
              {industryAnalysis.industryRecommendations.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <p className="text-xs font-semibold text-indigo-700 mb-2">Industry-Specific Tips</p>
                  <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    {industryAnalysis.industryRecommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Seniority Analysis */}
      {seniorityAnalysis && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'seniority' ? null : 'seniority')}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Seniority Alignment
              </h3>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'seniority' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'seniority' && (
            <div className="mt-4 space-y-3 animate-fadeIn">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Target Level</span>
                  <span className="text-sm font-bold text-indigo-700 capitalize">
                    {seniorityAnalysis.detectedSeniority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Alignment Score</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {Math.round(seniorityAnalysis.alignmentScore)}
                  </span>
                </div>
              </div>
              
              {seniorityAnalysis.seniorityRecommendations.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 mb-2">Level-Specific Advice</p>
                  <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    {seniorityAnalysis.seniorityRecommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ATS Simulation Results */}
      {atsResult && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setExpandedSection(expandedSection === 'ats' ? null : 'ats')}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                ATS Compatibility
              </h3>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'ats' ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'ats' && (
            <div className="mt-4 space-y-3 animate-fadeIn">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Compatibility Score</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {Math.round(atsResult.compatibility)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    {atsResult.parsedSections.contact ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                    <span className="text-gray-700">Contact Info</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {atsResult.parsedSections.experience ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                    <span className="text-gray-700">Experience</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {atsResult.parsedSections.education ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                    <span className="text-gray-700">Education</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {atsResult.parsedSections.skills ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                    <span className="text-gray-700">Skills</span>
                  </div>
                </div>
              </div>
              
              {atsResult.issues.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-xs font-semibold text-red-700 mb-2">
                    {atsResult.issues.filter(i => i.severity === 'critical').length} Critical Issues
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {atsResult.issues.slice(0, 3).map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className={issue.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}>•</span>
                        <span className="flex-1">{issue.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
