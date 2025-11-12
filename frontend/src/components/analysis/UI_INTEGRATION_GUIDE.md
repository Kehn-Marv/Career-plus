# UI Components Integration Guide

## Quick Start

This guide shows how to integrate the enhanced UI components into your analysis pages.

## 1. Enhanced ScoreCard with All Features

```typescript
import { ScoreCard } from '@/components/analysis'
import type { 
  EnhancedKeywordAnalysis,
  BulletQualityAnalysis,
  IndustryAnalysis,
  SeniorityAnalysis,
  ATSParseResult
} from '@/lib/ai/enhanced-types'

function AnalysisResults() {
  // Get data from your analysis store or API
  const { 
    scores,
    enhancedKeywordAnalysis,
    bulletQualityAnalysis,
    industryAnalysis,
    seniorityAnalysis,
    atsResult
  } = useAnalysisData()
  
  return (
    <ScoreCard
      overallScore={scores.total}
      breakdown={{
        semantic: scores.semantic,
        keyword: scores.keyword,
        format: scores.format
      }}
      animate={true}
      // Optional enhanced features
      enhancedKeywordAnalysis={enhancedKeywordAnalysis}
      bulletQualityAnalysis={bulletQualityAnalysis}
      industryAnalysis={industryAnalysis}
      seniorityAnalysis={seniorityAnalysis}
      atsResult={atsResult}
    />
  )
}
```

## 2. Loading States

### Skeleton Loaders

Use skeleton loaders while data is being fetched:

```typescript
import { SkeletonLoader } from '@/components/analysis'

function AnalysisPage() {
  const { isLoading, data } = useAnalysis()
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {isLoading ? (
        <>
          <SkeletonLoader type="scoreCard" />
          <SkeletonLoader type="radar" />
          <SkeletonLoader type="ats" />
          <SkeletonLoader type="insights" />
        </>
      ) : (
        <>
          <ScoreCard {...data.scores} />
          <RadarChart {...data.radar} />
          <ATSCard {...data.ats} />
          <InsightsPanel {...data.insights} />
        </>
      )}
    </div>
  )
}
```

### AI Loading Indicator

Show when AI operations are in progress:

```typescript
import { AILoadingIndicator } from '@/components/analysis'

function AnalysisSection() {
  const { isAIProcessing, aiStage } = useAIAnalysis()
  
  return (
    <div>
      {isAIProcessing && (
        <AILoadingIndicator 
          message={`Analyzing with AI: ${aiStage}...`} 
        />
      )}
      {/* Your content */}
    </div>
  )
}
```

## 3. Feature Status Indicator

Show which analysis features are active:

```typescript
import { FeatureStatusIndicator } from '@/components/analysis'

function AnalysisPage() {
  const { capabilities } = useAnalysisStore()
  
  return (
    <div>
      {/* Compact version in header */}
      <FeatureStatusIndicator 
        capabilities={capabilities}
        compact={true}
      />
      
      {/* Full version in sidebar or modal */}
      <FeatureStatusIndicator 
        capabilities={capabilities}
        compact={false}
        showDetails={true}
      />
    </div>
  )
}
```

## 4. AI Insights Panel

Display comprehensive AI-powered insights:

```typescript
import { AIInsightsPanel } from '@/components/analysis'

function InsightsSection() {
  const { semanticMatches, aiInsights } = useAIAnalysis()
  
  return (
    <AIInsightsPanel
      semanticMatches={semanticMatches}
      aiInsights={aiInsights}
      showConfidenceScores={true}
    />
  )
}
```

## 5. Complete Analysis Page Example

Here's a complete example integrating all components:

```typescript
import { useState, useEffect } from 'react'
import {
  ScoreCard,
  AchievementRadar,
  SkeletonLoader,
  AILoadingIndicator,
  FeatureStatusIndicator,
  AIInsightsPanel,
  AnalysisProgress
} from '@/components/analysis'
import { useAnalysisStore } from '@/store/analysis-store'

export default function AnalysisPage() {
  const {
    currentAnalysis,
    isAnalyzing,
    analysisProgress,
    analysisCapabilities
  } = useAnalysisStore()
  
  const [showFeatureStatus, setShowFeatureStatus] = useState(false)
  
  // Check if we have enhanced data
  const hasEnhancedData = currentAnalysis?.enhancedKeywordAnalysis != null
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Analysis Progress Modal */}
      <AnalysisProgress
        show={isAnalyzing}
        progress={analysisProgress}
        capabilities={analysisCapabilities}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Feature Status */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <button
            onClick={() => setShowFeatureStatus(!showFeatureStatus)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View Feature Status
          </button>
        </div>
        
        {/* Feature Status Panel */}
        {showFeatureStatus && (
          <div className="mb-8">
            <FeatureStatusIndicator
              capabilities={analysisCapabilities}
              showDetails={true}
            />
          </div>
        )}
        
        {/* Main Content */}
        {!currentAnalysis ? (
          // Loading State
          <div className="grid md:grid-cols-2 gap-6">
            <SkeletonLoader type="scoreCard" />
            <SkeletonLoader type="radar" />
            <SkeletonLoader type="ats" />
            <SkeletonLoader type="insights" />
          </div>
        ) : (
          // Analysis Results
          <div className="space-y-8">
            {/* Scores Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <ScoreCard
                overallScore={currentAnalysis.scores.total}
                breakdown={{
                  semantic: currentAnalysis.scores.semantic,
                  keyword: currentAnalysis.scores.keyword,
                  format: currentAnalysis.scores.format
                }}
                animate={true}
                enhancedKeywordAnalysis={currentAnalysis.enhancedKeywordAnalysis}
                bulletQualityAnalysis={currentAnalysis.bulletQualityAnalysis}
                industryAnalysis={currentAnalysis.industryAnalysis}
                seniorityAnalysis={currentAnalysis.seniorityAnalysis}
                atsResult={currentAnalysis.atsResult}
              />
              
              <AchievementRadar
                dimensions={currentAnalysis.radarData}
              />
            </div>
            
            {/* AI Insights Section */}
            {hasEnhancedData && (
              <>
                <AILoadingIndicator message="Enhanced with AI" />
                <AIInsightsPanel
                  semanticMatches={currentAnalysis.semanticMatches}
                  aiInsights={currentAnalysis.aiInsights}
                  showConfidenceScores={true}
                />
              </>
            )}
            
            {/* Other sections... */}
          </div>
        )}
      </div>
    </div>
  )
}
```

## 6. Responsive Design Tips

### Mobile Optimization

```typescript
// Use responsive grid classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Components */}
</div>

// Stack on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-4">
  {/* Components */}
</div>
```

### Compact Mode for Small Screens

```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery'

function ResponsiveFeatureStatus() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return (
    <FeatureStatusIndicator
      capabilities={capabilities}
      compact={isMobile}
      showDetails={!isMobile}
    />
  )
}
```

## 7. Accessibility Best Practices

### Keyboard Navigation

All components support keyboard navigation:
- Tab to navigate between sections
- Enter/Space to expand/collapse
- Escape to close modals

### Screen Reader Support

Components include proper ARIA labels:

```typescript
<button
  aria-label="Expand keyword analysis section"
  aria-expanded={isExpanded}
>
  {/* Content */}
</button>
```

### Color Contrast

All color combinations meet WCAG AA standards:
- Text on backgrounds: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear focus indicators

## 8. Performance Optimization

### Lazy Loading

Load heavy components only when needed:

```typescript
import { lazy, Suspense } from 'react'

const AIInsightsPanel = lazy(() => 
  import('@/components/analysis/AIInsightsPanel').then(m => ({ 
    default: m.AIInsightsPanel 
  }))
)

function AnalysisPage() {
  return (
    <Suspense fallback={<SkeletonLoader type="insights" />}>
      <AIInsightsPanel {...props} />
    </Suspense>
  )
}
```

### Memoization

Prevent unnecessary re-renders:

```typescript
import { memo } from 'react'

const MemoizedScoreCard = memo(ScoreCard, (prev, next) => {
  return prev.overallScore === next.overallScore &&
         prev.breakdown === next.breakdown
})
```

## 9. Error Handling

### Graceful Degradation

```typescript
function SafeScoreCard({ data, ...props }) {
  if (!data) {
    return <SkeletonLoader type="scoreCard" />
  }
  
  try {
    return <ScoreCard {...data} {...props} />
  } catch (error) {
    console.error('ScoreCard error:', error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Unable to display score card</p>
      </div>
    )
  }
}
```

## 10. Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react'
import { ScoreCard } from '@/components/analysis'

describe('ScoreCard', () => {
  it('displays overall score', () => {
    render(
      <ScoreCard
        overallScore={85}
        breakdown={{ semantic: 80, keyword: 85, format: 90 }}
      />
    )
    
    expect(screen.getByText('85')).toBeInTheDocument()
  })
  
  it('expands keyword section on click', async () => {
    const { user } = render(
      <ScoreCard
        overallScore={85}
        breakdown={{ semantic: 80, keyword: 85, format: 90 }}
        enhancedKeywordAnalysis={mockData}
      />
    )
    
    const button = screen.getByText('Enhanced Keyword Matching')
    await user.click(button)
    
    expect(screen.getByText('Exact Matches')).toBeVisible()
  })
})
```

## Support

For issues or questions:
1. Check the implementation summary: `TASK_12_IMPLEMENTATION_SUMMARY.md`
2. Review component source code for detailed prop types
3. Check the enhanced-types.ts file for data structure definitions

## Next Steps

1. Integrate components into your analysis pages
2. Test with real data from the analysis engine
3. Customize colors and styling to match your brand
4. Add analytics tracking for user interactions
5. Implement A/B testing for different layouts
