# Store Module

State management for Career+ using Zustand with IndexedDB persistence.

## Overview

Four main stores manage application state:
1. **Analysis Store** - Current resume, job description, and analysis
2. **History Store** - Past analyses with filtering and sorting
3. **Chat Store** - AI chat messages and conversations
4. **Optimization Store** - Resume optimization, PDF export, and version history

## Usage

### Analysis Store

```typescript
import { useAnalysisStore, analysisSelectors } from '@/store'

function AnalyzePage() {
  const { 
    currentResume,
    currentAnalysis,
    isAnalyzing,
    runAnalysis,
    loadAnalysis
  } = useAnalysisStore()
  
  // Run new analysis
  const handleAnalyze = async () => {
    await runAnalysis(resumeId, jobDescriptionId)
  }
  
  // Load existing analysis
  const handleLoad = async (id: number) => {
    await loadAnalysis(id)
  }
  
  // Use selectors
  const isReady = useAnalysisStore(analysisSelectors.isReadyToAnalyze)
  const score = useAnalysisStore(analysisSelectors.getMatchScore)
  
  return (
    <div>
      {isAnalyzing && <LoadingSpinner />}
      {currentAnalysis && <ScoreCard score={score} />}
    </div>
  )
}
```

### History Store

```typescript
import { useHistoryStore, historySelectors } from '@/store'

function HistoryPage() {
  const {
    filteredAnalyses,
    isLoading,
    loadHistory,
    deleteAnalysis,
    setSortBy,
    setFilters
  } = useHistoryStore()
  
  useEffect(() => {
    loadHistory()
  }, [])
  
  // Sort by score
  const handleSort = () => {
    setSortBy('score-desc')
  }
  
  // Filter by search
  const handleSearch = (query: string) => {
    setFilters({ searchQuery: query })
  }
  
  // Delete analysis
  const handleDelete = async (id: number) => {
    await deleteAnalysis(id)
  }
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {filteredAnalyses.map(item => (
        <AnalysisCard key={item.analysis.id} {...item} />
      ))}
    </div>
  )
}
```

### Chat Store

```typescript
import { useChatStore, chatSelectors } from '@/store'

function ChatInterface() {
  const {
    messages,
    inputValue,
    isSending,
    setCurrentAnalysis,
    sendMessage,
    setInputValue
  } = useChatStore()
  
  useEffect(() => {
    setCurrentAnalysis(analysisId)
  }, [analysisId])
  
  const handleSend = async () => {
    await sendMessage(inputValue)
  }
  
  const canSend = useChatStore(chatSelectors.canSendMessage)
  
  return (
    <div>
      {messages.map(msg => (
        <Message key={msg.id} {...msg} />
      ))}
      <input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleSend} disabled={!canSend}>
        Send
      </button>
    </div>
  )
}
```

### Optimization Store

```typescript
import { useOptimizationStore, optimizationSelectors } from '@/store'

function OptimizationPanel() {
  const {
    currentOptimizedResume,
    isOptimizing,
    isGeneratingPDF,
    optimizationProgress,
    runAutoFix,
    exportToPDF,
    applyLocalization,
    selectTemplate,
    loadVersionHistory
  } = useOptimizationStore()
  
  useEffect(() => {
    // Load latest optimized resume
    loadLatestOptimizedResume(analysisId)
    loadVersionHistory(analysisId)
  }, [analysisId])
  
  // Run auto fix
  const handleAutoFix = async () => {
    const result = await runAutoFix(analysisId, 'modern-professional')
    if (result.success) {
      console.log(`Applied ${result.appliedFixes} fixes`)
    }
  }
  
  // Export to PDF
  const handleExport = async () => {
    if (currentOptimizedResume?.id) {
      await exportToPDF(currentOptimizedResume.id)
    }
  }
  
  // Apply localization
  const handleLocalize = async (region: 'US' | 'UK' | 'EU' | 'APAC') => {
    if (currentOptimizedResume?.id) {
      await applyLocalization(currentOptimizedResume.id, region)
    }
  }
  
  // Use selectors
  const hasResume = useOptimizationStore(optimizationSelectors.hasOptimizedResume)
  const progress = useOptimizationStore(optimizationSelectors.getProgressPercentage)
  const fixesCount = useOptimizationStore(optimizationSelectors.getAppliedFixesCount)
  
  return (
    <div>
      {isOptimizing && (
        <ProgressBar 
          percentage={progress} 
          message={optimizationProgress.message} 
        />
      )}
      
      <button onClick={handleAutoFix} disabled={isOptimizing}>
        Auto Fix Resume
      </button>
      
      {hasResume && (
        <>
          <button onClick={handleExport} disabled={isGeneratingPDF}>
            Export as PDF
          </button>
          
          <select onChange={(e) => handleLocalize(e.target.value as any)}>
            <option value="">Select Region</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="EU">European Union</option>
            <option value="APAC">Asia Pacific</option>
          </select>
          
          <p>{fixesCount} fixes applied</p>
        </>
      )}
    </div>
  )
}
```

## Selectors

Selectors provide computed values from state:

```typescript
// Analysis selectors
analysisSelectors.isReadyToAnalyze(state)
analysisSelectors.isAnalysisInProgress(state)
analysisSelectors.getProgressPercentage(state)
analysisSelectors.getMatchScore(state)

// History selectors
historySelectors.getTotalCount(state)
historySelectors.hasActiveFilters(state)
historySelectors.getAverageScore(state)

// Chat selectors
chatSelectors.getMessageCount(state)
chatSelectors.canSendMessage(state)
chatSelectors.isWaitingForResponse(state)

// Optimization selectors
optimizationSelectors.hasOptimizedResume(state)
optimizationSelectors.isOptimizationInProgress(state)
optimizationSelectors.getProgressPercentage(state)
optimizationSelectors.isOptimizationComplete(state)
optimizationSelectors.getVersionCount(state)
optimizationSelectors.getLatestVersionNumber(state)
optimizationSelectors.hasTemplateSelected(state)
optimizationSelectors.getATSScore(state)
optimizationSelectors.getAppliedFixesCount(state)
optimizationSelectors.isLocalizationApplied(state)
optimizationSelectors.getCurrentRegion(state)
```

## DevTools

Zustand DevTools are enabled in development:
- Open Redux DevTools extension
- View state changes in real-time
- Time-travel debugging

## Best Practices

1. **Use selectors** for computed values
2. **Handle errors** in components
3. **Show loading states** during async operations
4. **Clear state** when appropriate (logout, reset)
5. **Sync with IndexedDB** for persistence
