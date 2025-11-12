import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { OptimizedResume } from '@/lib/db/schema'
import type { TemplateConfig } from '@/lib/templates/template-config'
import type { Region } from '@/lib/optimization/resume-fixer'
import {
  resumeOptimizationOrchestrator,
  type OptimizationResult,
  type OptimizationStep
} from '@/lib/orchestrator/orchestrator'
import { templateEngine } from '@/lib/templates/template-engine'
import { pdfGenerator } from '@/lib/pdf/pdf-generator'
import {
  getOptimizedResumeById
} from '@/lib/db/optimized-resume-operations'
import {
  handleOptimizationError,
  type OptimizationError
} from '@/lib/optimization/error-handler'
import { globalOperationTracker } from '@/lib/utils/debounce'
import { optimizedResumeQueryOptimizer } from '@/lib/db/query-optimizer'

/**
 * Optimization state interface
 */
interface OptimizationState {
  // Current optimized resume
  currentOptimizedResume: OptimizedResume | null
  
  // Selected template
  selectedTemplate: TemplateConfig | null
  
  // Loading states
  isOptimizing: boolean
  isGeneratingPDF: boolean
  isApplyingLocalization: boolean
  
  // Progress tracking
  optimizationProgress: {
    step: OptimizationStep | 'idle'
    percentage: number
    message: string
    estimatedTimeRemaining?: number
  }
  
  // Version history
  versions: OptimizedResume[]
  
  // Error state
  error: string | null
  optimizationError: OptimizationError | null
}

/**
 * Optimization actions interface
 */
interface OptimizationActions {
  // Auto fix
  runAutoFix: (analysisId: number, templateId: string) => Promise<OptimizationResult>
  
  // Export
  exportToPDF: (optimizedResumeId: number) => Promise<void>
  
  // Localization
  applyLocalization: (optimizedResumeId: number, region: Region) => Promise<OptimizedResume>
  
  // Template
  selectTemplate: (templateId: string) => void
  
  // Version management
  loadVersionHistory: (analysisId: number) => Promise<void>
  restoreVersion: (versionId: number) => Promise<void>
  loadLatestOptimizedResume: (analysisId: number) => Promise<void>
  
  // State management
  setError: (error: string | null) => void
  setOptimizationError: (error: OptimizationError | null) => void
  clearError: () => void
  reset: () => void
}

/**
 * Initial state
 */
const initialState: OptimizationState = {
  currentOptimizedResume: null,
  selectedTemplate: null,
  optimizationError: null,
  isOptimizing: false,
  isGeneratingPDF: false,
  isApplyingLocalization: false,
  optimizationProgress: {
    step: 'idle',
    percentage: 0,
    message: '',
    estimatedTimeRemaining: undefined
  },
  versions: [],
  error: null
}

/**
 * Optimization store
 * Manages resume optimization, PDF export, and version history
 */
export const useOptimizationStore = create<OptimizationState & OptimizationActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ============================================================================
      // Auto Fix
      // ============================================================================

      runAutoFix: async (analysisId, templateId) => {
        const { setError, setOptimizationError } = get()
        
        // Use operation tracker to prevent duplicate operations
        const operationKey = `autofix_${analysisId}_${templateId}`
        
        return globalOperationTracker.execute(operationKey, async () => {
          try {
            set({ 
              isOptimizing: true, 
              error: null,
              optimizationError: null,
              optimizationProgress: {
                step: 'collecting',
                percentage: 0,
                message: 'Starting optimization...',
                estimatedTimeRemaining: undefined
              }
            })
            
            // Set progress callback
            resumeOptimizationOrchestrator.setProgressCallback((progress) => {
              set({ optimizationProgress: progress })
            })
            
            // Run optimization
            const result = await resumeOptimizationOrchestrator.optimizeResume({
              analysisId,
              templateId,
              autoDownload: false
            })
          
            if (!result.success) {
              throw new Error(result.errors?.join(', ') || 'Optimization failed')
            }
            
            // Load the optimized resume
            const optimizedResume = await getOptimizedResumeById(result.optimizedResumeId)
            if (optimizedResume) {
              set({ currentOptimizedResume: optimizedResume })
              
              // Load version history
              await get().loadVersionHistory(analysisId)
              
              // Invalidate cache for this analysis
              optimizedResumeQueryOptimizer.invalidateCacheForAnalysis(analysisId)
            }
            
            set({ 
              isOptimizing: false,
              optimizationProgress: {
                step: 'complete',
                percentage: 100,
                message: 'Optimization complete!',
                estimatedTimeRemaining: 0
              }
            })
            
            return result
            
          } catch (error: any) {
            console.error('Auto fix failed:', error)
            
            // Handle error with optimization error handler
            const optimizationError = handleOptimizationError(error, 'Auto Fix Resume')
            setOptimizationError(optimizationError)
            setError(optimizationError.userMessage)
            
            set({ 
              isOptimizing: false,
              optimizationProgress: {
                step: 'idle',
                percentage: 0,
                message: '',
                estimatedTimeRemaining: undefined
              }
            })
            
            return {
              optimizedResumeId: -1,
              appliedFixes: 0,
              success: false,
              errors: [optimizationError.userMessage]
            }
          }
        })
      },

      // ============================================================================
      // Export PDF
      // ============================================================================

      exportToPDF: async (optimizedResumeId) => {
        const { setError, setOptimizationError } = get()
        
        // Use operation tracker to prevent duplicate PDF generation
        const operationKey = `export_pdf_${optimizedResumeId}`
        
        return globalOperationTracker.execute(operationKey, async () => {
          try {
            set({ isGeneratingPDF: true, error: null, optimizationError: null })
            
            // Retrieve optimized resume
            const optimizedResume = await getOptimizedResumeById(optimizedResumeId)
            if (!optimizedResume) {
              throw new Error('Optimized resume not found. Please run Auto Fix first.')
            }
            
            // Generate PDF
            const blob = await resumeOptimizationOrchestrator.exportToPDF(optimizedResumeId)
            
            // Generate filename
            const jobTitle = optimizedResume.content.experience[0]?.title || 'Resume'
            const date = new Date().toISOString().split('T')[0]
            const region = optimizedResume.region ? `_${optimizedResume.region}` : ''
            const fileName = `Resume${region}_${jobTitle.replace(/\s+/g, '_')}_${date}.pdf`
            
            // Trigger download
            await pdfGenerator.downloadPDF(blob, fileName)
            
            set({ isGeneratingPDF: false })
            
          } catch (error: any) {
            console.error('PDF export failed:', error)
            
            // Handle error with optimization error handler
            const optimizationError = handleOptimizationError(error, 'PDF Export')
            setOptimizationError(optimizationError)
            setError(optimizationError.userMessage)
            
            set({ isGeneratingPDF: false })
            throw error
          }
        })
      },

      // ============================================================================
      // Localization
      // ============================================================================

      applyLocalization: async (optimizedResumeId, region) => {
        const { setError, setOptimizationError } = get()
        
        try {
          set({ isApplyingLocalization: true, error: null, optimizationError: null })
          
          // Apply regional localization
          const localizedResume = await resumeOptimizationOrchestrator.applyRegionalLocalization(
            optimizedResumeId,
            region
          )
          
          // Update current optimized resume
          set({ 
            currentOptimizedResume: localizedResume,
            isApplyingLocalization: false
          })
          
          // Reload version history
          await get().loadVersionHistory(localizedResume.analysisId)
          
          return localizedResume
          
        } catch (error: any) {
          console.error('Localization failed:', error)
          
          // Handle error with optimization error handler
          const optimizationError = handleOptimizationError(error, 'Regional Localization')
          setOptimizationError(optimizationError)
          setError(optimizationError.userMessage)
          
          set({ isApplyingLocalization: false })
          throw error
        }
      },

      // ============================================================================
      // Template Selection
      // ============================================================================

      selectTemplate: (templateId) => {
        const template = templateEngine.getTemplate(templateId)
        if (template) {
          set({ selectedTemplate: template, error: null })
        } else {
          set({ error: `Template not found: ${templateId}` })
        }
      },

      // ============================================================================
      // Version Management
      // ============================================================================

      loadVersionHistory: async (analysisId) => {
        try {
          // Use optimized query with caching
          const result = await optimizedResumeQueryOptimizer.getByAnalysisId(analysisId, {
            limit: 10,
            orderBy: 'createdAt',
            orderDirection: 'desc'
          })
          set({ versions: result.data, error: null })
        } catch (error: any) {
          console.error('Failed to load version history:', error)
          set({ error: error.message || 'Failed to load version history' })
        }
      },

      restoreVersion: async (versionId) => {
        const { setError } = get()
        
        try {
          const version = await getOptimizedResumeById(versionId)
          if (!version) {
            throw new Error('Version not found')
          }
          
          set({ currentOptimizedResume: version, error: null })
          
        } catch (error: any) {
          console.error('Failed to restore version:', error)
          setError(error.message || 'Failed to restore version')
          throw error
        }
      },

      loadLatestOptimizedResume: async (analysisId) => {
        try {
          // Use optimized query with caching
          const latest = await optimizedResumeQueryOptimizer.getLatestByAnalysisId(analysisId)
          set({ currentOptimizedResume: latest || null, error: null })
        } catch (error: any) {
          console.error('Failed to load latest optimized resume:', error)
          set({ error: error.message || 'Failed to load optimized resume' })
        }
      },

      // ============================================================================
      // Error Handling
      // ============================================================================

      setError: (error) => {
        set({ error })
      },

      setOptimizationError: (optimizationError) => {
        set({ optimizationError })
      },

      clearError: () => {
        set({ error: null, optimizationError: null })
      },

      // ============================================================================
      // Reset
      // ============================================================================

      reset: () => {
        set(initialState)
      }
    }),
    { name: 'OptimizationStore' }
  )
)

/**
 * Selectors for common state access patterns
 */
export const optimizationSelectors = {
  // Check if optimized resume exists
  hasOptimizedResume: (state: OptimizationState) =>
    state.currentOptimizedResume !== null,
  
  // Check if optimization is in progress
  isOptimizationInProgress: (state: OptimizationState) =>
    state.isOptimizing || state.isGeneratingPDF || state.isApplyingLocalization,
  
  // Get optimization error
  getOptimizationError: (state: OptimizationState) =>
    state.optimizationError,
  
  // Check if there is an error
  hasError: (state: OptimizationState) =>
    state.error !== null || state.optimizationError !== null,
  
  // Get current progress percentage
  getProgressPercentage: (state: OptimizationState) =>
    state.optimizationProgress.percentage,
  
  // Check if optimization is complete
  isOptimizationComplete: (state: OptimizationState) =>
    state.optimizationProgress.step === 'complete',
  
  // Get version count
  getVersionCount: (state: OptimizationState) =>
    state.versions.length,
  
  // Get latest version number
  getLatestVersionNumber: (state: OptimizationState) =>
    state.versions.length > 0
      ? Math.max(...state.versions.map(v => v.version))
      : 0,
  
  // Check if template is selected
  hasTemplateSelected: (state: OptimizationState) =>
    state.selectedTemplate !== null,
  
  // Get ATS score
  getATSScore: (state: OptimizationState) =>
    state.currentOptimizedResume?.atsCompatibilityScore ?? 0,
  
  // Get applied fixes count
  getAppliedFixesCount: (state: OptimizationState) => {
    if (!state.currentOptimizedResume) return 0
    
    const fixes = state.currentOptimizedResume.appliedFixes
    return (
      fixes.recommendationIds.length +
      fixes.atsIssuesFixes.length +
      fixes.biasFixesApplied +
      (fixes.localizationApplied ? 1 : 0)
    )
  },
  
  // Check if localization is applied
  isLocalizationApplied: (state: OptimizationState) =>
    state.currentOptimizedResume?.appliedFixes.localizationApplied ?? false,
  
  // Get current region
  getCurrentRegion: (state: OptimizationState) =>
    state.currentOptimizedResume?.region
}
