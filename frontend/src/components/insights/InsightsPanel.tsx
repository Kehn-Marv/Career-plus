/**
 * InsightsPanel Component
 * Displays strengths, gaps, and competitive position analysis
 */

import {
  TrendingUp,
  Award,
  AlertTriangle,
  Target,
  Star,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react'
import type { GapAnalysis } from '../../lib/analysis/gap-detector'
import type { StrengthAnalysis } from '../../lib/analysis/strength-analyzer'

export interface InsightsPanelProps {
  gapAnalysis: GapAnalysis
  strengthAnalysis: StrengthAnalysis
}

export function InsightsPanel({ gapAnalysis, strengthAnalysis }: InsightsPanelProps) {
  const { strengths, topApplicantScore, competitivePosition, standoutFactors } = strengthAnalysis
  const { missingSkills, experienceGaps, qualificationGaps, overallGapScore } = gapAnalysis

  const getPositionColor = (position: typeof competitivePosition): string => {
    switch (position) {
      case 'top-tier':
        return 'text-green-700 bg-green-100 border-green-300'
      case 'strong':
        return 'text-blue-700 bg-blue-100 border-blue-300'
      case 'competitive':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'needs-improvement':
        return 'text-orange-700 bg-orange-100 border-orange-300'
    }
  }

  const getPositionLabel = (position: typeof competitivePosition): string => {
    switch (position) {
      case 'top-tier':
        return 'Top-Tier Candidate'
      case 'strong':
        return 'Strong Candidate'
      case 'competitive':
        return 'Competitive Candidate'
      case 'needs-improvement':
        return 'Needs Improvement'
    }
  }

  const getPositionDescription = (position: typeof competitivePosition): string => {
    switch (position) {
      case 'top-tier':
        return 'You are exceptionally well-qualified for this role with multiple competitive advantages.'
      case 'strong':
        return 'You have strong qualifications that make you a compelling candidate for this role.'
      case 'competitive':
        return 'You meet the basic requirements but could strengthen your application in key areas.'
      case 'needs-improvement':
        return 'Significant gaps exist that may reduce your competitiveness for this role.'
    }
  }

  return (
    <div className="space-y-6">
      {/* Competitive Position Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Competitive Position
        </h2>

        <div className={`rounded-lg p-4 border-2 mb-4 ${getPositionColor(competitivePosition)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">
                  {getPositionLabel(competitivePosition)}
                </h3>
                <p className="text-sm opacity-90">
                  {getPositionDescription(competitivePosition)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {topApplicantScore}
              </div>
              <div className="text-xs opacity-75">
                out of 100
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Likelihood of Being Top Applicant</span>
            <span>{topApplicantScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                topApplicantScore >= 80
                  ? 'bg-green-500'
                  : topApplicantScore >= 65
                  ? 'bg-blue-500'
                  : topApplicantScore >= 50
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${topApplicantScore}%` }}
            />
          </div>
        </div>

        {/* Standout Factors */}
        {standoutFactors.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600" />
              What Makes You Stand Out
            </h4>
            <ul className="space-y-1">
              {standoutFactors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Strengths Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Your Strengths
          </h2>
          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            {strengths.length} Identified
          </span>
        </div>

        {strengths.length > 0 ? (
          <div className="space-y-3">
            {strengths.map((strength) => (
              <div
                key={strength.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    strength.competitiveAdvantage === 'high'
                      ? 'bg-green-100 text-green-600'
                      : strength.competitiveAdvantage === 'medium'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-800">
                        {strength.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        strength.competitiveAdvantage === 'high'
                          ? 'bg-green-100 text-green-700'
                          : strength.competitiveAdvantage === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {strength.competitiveAdvantage.charAt(0).toUpperCase() + 
                         strength.competitiveAdvantage.slice(1)} Advantage
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {strength.description}
                    </p>
                    {strength.evidence.length > 0 && (
                      <div className="bg-gray-50 rounded p-2 border border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">Evidence:</p>
                        <ul className="space-y-1">
                          {strength.evidence.slice(0, 2).map((evidence, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-blue-600">•</span>
                              <span className="line-clamp-1">{evidence}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No significant strengths identified yet</p>
          </div>
        )}
      </div>

      {/* Gaps Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-600" />
            Areas for Improvement
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Gap Score:</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              overallGapScore >= 80
                ? 'bg-green-100 text-green-700'
                : overallGapScore >= 60
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {overallGapScore}/100
            </span>
          </div>
        </div>

        {/* Gap Progress Bars */}
        <div className="space-y-4 mb-6">
          {/* Skills Gap */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">Skills Coverage</span>
              <span className="text-gray-600">
                {missingSkills.length} missing
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  missingSkills.length === 0
                    ? 'bg-green-500'
                    : missingSkills.length <= 3
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.max(20, 100 - missingSkills.length * 10)}%`
                }}
              />
            </div>
          </div>

          {/* Experience Gap */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">Experience Match</span>
              <span className="text-gray-600">
                {experienceGaps.length} gap{experienceGaps.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  experienceGaps.length === 0
                    ? 'bg-green-500'
                    : experienceGaps.length === 1
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.max(20, 100 - experienceGaps.length * 25)}%`
                }}
              />
            </div>
          </div>

          {/* Qualifications Gap */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">Qualifications</span>
              <span className="text-gray-600">
                {qualificationGaps.length} missing
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  qualificationGaps.length === 0
                    ? 'bg-green-500'
                    : qualificationGaps.length === 1
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.max(20, 100 - qualificationGaps.length * 30)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Gap Details */}
        {(missingSkills.length > 0 || experienceGaps.length > 0 || qualificationGaps.length > 0) ? (
          <div className="space-y-4">
            {/* Missing Skills */}
            {missingSkills.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Missing Skills ({missingSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.slice(0, 10).map((skill, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full ${
                        skill.importance === 'critical'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : skill.importance === 'important'
                          ? 'bg-orange-100 text-orange-700 border border-orange-300'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}
                    >
                      {skill.skill}
                    </span>
                  ))}
                  {missingSkills.length > 10 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{missingSkills.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Experience Gaps */}
            {experienceGaps.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-yellow-600" />
                  Experience Gaps
                </h4>
                <ul className="space-y-2">
                  {experienceGaps.map((gap, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">{gap.type}:</span> {gap.gap}
                        <div className="text-xs text-gray-600 mt-0.5">
                          Required: {gap.required} | Current: {gap.current}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualification Gaps */}
            {qualificationGaps.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-blue-600" />
                  Qualification Gaps
                </h4>
                <ul className="space-y-2">
                  {qualificationGaps.map((gap, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">{gap.type}:</span> {gap.required}
                        {gap.hasEquivalent && gap.equivalent && (
                          <div className="text-xs text-green-600 mt-0.5">
                            ✓ You have equivalent: {gap.equivalent}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-800 font-medium">No significant gaps identified!</p>
            <p className="text-sm text-green-600 mt-1">
              You meet all the key requirements for this role
            </p>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Recommended Next Steps
        </h3>
        <ul className="space-y-2">
          {missingSkills.filter(s => s.importance === 'critical').length > 0 && (
            <li className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>
                Address critical skill gaps by adding relevant experience or projects to your resume
              </span>
            </li>
          )}
          {experienceGaps.length > 0 && (
            <li className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-600 font-bold">
                {missingSkills.filter(s => s.importance === 'critical').length > 0 ? '2' : '1'}.
              </span>
              <span>
                Highlight transferable experience that demonstrates similar capabilities
              </span>
            </li>
          )}
          <li className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-blue-600 font-bold">
              {(missingSkills.filter(s => s.importance === 'critical').length > 0 ? 1 : 0) +
               (experienceGaps.length > 0 ? 1 : 0) + 1}.
            </span>
            <span>
              Use the Auto-Fix feature to optimize your resume bullets for maximum impact
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
