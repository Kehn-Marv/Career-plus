/**
 * Unit tests for optimization store
 * Tests actions, state management, and error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useOptimizationStore, optimizationSelectors } from '../optimization-store'

// Mock the orchestrator
vi.mock('@/lib/orchestrator/orchestrator', () => ({
  resumeOptimizationOrchestrator: {
    setProgressCallback: vi.fn(),
    optimizeResume: vi.fn(),
    exportToPDF: vi.fn(),
    applyRegionalLocalization: vi.fn(),
  },
}))

// Mock template engine
vi.mock('@/lib/templates/template-engine', () => ({
  templateEngine: {
    getTemplate: vi.fn(),
  },
}))

// Mock PDF generator
vi.mock('@/lib/pdf/pdf-generator', () => ({
  pdfGenerator: {
    downloadPDF: vi.fn(),
  },
}))

// Mock database operations
vi.mock('@/lib/db/optimized-resume-operations', () => ({
  getLatestOptimizedResume: vi.fn(),
  getOptimizedResumeById: vi.fn(),
  getOptimizedResumesByAnalysisId: vi.fn(),
}))

describe('useOptimizationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useOptimizationStore.setState({
      currentOptimizedResume: null,
      selectedTemplate: null,
      isOptimizing: false,
      isGeneratingPDF: false,
      isApplyingLocalization: false,
      optimizationProgress: {
        step: 'idle',
        percentage: 0,
        message: '',
      },
      versions: [],
      error: null,
    })
    
    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('State initialization', () => {
    it('initializes with default state', () => {
      const state = useOptimizationStore.getState()
      
      expect(state.currentOptimizedResume).toBeNull()
      expect(state.selectedTemplate).toBeNull()
      expect(state.isOptimizing).toBe(false)
      expect(state.isGeneratingPDF).toBe(false)
      expect(state.isApplyingLocalization).toBe(false)
      expect(state.optimizationProgress.step).toBe('idle')
      expect(state.versions).toEqual([])
      expect(state.error).toBeNull()
    })
  })

  describe('Template selection', () => {
    it('selects a valid template', () => {
      const { templateEngine } = require('@/lib/templates/template-engine')
      const mockTemplate = {
        id: 'modern-professional',
        name: 'Modern Professional',
        atsScore: 95,
      }
      
      vi.mocked(templateEngine.getTemplate).mockReturnValue(mockTemplate)
      
      const { selectTemplate } = useOptimizationStore.getState()
      selectTemplate('modern-professional')
      
      const state = useOptimizationStore.getState()
      expect(state.selectedTemplate).toEqual(mockTemplate)
      expect(state.error).toBeNull()
    })

    it('sets error for invalid template', () => {
      const { templateEngine } = require('@/lib/templates/template-engine')
      vi.mocked(templateEngine.getTemplate).mockReturnValue(null)
      
      const { selectTemplate } = useOptimizationStore.getState()
      selectTemplate('invalid-template')
      
      const state = useOptimizationStore.getState()
      expect(state.selectedTemplate).toBeNull()
      expect(state.error).toContain('Template not found')
    })
  })

  describe('Error handling', () => {
    it('sets error', () => {
      const { setError } = useOptimizationStore.getState()
      
      setError('Test error')
      expect(useOptimizationStore.getState().error).toBe('Test error')
    })

    it('clears error', () => {
      useOptimizationStore.setState({ error: 'Test error' })
      
      const { clearError } = useOptimizationStore.getState()
      clearError()
      
      expect(useOptimizationStore.getState().error).toBeNull()
    })
  })

  describe('Reset', () => {
    it('resets to initial state', () => {
      // Set some state
      useOptimizationStore.setState({
        currentOptimizedResume: { id: 1 } as any,
        selectedTemplate: { id: 'test' } as any,
        isOptimizing: true,
        error: 'Test error',
        versions: [{ id: 1 } as any],
      })
      
      const { reset } = useOptimizationStore.getState()
      reset()
      
      const state = useOptimizationStore.getState()
      expect(state.currentOptimizedResume).toBeNull()
      expect(state.selectedTemplate).toBeNull()
      expect(state.isOptimizing).toBe(false)
      expect(state.error).toBeNull()
      expect(state.versions).toEqual([])
    })
  })

  describe('Selectors', () => {
    it('hasOptimizedResume returns correct value', () => {
      let state = useOptimizationStore.getState()
      expect(optimizationSelectors.hasOptimizedResume(state)).toBe(false)
      
      useOptimizationStore.setState({
        currentOptimizedResume: { id: 1 } as any,
      })
      
      state = useOptimizationStore.getState()
      expect(optimizationSelectors.hasOptimizedResume(state)).toBe(true)
    })

    it('isOptimizationInProgress returns correct value', () => {
      let state = useOptimizationStore.getState()
      expect(optimizationSelectors.isOptimizationInProgress(state)).toBe(false)
      
      useOptimizationStore.setState({ isOptimizing: true })
      state = useOptimizationStore.getState()
      expect(optimizationSelectors.isOptimizationInProgress(state)).toBe(true)
      
      useOptimizationStore.setState({ isOptimizing: false, isGeneratingPDF: true })
      state = useOptimizationStore.getState()
      expect(optimizationSelectors.isOptimizationInProgress(state)).toBe(true)
    })

    it('getProgressPercentage returns correct value', () => {
      useOptimizationStore.setState({
        optimizationProgress: { step: 'applying', percentage: 50, message: 'Test' },
      })
      
      const state = useOptimizationStore.getState()
      expect(optimizationSelectors.getProgressPercentage(state)).toBe(50)
    })

    it('getVersionCount returns correct value', () => {
      useOptimizationStore.setState({
        versions: [
          { id: 1, version: 1 } as any,
          { id: 2, version: 2 } as any,
        ],
      })
      
      const state = useOptimizationStore.getState()
      expect(optimizationSelectors.getVersionCount(state)).toBe(2)
    })

    it('getAppliedFixesCount returns correct value', () => {
      useOptimizationStore.setState({
        currentOptimizedResume: {
          appliedFixes: {
            recommendationIds: ['1', '2', '3'],
            atsIssuesFixes: ['4', '5'],
            biasFixesApplied: 2,
            localizationApplied: true,
          },
        } as any,
      })
      
      const state = useOptimizationStore.getState()
      // 3 recommendations + 2 ATS + 2 bias + 1 localization = 8
      expect(optimizationSelectors.getAppliedFixesCount(state)).toBe(8)
    })

    it('isLocalizationApplied returns correct value', () => {
      let state = useOptimizationStore.getState()
      expect(optimizationSelectors.isLocalizationApplied(state)).toBe(false)
      
      useOptimizationStore.setState({
        currentOptimizedResume: {
          appliedFixes: {
            recommendationIds: [],
            atsIssuesFixes: [],
            biasFixesApplied: 0,
            localizationApplied: true,
          },
        } as any,
      })
      
      state = useOptimizationStore.getState()
      expect(optimizationSelectors.isLocalizationApplied(state)).toBe(true)
    })

    it('getCurrentRegion returns correct value', () => {
      useOptimizationStore.setState({
        currentOptimizedResume: {
          region: 'US',
        } as any,
      })
      
      const state = useOptimizationStore.getState()
      expect(optimizationSelectors.getCurrentRegion(state)).toBe('US')
    })
  })

  describe('Version management', () => {
    it('loads version history', async () => {
      const { getOptimizedResumesByAnalysisId } = require('@/lib/db/optimized-resume-operations')
      const mockVersions = [
        { id: 1, version: 1 },
        { id: 2, version: 2 },
      ]
      
      vi.mocked(getOptimizedResumesByAnalysisId).mockResolvedValue(mockVersions)
      
      const { loadVersionHistory } = useOptimizationStore.getState()
      await loadVersionHistory(1)
      
      const state = useOptimizationStore.getState()
      expect(state.versions).toEqual(mockVersions)
      expect(state.error).toBeNull()
    })

    it('restores version', async () => {
      const { getOptimizedResumeById } = require('@/lib/db/optimized-resume-operations')
      const mockVersion = { id: 1, version: 1 }
      
      vi.mocked(getOptimizedResumeById).mockResolvedValue(mockVersion)
      
      const { restoreVersion } = useOptimizationStore.getState()
      await restoreVersion(1)
      
      const state = useOptimizationStore.getState()
      expect(state.currentOptimizedResume).toEqual(mockVersion)
      expect(state.error).toBeNull()
    })

    it('loads latest optimized resume', async () => {
      const { getLatestOptimizedResume } = require('@/lib/db/optimized-resume-operations')
      const mockResume = { id: 1, version: 3 }
      
      vi.mocked(getLatestOptimizedResume).mockResolvedValue(mockResume)
      
      const { loadLatestOptimizedResume } = useOptimizationStore.getState()
      await loadLatestOptimizedResume(1)
      
      const state = useOptimizationStore.getState()
      expect(state.currentOptimizedResume).toEqual(mockResume)
      expect(state.error).toBeNull()
    })
  })
})
