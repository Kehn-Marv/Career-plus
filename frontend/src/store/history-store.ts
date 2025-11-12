import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Analysis, Resume, JobDescription } from '@/lib/db'
import { analysisOps, resumeOps, jobDescriptionOps, clearAllData } from '@/lib/db'

/**
 * Analysis with related data for display
 */
export interface AnalysisHistoryItem {
  analysis: Analysis
  resume: Resume
  jobDescription: JobDescription
}

/**
 * Sort options for history
 */
export type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc' | 'title'

/**
 * Filter options for history
 */
export interface HistoryFilters {
  searchQuery: string
  minScore?: number
  maxScore?: number
  dateFrom?: Date
  dateTo?: Date
}

/**
 * History state interface
 */
interface HistoryState {
  // Data
  analyses: AnalysisHistoryItem[]
  filteredAnalyses: AnalysisHistoryItem[]
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Filters and sorting
  sortBy: SortOption
  filters: HistoryFilters
  
  // Selection
  selectedAnalysisIds: number[]
}

/**
 * History actions interface
 */
interface HistoryActions {
  // Load data
  loadHistory: () => Promise<void>
  refreshHistory: () => Promise<void>
  
  // Delete operations
  deleteAnalysis: (id: number) => Promise<void>
  deleteMultiple: (ids: number[]) => Promise<void>
  clearAll: () => Promise<void>
  
  // Sorting
  setSortBy: (sortBy: SortOption) => void
  
  // Filtering
  setFilters: (filters: Partial<HistoryFilters>) => void
  clearFilters: () => void
  applyFilters: () => void
  
  // Selection
  selectAnalysis: (id: number) => void
  deselectAnalysis: (id: number) => void
  selectAll: () => void
  deselectAll: () => void
  toggleSelection: (id: number) => void
  
  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
}

/**
 * Initial state
 */
const initialState: HistoryState = {
  analyses: [],
  filteredAnalyses: [],
  isLoading: false,
  error: null,
  sortBy: 'date-desc',
  filters: {
    searchQuery: ''
  },
  selectedAnalysisIds: []
}

/**
 * History store
 * Manages analysis history, filtering, and sorting
 */
export const useHistoryStore = create<HistoryState & HistoryActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Load history
      loadHistory: async () => {
        try {
          set({ isLoading: true, error: null })
          
          const analyses = await analysisOps.getAll()
          
          // Load related resume and JD for each analysis
          const historyItems: AnalysisHistoryItem[] = []
          
          for (const analysis of analyses) {
            const [resume, jobDescription] = await Promise.all([
              resumeOps.get(analysis.resumeId),
              jobDescriptionOps.get(analysis.jobDescriptionId)
            ])
            
            if (resume && jobDescription) {
              historyItems.push({ analysis, resume, jobDescription })
            }
          }
          
          set({ 
            analyses: historyItems,
            filteredAnalyses: historyItems,
            isLoading: false 
          })
          
          // Apply current sorting
          get().setSortBy(get().sortBy)
          
        } catch (error: any) {
          console.error('Failed to load history:', error)
          set({ 
            error: error.message || 'Failed to load history',
            isLoading: false 
          })
        }
      },

      // Refresh history (reload from database)
      refreshHistory: async () => {
        await get().loadHistory()
      },

      // Delete single analysis
      deleteAnalysis: async (id) => {
        try {
          set({ isLoading: true, error: null })
          
          await analysisOps.delete(id)
          
          // Remove from state
          const analyses = get().analyses.filter(item => item.analysis.id !== id)
          set({ analyses, isLoading: false })
          
          // Reapply filters
          get().applyFilters()
          
        } catch (error: any) {
          console.error('Failed to delete analysis:', error)
          set({ 
            error: error.message || 'Failed to delete analysis',
            isLoading: false 
          })
        }
      },

      // Delete multiple analyses
      deleteMultiple: async (ids) => {
        try {
          set({ isLoading: true, error: null })
          
          await Promise.all(ids.map(id => analysisOps.delete(id)))
          
          // Remove from state
          const analyses = get().analyses.filter(
            item => !ids.includes(item.analysis.id!)
          )
          set({ 
            analyses,
            selectedAnalysisIds: [],
            isLoading: false 
          })
          
          // Reapply filters
          get().applyFilters()
          
        } catch (error: any) {
          console.error('Failed to delete analyses:', error)
          set({ 
            error: error.message || 'Failed to delete analyses',
            isLoading: false 
          })
        }
      },

      // Clear all data
      clearAll: async () => {
        try {
          set({ isLoading: true, error: null })
          
          await clearAllData()
          
          set({ 
            analyses: [],
            filteredAnalyses: [],
            selectedAnalysisIds: [],
            isLoading: false 
          })
          
        } catch (error: any) {
          console.error('Failed to clear data:', error)
          set({ 
            error: error.message || 'Failed to clear data',
            isLoading: false 
          })
        }
      },

      // Set sort option
      setSortBy: (sortBy) => {
        set({ sortBy })
        
        const { filteredAnalyses } = get()
        const sorted = [...filteredAnalyses].sort((a, b) => {
          switch (sortBy) {
            case 'date-desc':
              return b.analysis.createdAt.getTime() - a.analysis.createdAt.getTime()
            
            case 'date-asc':
              return a.analysis.createdAt.getTime() - b.analysis.createdAt.getTime()
            
            case 'score-desc':
              return b.analysis.scores.total - a.analysis.scores.total
            
            case 'score-asc':
              return a.analysis.scores.total - b.analysis.scores.total
            
            case 'title':
              return a.jobDescription.title.localeCompare(b.jobDescription.title)
            
            default:
              return 0
          }
        })
        
        set({ filteredAnalyses: sorted })
      },

      // Set filters
      setFilters: (newFilters) => {
        const currentFilters = get().filters
        set({ 
          filters: { ...currentFilters, ...newFilters }
        })
        get().applyFilters()
      },

      // Clear filters
      clearFilters: () => {
        set({ 
          filters: { searchQuery: '' }
        })
        get().applyFilters()
      },

      // Apply filters
      applyFilters: () => {
        const { analyses, filters } = get()
        
        let filtered = [...analyses]
        
        // Search query filter
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          filtered = filtered.filter(item => 
            item.jobDescription.title.toLowerCase().includes(query) ||
            item.jobDescription.company?.toLowerCase().includes(query) ||
            item.resume.fileName.toLowerCase().includes(query)
          )
        }
        
        // Score range filter
        if (filters.minScore !== undefined) {
          filtered = filtered.filter(item => 
            item.analysis.scores.total >= filters.minScore!
          )
        }
        
        if (filters.maxScore !== undefined) {
          filtered = filtered.filter(item => 
            item.analysis.scores.total <= filters.maxScore!
          )
        }
        
        // Date range filter
        if (filters.dateFrom) {
          filtered = filtered.filter(item => 
            item.analysis.createdAt >= filters.dateFrom!
          )
        }
        
        if (filters.dateTo) {
          filtered = filtered.filter(item => 
            item.analysis.createdAt <= filters.dateTo!
          )
        }
        
        set({ filteredAnalyses: filtered })
        
        // Reapply sorting
        get().setSortBy(get().sortBy)
      },

      // Selection management
      selectAnalysis: (id) => {
        const selected = get().selectedAnalysisIds
        if (!selected.includes(id)) {
          set({ selectedAnalysisIds: [...selected, id] })
        }
      },

      deselectAnalysis: (id) => {
        const selected = get().selectedAnalysisIds
        set({ selectedAnalysisIds: selected.filter(sid => sid !== id) })
      },

      selectAll: () => {
        const ids = get().filteredAnalyses
          .map(item => item.analysis.id!)
          .filter(id => id !== undefined)
        set({ selectedAnalysisIds: ids })
      },

      deselectAll: () => {
        set({ selectedAnalysisIds: [] })
      },

      toggleSelection: (id) => {
        const selected = get().selectedAnalysisIds
        if (selected.includes(id)) {
          get().deselectAnalysis(id)
        } else {
          get().selectAnalysis(id)
        }
      },

      // Error handling
      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    { name: 'HistoryStore' }
  )
)

/**
 * Selectors for common state access patterns
 */
export const historySelectors = {
  // Get total count
  getTotalCount: (state: HistoryState) => state.analyses.length,
  
  // Get filtered count
  getFilteredCount: (state: HistoryState) => state.filteredAnalyses.length,
  
  // Check if filters are active
  hasActiveFilters: (state: HistoryState) => {
    const { filters } = state
    return !!(
      filters.searchQuery ||
      filters.minScore !== undefined ||
      filters.maxScore !== undefined ||
      filters.dateFrom ||
      filters.dateTo
    )
  },
  
  // Get selected count
  getSelectedCount: (state: HistoryState) => state.selectedAnalysisIds.length,
  
  // Check if all are selected
  isAllSelected: (state: HistoryState) => 
    state.selectedAnalysisIds.length === state.filteredAnalyses.length &&
    state.filteredAnalyses.length > 0,
  
  // Get average score
  getAverageScore: (state: HistoryState) => {
    if (state.analyses.length === 0) return 0
    const total = state.analyses.reduce((sum, item) => sum + item.analysis.scores.total, 0)
    return Math.round(total / state.analyses.length)
  },
  
  // Get recent analyses (last 7 days)
  getRecentAnalyses: (state: HistoryState) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return state.analyses.filter(item => item.analysis.createdAt >= sevenDaysAgo)
  }
}
