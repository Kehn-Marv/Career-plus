# Auto-Fix Store Integration

## Overview

The optimization store has been updated to integrate with the new `AutoFixOrchestrator` for intelligent resume optimization with comprehensive progress tracking and error handling.

## What Was Added

### 1. New State Properties

#### `autoFixProgress`
Tracks the real-time progress of the auto-fix workflow:
- `steps`: Array of progress steps with status indicators
- `currentStep`: Index of the currently executing step
- `percentage`: Overall completion percentage (0-100)
- `estimatedTimeRemaining`: Estimated seconds until completion
- `isRunning`: Boolean flag indicating if auto-fix is active

#### `autoFixResult`
Stores the complete result of the auto-fix workflow:
- `success`: Boolean indicating success/failure
- `optimizedResumeId`: ID of the saved optimized resume
- `optimizedResume`: The optimized resume data
- `pdfBlob`: Generated PDF blob
- `pdfMetadata`: PDF generation metadata
- `appliedFixes`: Array of fix descriptions
- `improvements`: Metrics for ATS score, keywords, grammar, content
- `processingTime`: Total time taken in seconds
- `error`: Error message if failed

### 2. New Actions

#### `runAutoFixWorkflow(analysisId, options?)`
Primary method for running the new auto-fix workflow:
- Integrates with `AutoFixOrchestrator`
- Provides real-time progress updates via callback
- Handles all error types with user-friendly messages
- Saves results to IndexedDB
- Updates version history
- Prevents duplicate operations

**Options:**
```typescript
{
  templateId?: string
  region?: 'US' | 'UK' | 'EU' | 'APAC'
  includeGrammarFixes?: boolean
  includeKeywordOptimization?: boolean
  aggressiveness?: 'conservative' | 'moderate' | 'aggressive'
  preserveTone?: boolean
}
```

#### `clearAutoFixProgress()`
Resets auto-fix progress and result state.

### 3. New Selectors

Comprehensive selectors for accessing auto-fix state:

**Progress Selectors:**
- `isAutoFixRunning`: Check if auto-fix is currently running
- `getAutoFixProgressPercentage`: Get current progress percentage
- `getAutoFixProgressSteps`: Get array of progress steps
- `getCurrentAutoFixStep`: Get current step index
- `getAutoFixEstimatedTime`: Get estimated time remaining

**Result Selectors:**
- `isAutoFixComplete`: Check if auto-fix completed successfully
- `isAutoFixFailed`: Check if auto-fix failed
- `getAutoFixResult`: Get complete result object
- `getAutoFixImprovements`: Get improvement metrics
- `getAutoFixAppliedFixes`: Get list of applied fixes
- `getAutoFixProcessingTime`: Get processing time

**Error Selectors:**
- `hasAutoFixError`: Check if there's an error
- `getAutoFixErrorMessage`: Get error message

## Error Handling

The store handles all auto-fix error types with user-friendly messages:

- **DATA_RETRIEVAL_ERROR**: "Unable to retrieve analysis data. Please re-run the analysis."
- **OPTIMIZATION_ERROR**: "Content optimization failed. The AI service may be temporarily unavailable."
- **PDF_GENERATION_ERROR**: "PDF generation failed. You can still download the optimized content."
- **STORAGE_ERROR**: "Unable to save results. Your browser storage may be full."
- **VALIDATION_ERROR**: "Optimized content failed validation. Please review the issues."
- **TIMEOUT_ERROR**: "Request timed out. Please check your connection and try again."

## Usage Example

```typescript
import { useOptimizationStore, optimizationSelectors } from '@/store/optimization-store'

function AutoFixComponent({ analysisId }: { analysisId: number }) {
  const runAutoFixWorkflow = useOptimizationStore(state => state.runAutoFixWorkflow)
  const isRunning = useOptimizationStore(optimizationSelectors.isAutoFixRunning)
  const progress = useOptimizationStore(optimizationSelectors.getAutoFixProgressPercentage)
  const steps = useOptimizationStore(optimizationSelectors.getAutoFixProgressSteps)
  const result = useOptimizationStore(optimizationSelectors.getAutoFixResult)
  
  const handleAutoFix = async () => {
    const result = await runAutoFixWorkflow(analysisId, {
      templateId: 'professional',
      includeGrammarFixes: true,
      includeKeywordOptimization: true,
      aggressiveness: 'moderate',
      preserveTone: true
    })
    
    if (result.success) {
      console.log('Auto-fix complete!', result.improvements)
    } else {
      console.error('Auto-fix failed:', result.error)
    }
  }
  
  return (
    <div>
      <button onClick={handleAutoFix} disabled={isRunning}>
        {isRunning ? `Optimizing... ${progress}%` : 'Auto-Fix Resume'}
      </button>
      
      {isRunning && (
        <div>
          {steps.map((step, index) => (
            <div key={step.id}>
              {step.status === 'completed' ? '✅' : 
               step.status === 'in-progress' ? '⏳' : 
               step.status === 'failed' ? '❌' : '⏸️'}
              {step.title}
            </div>
          ))}
        </div>
      )}
      
      {result?.success && (
        <div>
          <h3>Optimization Complete!</h3>
          <p>ATS Score Improvement: +{result.improvements.atsScoreImprovement}</p>
          <p>Keywords Added: {result.improvements.keywordsAdded}</p>
          <p>Grammar Fixes: {result.improvements.grammarFixesApplied}</p>
          <p>Processing Time: {result.processingTime.toFixed(1)}s</p>
        </div>
      )}
    </div>
  )
}
```

## Integration with Existing Code

The store maintains backward compatibility:
- Legacy `runAutoFix` method still works with old orchestrator
- New `runAutoFixWorkflow` method uses `AutoFixOrchestrator`
- Both methods use operation tracking to prevent duplicates
- Both methods update `currentOptimizedResume` and version history

## Requirements Satisfied

✅ **1.1-1.5**: State management for auto-fix workflow
✅ **7.1-7.5**: Progress tracking with steps, percentage, and time estimates
✅ **Error Handling**: Comprehensive error state management with user-friendly messages
✅ **Integration**: Seamless integration with AutoFixOrchestrator
✅ **Modularity**: Clean separation of concerns with selectors and actions

## Next Steps

Components can now use the store to:
1. Trigger auto-fix workflow with `runAutoFixWorkflow`
2. Display real-time progress with progress selectors
3. Show results and improvements with result selectors
4. Handle errors gracefully with error selectors
