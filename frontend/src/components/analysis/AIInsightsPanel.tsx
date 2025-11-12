/**
 * AI Insights Panel Component
 * Displays AI-powered insights with expandable sections and confidence scores
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Info } from 'lucide-react'
import type { SemanticMatch, AIInsights } from '@/lib/ai/enhanced-types'

interface AIInsightsPanelProps {
  semanticMatches?: SemanticMatch[]
  aiInsights?: AIInsights
  showConfidenceScores?: boolean
}

interface ExpandableSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  badge?: string
  badgeColor?: string
}

function ExpandableSection({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false,
  badge,
  badgeColor = 'bg-blue-100 text-blue-700'
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-emerald-600">
            {icon}
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-white animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  )
}

interface ConfidenceBarProps {
  confidence: number
  label?: string
}

function ConfidenceBar({ confidence, label = 'Confidence' }: ConfidenceBarProps) {
  const getColor = (conf: number) => {
    if (conf >= 80) return 'bg-emerald-500'
    if (conf >= 60) return 'bg-blue-500'
    if (conf >= 40) return 'bg-yellow-500'
    return 'bg-orange-500'
  }
  
  const getTextColor = (conf: number) => {
    if (conf >= 80) return 'text-emerald-700'
    if (conf >= 60) return 'text-blue-700'
    if (conf >= 40) return 'text-yellow-700'
    return 'text-orange-700'
  }
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className={`font-semibold ${getTextColor(confidence)}`}>
          {Math.round(confidence)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`${getColor(confidence)} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  )
}

export function AIInsightsPanel({ 
  semanticMatches = [], 
  aiInsights,
  showConfidenceScores = true 
}: AIInsightsPanelProps) {
  if (!semanticMatches.length && !aiInsights) {
    return null
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI-Powered Insights</h2>
          <p className="text-sm text-gray-600">Deep analysis powered by artificial intelligence</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Semantic Matches */}
        {semanticMatches.length > 0 && (
          <ExpandableSection
            title="Semantic Match Analysis"
            icon={<TrendingUp className="h-5 w-5" />}
            badge={`${semanticMatches.length} matches`}
            defaultExpanded={true}
          >
            <div className="space-y-4">
              {semanticMatches.slice(0, 5).map((match, idx) => (
                <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Match Score: {Math.round(match.matchScore)}
                      </p>
                      {showConfidenceScores && (
                        <ConfidenceBar confidence={match.confidence} />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-blue-700 mb-1">Your Experience:</p>
                      <p className="text-sm text-gray-700 bg-white rounded p-2 border border-blue-100">
                        {match.resumeSection}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-indigo-700 mb-1">Job Requirement:</p>
                      <p className="text-sm text-gray-700 bg-white rounded p-2 border border-indigo-100">
                        {match.jdRequirement}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 mb-1">Why this matters:</p>
                          <p className="text-xs text-gray-700">{match.explanation}</p>
                        </div>
                      </div>
                    </div>
                    
                    {match.implicitSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-purple-700 mb-2">Implicit Skills Detected:</p>
                        <div className="flex flex-wrap gap-1">
                          {match.implicitSkills.map((skill, skillIdx) => (
                            <span
                              key={skillIdx}
                              className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {semanticMatches.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  Showing top 5 of {semanticMatches.length} semantic matches
                </p>
              )}
            </div>
          </ExpandableSection>
        )}
        
        {/* AI Insights - Strengths */}
        {aiInsights?.strengths && aiInsights.strengths.length > 0 && (
          <ExpandableSection
            title="Your Strengths"
            icon={<TrendingUp className="h-5 w-5" />}
            badge={`${aiInsights.strengths.length} identified`}
            badgeColor="bg-green-100 text-green-700"
          >
            <div className="space-y-2">
              {aiInsights.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-700 font-bold text-xs">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{strength}</p>
                </div>
              ))}
            </div>
          </ExpandableSection>
        )}
        
        {/* AI Insights - Gaps */}
        {aiInsights?.gaps && aiInsights.gaps.length > 0 && (
          <ExpandableSection
            title="Areas for Improvement"
            icon={<AlertTriangle className="h-5 w-5" />}
            badge={`${aiInsights.gaps.length} identified`}
            badgeColor="bg-orange-100 text-orange-700"
          >
            <div className="space-y-2">
              {aiInsights.gaps.map((gap, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 flex-1">{gap}</p>
                </div>
              ))}
            </div>
          </ExpandableSection>
        )}
        
        {/* AI Insights - Implicit Skills */}
        {aiInsights?.implicitSkills && aiInsights.implicitSkills.length > 0 && (
          <ExpandableSection
            title="Hidden Skills Detected"
            icon={<Sparkles className="h-5 w-5" />}
            badge={`${aiInsights.implicitSkills.length} skills`}
            badgeColor="bg-purple-100 text-purple-700"
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                AI detected these skills from your experience descriptions, even though they weren't explicitly listed:
              </p>
              <div className="flex flex-wrap gap-2">
                {aiInsights.implicitSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 text-sm rounded-lg border border-purple-200 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-purple-900">
                    <strong>Tip:</strong> Consider adding these skills to your skills section to make them more visible to recruiters and ATS systems.
                  </p>
                </div>
              </div>
            </div>
          </ExpandableSection>
        )}
        
        {/* AI Insights - Career Advice */}
        {aiInsights?.careerAdvice && aiInsights.careerAdvice.length > 0 && (
          <ExpandableSection
            title="Career Advice"
            icon={<Lightbulb className="h-5 w-5" />}
            badge={`${aiInsights.careerAdvice.length} tips`}
            badgeColor="bg-blue-100 text-blue-700"
          >
            <div className="space-y-2">
              {aiInsights.careerAdvice.map((advice, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 flex-1">{advice}</p>
                </div>
              ))}
            </div>
          </ExpandableSection>
        )}
      </div>
      
      {/* AI Disclaimer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          AI insights are generated using advanced language models. While highly accurate, 
          they should be reviewed in context with your specific situation.
        </p>
      </div>
    </div>
  )
}
