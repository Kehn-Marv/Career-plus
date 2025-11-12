/**
 * AchievementRadar Component
 * Displays 6-dimensional radar chart comparing user's profile vs job requirements
 */

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

export interface DimensionScore {
  dimension: string
  userScore: number
  requiredScore: number
  fullMark: number
}

export interface AchievementRadarProps {
  dimensions: {
    technical: { user: number; required: number }
    softSkills: { user: number; required: number }
    experience: { user: number; required: number }
    education: { user: number; required: number }
    certifications: { user: number; required: number }
    domain: { user: number; required: number }
  }
}

export function AchievementRadar({ dimensions }: AchievementRadarProps) {
  // Transform data for recharts
  const data: DimensionScore[] = [
    {
      dimension: 'Technical Skills',
      userScore: dimensions.technical.user,
      requiredScore: dimensions.technical.required,
      fullMark: 100
    },
    {
      dimension: 'Soft Skills',
      userScore: dimensions.softSkills.user,
      requiredScore: dimensions.softSkills.required,
      fullMark: 100
    },
    {
      dimension: 'Experience',
      userScore: dimensions.experience.user,
      requiredScore: dimensions.experience.required,
      fullMark: 100
    },
    {
      dimension: 'Education',
      userScore: dimensions.education.user,
      requiredScore: dimensions.education.required,
      fullMark: 100
    },
    {
      dimension: 'Certifications',
      userScore: dimensions.certifications.user,
      requiredScore: dimensions.certifications.required,
      fullMark: 100
    },
    {
      dimension: 'Domain Knowledge',
      userScore: dimensions.domain.user,
      requiredScore: dimensions.domain.required,
      fullMark: 100
    }
  ]

  // Calculate overall match percentage
  const totalUserScore = data.reduce((sum, d) => sum + d.userScore, 0)
  const totalRequiredScore = data.reduce((sum, d) => sum + d.requiredScore, 0)
  const matchPercentage = totalRequiredScore > 0 
    ? Math.round((totalUserScore / totalRequiredScore) * 100)
    : 0

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{data.dimension}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">
                Your Score: <strong>{data.userScore}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-600">
                Required: <strong>{data.requiredScore}</strong>
              </span>
            </div>
            <div className="pt-1 border-t border-gray-200 mt-1">
              <span className="text-xs text-gray-500">
                Gap: {data.requiredScore - data.userScore > 0 
                  ? `${data.requiredScore - data.userScore} points below`
                  : `${data.userScore - data.requiredScore} points above`}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Skills & Qualifications Match
        </h2>
        <p className="text-sm text-gray-600">
          Compare your profile against job requirements across 6 key dimensions
        </p>
      </div>

      {/* Overall Match */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Overall Qualification Match
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {matchPercentage}%
            </span>
            {matchPercentage >= 80 ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Strong Match
              </span>
            ) : matchPercentage >= 60 ? (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                Good Match
              </span>
            ) : (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                Needs Work
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid 
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              className="text-[10px] sm:text-xs"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 9 }}
              tickCount={6}
            />
            
            {/* Required Score (background) */}
            <Radar
              name="Required"
              dataKey="requiredScore"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            
            {/* User Score (foreground) */}
            <Radar
              name="Your Score"
              dataKey="userScore"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px'
              }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension Details */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Dimension Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.map((item) => {
            const gap = item.requiredScore - item.userScore
            const isAbove = gap < 0
            const isMatch = Math.abs(gap) <= 10
            
            return (
              <div
                key={item.dimension}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {item.dimension}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.userScore} / {item.requiredScore}
                  </p>
                </div>
                <div>
                  {isMatch ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      ✓ Match
                    </span>
                  ) : isAbove ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      +{Math.abs(gap)}
                    </span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                      -{gap}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Colorblind-friendly:</strong> Blue represents your scores, 
          purple represents required scores. Hover over the chart for detailed information.
        </p>
      </div>
    </div>
  )
}
