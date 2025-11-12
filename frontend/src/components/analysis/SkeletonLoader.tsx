/**
 * SkeletonLoader Component
 * Displays skeleton loading states for analysis results
 */

interface SkeletonLoaderProps {
  type?: 'scoreCard' | 'radar' | 'ats' | 'insights' | 'recommendations'
}

export function SkeletonLoader({ type = 'scoreCard' }: SkeletonLoaderProps) {
  if (type === 'scoreCard') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        
        {/* Score circle skeleton */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded-full w-32"></div>
        </div>
        
        {/* Breakdown skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (type === 'radar') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
        
        {/* Radar chart skeleton */}
        <div className="w-full h-[400px] bg-gray-100 rounded-lg mb-6"></div>
        
        {/* Dimension breakdown skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (type === 'ats') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
        
        {/* ATS score skeleton */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Issues skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (type === 'insights') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gaps skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          
          {/* Strengths skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (type === 'recommendations') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return null
}

/**
 * AILoadingIndicator Component
 * Shows when AI operations are in progress
 */
export function AILoadingIndicator({ message = 'Analyzing with AI...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-pink-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-purple-900">{message}</p>
        <p className="text-xs text-purple-600">This may take a moment...</p>
      </div>
    </div>
  )
}
