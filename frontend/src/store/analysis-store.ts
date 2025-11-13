import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Resume, JobDescription, Analysis } from '@/lib/db'
import { resumeOps, jobDescriptionOps, analysisOps } from '@/lib/db'
import { ProgressManager, PROGRESS_STAGES } from '@/lib/analysis/progress-manager'

/**
 * Analysis state interface
 */
interface AnalysisState {
  // Current data
  currentResume: Resume | null
  currentJobDescription: JobDescription | null
  currentAnalysis: Analysis | null
  
  // Loading states
  isUploading: boolean
  isParsing: boolean
  isAnalyzing: boolean
  isGeneratingRecommendations: boolean
  
  // Error state
  error: string | null
  
  // Progress tracking
  analysisProgress: {
    step: 'idle' | 'parsing' | 'embedding' | 'scoring' | 'recommendations' | 'complete' | 'keyword' | 'semantic' | 'format' | 'ats' | 'ai-enhancement'
    percentage: number
    message: string
    estimatedTimeRemaining: number
  }
  
  // Analysis capabilities
  analysisCapabilities: {
    keywordMatching: 'enhanced' | 'basic'
    semanticAnalysis: 'ai' | 'embedding' | 'keyword-only'
    bulletQuality: 'ai' | 'rule-based'
    formatAnalysis: 'comprehensive' | 'basic'
    atsSimulation: 'full' | 'basic'
    industryRules: boolean
    adaptiveThresholds: boolean
  }
}

/**
 * Analysis actions interface
 */
interface AnalysisActions {
  // Resume actions
  setResume: (resume: Resume) => void
  clearResume: () => void
  
  // Job description actions
  setJobDescription: (jd: JobDescription) => void
  clearJobDescription: () => void
  
  // Analysis actions
  setAnalysis: (analysis: Analysis) => void
  clearAnalysis: () => void
  
  // Run complete analysis workflow
  runAnalysis: (resumeId: number, jdId: number) => Promise<void>
  
  // Load existing analysis
  loadAnalysis: (analysisId: number) => Promise<void>
  
  // Update analysis progress
  updateProgress: (step: AnalysisState['analysisProgress']['step'], percentage: number, message: string, estimatedTimeRemaining?: number) => void
  
  // Update analysis capabilities
  updateCapabilities: (capabilities: Partial<AnalysisState['analysisCapabilities']>) => void
  
  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
  
  // Reset entire state
  reset: () => void
}

/**
 * Initial state
 */
const initialState: AnalysisState = {
  currentResume: null,
  currentJobDescription: null,
  currentAnalysis: null,
  isUploading: false,
  isParsing: false,
  isAnalyzing: false,
  isGeneratingRecommendations: false,
  error: null,
  analysisProgress: {
    step: 'idle',
    percentage: 0,
    message: '',
    estimatedTimeRemaining: 0
  },
  analysisCapabilities: {
    keywordMatching: 'basic',
    semanticAnalysis: 'keyword-only',
    bulletQuality: 'rule-based',
    formatAnalysis: 'basic',
    atsSimulation: 'basic',
    industryRules: false,
    adaptiveThresholds: false
  }
}

/**
 * Analysis store
 * Manages current resume, job description, and analysis state
 */
export const useAnalysisStore = create<AnalysisState & AnalysisActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Resume actions
      setResume: (resume) => {
        set({ currentResume: resume, error: null })
      },

      clearResume: () => {
        set({ currentResume: null })
      },

      // Job description actions
      setJobDescription: (jd) => {
        set({ currentJobDescription: jd, error: null })
      },

      clearJobDescription: () => {
        set({ currentJobDescription: null })
      },

      // Analysis actions
      setAnalysis: (analysis) => {
        set({ currentAnalysis: analysis, error: null })
      },

      clearAnalysis: () => {
        set({ currentAnalysis: null })
      },

      // Run complete analysis workflow
      runAnalysis: async (resumeId, jdId) => {
        const { updateProgress, updateCapabilities, setError } = get()
        
        // Initialize progress manager
        const progressManager = new ProgressManager((progress) => {
          updateProgress(progress.stage, progress.percentage, progress.message, progress.estimatedTimeRemaining)
        })
        
        try {
          set({ isAnalyzing: true, error: null })
          
          // Stage 1: Parsing - Detect capabilities and load data
          progressManager.startStage(PROGRESS_STAGES[0], 'Detecting analysis capabilities...')
          
          try {
            const { detectCapabilities } = await import('@/lib/analysis/analysis-orchestrator')
            const capabilities = await detectCapabilities()
            updateCapabilities(capabilities)
          } catch (error) {
            console.warn('Failed to detect capabilities, using defaults')
          }
          
          // Load resume and JD
          progressManager.updateMessage('Loading resume and job description...')
          
          const [resume, jd] = await Promise.all([
            resumeOps.get(resumeId),
            jobDescriptionOps.get(jdId)
          ])
          
          if (!resume || !jd) {
            throw new Error('Resume or job description not found')
          }
          
          set({ currentResume: resume, currentJobDescription: jd })
          progressManager.completeStage()
          
          // Stage 2: Keyword Analysis
          progressManager.startStage(PROGRESS_STAGES[1], 'Performing keyword analysis...')
          
          // Convert Resume to ParsedResume format
          const parsedResume = {
            ...resume,
            detectedSections: [],
            yearsOfExperience: 0
          }
          
          // Convert JobDescription to ParsedJobDescription format
          const parsedJD = {
            ...jd,
            detectedSections: []
          }
          
          progressManager.completeStage()
          
          // Stage 3: Semantic Analysis - Generate embeddings
          progressManager.startStage(PROGRESS_STAGES[2], 'Generating semantic embeddings...')
          
          let resumeEmbedding: number[] = []
          let jdEmbedding: number[] = []
          
          try {
            const { generateEmbedding } = await import('@/lib/ai')
            const results = await Promise.all([
              generateEmbedding(resume.rawText),
              generateEmbedding(jd.rawText)
            ])
            resumeEmbedding = results[0]
            jdEmbedding = results[1]
            console.log('Embeddings generated successfully')
          } catch (embeddingError: any) {
            console.warn('Failed to generate embeddings, using fallback scoring:', embeddingError.message)
            // Create dummy embeddings for fallback (keyword-based scoring will be used)
            resumeEmbedding = new Array(384).fill(0)
            jdEmbedding = new Array(384).fill(0)
          }
          
          progressManager.completeStage()
          
          // Stage 4: Format Analysis - Calculate scores
          progressManager.startStage(PROGRESS_STAGES[3], 'Analyzing resume format and structure...')
          
          // Create a mock extracted text for format analysis
          const extractedText = {
            text: resume.rawText,
            metadata: {
              fileName: resume.fileName,
              fileType: resume.fileType,
              fileSize: resume.fileSize,
              pageCount: 1,
              extractedAt: new Date()
            },
            structure: {
              hasImages: false,
              hasTable: false,
              hasMultiColumn: false,
              hasList: true
            },
            warnings: []
          }
          
          progressManager.completeStage()
          
          // Stage 5: ATS Simulation - Progressive analysis
          progressManager.startStage(PROGRESS_STAGES[4], 'Running ATS simulation...')
          
          let scoringResult
          try {
            const { analyzeProgressively } = await import('@/lib/analysis/progressive-analyzer')
            
            const progressiveResult = await analyzeProgressively(
              parsedResume,
              parsedJD,
              extractedText,
              undefined,
              (progress) => {
                // Update message from progressive analyzer
                progressManager.updateMessage(progress.message)
              }
            )
            
            // Use enhanced result if available, otherwise basic
            scoringResult = progressiveResult.enhancedResult || progressiveResult.basicResult
            
          } catch (progressiveError) {
            console.warn('Progressive analysis failed, using standard scoring:', progressiveError)
            
            // Fallback to standard scoring
            const { calculateMatchScore } = await import('@/lib/ai/scoring')
            scoringResult = await calculateMatchScore(
              parsedResume,
              parsedJD,
              resumeEmbedding,
              jdEmbedding,
              extractedText
            )
          }
          
          progressManager.completeStage()
          
          // Stage 6: AI Enhancement - Generate insights
          progressManager.startStage(PROGRESS_STAGES[5], 'Generating AI-powered insights...')
          
          try {
            const { enhanceInsightsWithAI } = await import('@/lib/ai/scoring')
            const enhanced = await enhanceInsightsWithAI(
              parsedResume,
              parsedJD,
              scoringResult.keywordAnalysis,
              scoringResult.scores,
              scoringResult.insights,
              scoringResult.recommendations
            )
            
            // Use enhanced insights and recommendations
            scoringResult.insights = enhanced.insights
            scoringResult.recommendations = enhanced.recommendations
          } catch (enhanceError) {
            console.warn('AI insights enhancement failed, using base insights:', enhanceError)
            // Continue with base insights
          }
          
          progressManager.completeStage()
          
          // Stage 7: Complete - Save analysis
          progressManager.startStage(PROGRESS_STAGES[6], 'Saving analysis...')
          
          // Create analysis from scoring result
          const analysisData: Omit<Analysis, 'id'> = {
            resumeId,
            jobDescriptionId: jdId,
            createdAt: new Date(),
            scores: scoringResult.scores,
            recommendations: scoringResult.recommendations,
            insights: scoringResult.insights,
            radarData: scoringResult.radarData,
            atsIssues: scoringResult.atsIssues.map(issue => ({
              type: issue.category === 'structure' ? 'structure' : issue.category === 'content' ? 'content' : 'format',
              severity: issue.type,
              message: issue.message,
              fix: issue.fix
            }))
          }
          
          const analysisId = await analysisOps.create(analysisData)
          
          const savedAnalysis = await analysisOps.get(analysisId)
          if (savedAnalysis) {
            set({ currentAnalysis: savedAnalysis })
          }
          
          progressManager.updateMessage('Analysis complete!')
          progressManager.completeStage()
          
        } catch (error: any) {
          console.error('Analysis failed:', error)
          setError(error.message || 'Failed to analyze resume')
          // Reset progress manager on error
          progressManager.reset()
        } finally {
          set({ isAnalyzing: false })
          // Ensure cleanup happens
          progressManager.reset()
        }
      },

      // Load existing analysis
      loadAnalysis: async (analysisId) => {
        try {
          set({ isAnalyzing: true, error: null })
          
          const details = await analysisOps.getWithDetails(analysisId)
          
          if (!details) {
            throw new Error('Analysis not found')
          }
          
          set({
            currentAnalysis: details.analysis,
            currentResume: details.resume,
            currentJobDescription: details.jobDescription,
            isAnalyzing: false
          })
        } catch (error: any) {
          console.error('Failed to load analysis:', error)
          set({
            error: error.message || 'Failed to load analysis',
            isAnalyzing: false
          })
        }
      },

      // Update analysis progress
      updateProgress: (step, percentage, message, estimatedTimeRemaining = 0) => {
        set({
          analysisProgress: { step, percentage, message, estimatedTimeRemaining }
        })
      },
      
      // Update analysis capabilities
      updateCapabilities: (capabilities) => {
        set((state) => ({
          analysisCapabilities: {
            ...state.analysisCapabilities,
            ...capabilities
          }
        }))
      },

      // Error handling
      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Reset entire state
      reset: () => {
        set(initialState)
      }
    }),
    { name: 'AnalysisStore' }
  )
)

/**
 * Selectors for common state access patterns
 */
export const analysisSelectors = {
  // Check if ready to analyze
  isReadyToAnalyze: (state: AnalysisState) => 
    state.currentResume !== null && state.currentJobDescription !== null,
  
  // Check if analysis is in progress
  isAnalysisInProgress: (state: AnalysisState) =>
    state.isAnalyzing || state.isParsing || state.isGeneratingRecommendations,
  
  // Get current progress percentage
  getProgressPercentage: (state: AnalysisState) =>
    state.analysisProgress.percentage,
  
  // Check if analysis is complete
  isAnalysisComplete: (state: AnalysisState) =>
    state.currentAnalysis !== null && state.analysisProgress.step === 'complete',
  
  // Get overall match score
  getMatchScore: (state: AnalysisState) =>
    state.currentAnalysis?.scores.total ?? 0,
  
  // Get high priority recommendations
  getHighPriorityRecommendations: (state: AnalysisState) =>
    state.currentAnalysis?.recommendations.filter(r => r.priority === 'high') ?? []
}
