/**
 * Unit tests for chat store
 * Tests actions, state management, and error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useChatStore } from '../chat-store'

// Mock fetch globally
global.fetch = vi.fn()

// Mock IndexedDB operations
vi.mock('@/lib/db', () => ({
  db: {
    analyses: {
      get: vi.fn(),
    },
    resumes: {
      get: vi.fn(),
    },
    jobDescriptions: {
      get: vi.fn(),
    },
  },
  chatOps: {
    getByAnalysis: vi.fn(),
    create: vi.fn(),
  },
  analysisOps: {
    deleteOlderThan: vi.fn(),
  },
  getStorageInfo: vi.fn(),
  QuotaExceededError: class QuotaExceededError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'QuotaExceededError'
    }
  },
}))

describe('useChatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      messages: [],
      currentAnalysisId: null,
      isSending: false,
      error: null,
      isOpen: false,
      cachedContext: null,
      rateLimitCountdown: null,
      quotaExceeded: false,
      isOffline: false,
      messageQueue: [],
      abortController: null,
    })
    
    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Sidebar state management', () => {
    it('toggles sidebar open/closed', () => {
      const { toggleSidebar } = useChatStore.getState()
      
      expect(useChatStore.getState().isOpen).toBe(false)
      
      toggleSidebar()
      expect(useChatStore.getState().isOpen).toBe(true)
      
      toggleSidebar()
      expect(useChatStore.getState().isOpen).toBe(false)
    })

    it('opens sidebar', () => {
      const { openSidebar } = useChatStore.getState()
      
      openSidebar()
      expect(useChatStore.getState().isOpen).toBe(true)
    })

    it('closes sidebar', () => {
      const { openSidebar, closeSidebar } = useChatStore.getState()
      
      openSidebar()
      expect(useChatStore.getState().isOpen).toBe(true)
      
      closeSidebar()
      expect(useChatStore.getState().isOpen).toBe(false)
    })
  })

  describe('Message management', () => {
    it('adds message to state', () => {
      const { addMessage } = useChatStore.getState()
      
      const message: any = {
        id: 1,
        role: 'user',
        content: 'Test message',
        timestamp: new Date(),
        analysisId: 1,
        sessionId: 'session-1',
      }
      
      addMessage(message)
      
      const { messages } = useChatStore.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0]).toEqual(message)
    })

    it('clears history', () => {
      const { addMessage, clearHistory } = useChatStore.getState()
      
      addMessage({
        id: 1,
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
        analysisId: 1,
        sessionId: 'session-1',
      } as any)
      
      expect(useChatStore.getState().messages).toHaveLength(1)
      
      clearHistory()
      
      expect(useChatStore.getState().messages).toHaveLength(0)
      expect(useChatStore.getState().error).toBeNull()
    })
  })

  describe('Error handling', () => {
    it('clears error', () => {
      useChatStore.setState({ error: 'Test error' })
      
      const { clearError } = useChatStore.getState()
      clearError()
      
      expect(useChatStore.getState().error).toBeNull()
    })

    it('sets error when no analysis is selected', async () => {
      const { sendMessage } = useChatStore.getState()
      
      await sendMessage('Test message')
      
      const { error, isSending } = useChatStore.getState()
      expect(error).toContain('upload and analyze a resume')
      expect(isSending).toBe(false)
    })
  })

  describe('Rate limiting', () => {
    it('sets rate limit countdown', () => {
      const { setRateLimitCountdown } = useChatStore.getState()
      
      setRateLimitCountdown(60)
      expect(useChatStore.getState().rateLimitCountdown).toBe(60)
      
      setRateLimitCountdown(null)
      expect(useChatStore.getState().rateLimitCountdown).toBeNull()
    })
  })

  describe('Offline handling', () => {
    it('sets offline status', () => {
      const { setOfflineStatus } = useChatStore.getState()
      
      setOfflineStatus(true)
      expect(useChatStore.getState().isOffline).toBe(true)
      
      setOfflineStatus(false)
      expect(useChatStore.getState().isOffline).toBe(false)
    })

    it('queues message when offline', async () => {
      const { setOfflineStatus, sendMessage } = useChatStore.getState()
      
      setOfflineStatus(true)
      useChatStore.setState({ currentAnalysisId: 1 })
      
      await sendMessage('Test message')
      
      const { messageQueue, error } = useChatStore.getState()
      expect(messageQueue).toHaveLength(1)
      expect(messageQueue[0].content).toBe('Test message')
      expect(error).toContain('offline')
    })
  })

  describe('Analysis switching', () => {
    it('clears state when switching analyses', () => {
      const { setCurrentAnalysis } = useChatStore.getState()
      
      // Set up initial state
      useChatStore.setState({
        currentAnalysisId: 1,
        messages: [
          {
            id: 1,
            role: 'user',
            content: 'Old message',
            timestamp: new Date(),
            analysisId: 1,
            sessionId: 'session-1',
          } as any,
        ],
        error: 'Old error',
        cachedContext: {
          analysisId: 1,
          context: {},
          timestamp: Date.now(),
        },
      })
      
      // Switch to new analysis
      setCurrentAnalysis(2)
      
      const state = useChatStore.getState()
      expect(state.currentAnalysisId).toBe(2)
      expect(state.messages).toHaveLength(0)
      expect(state.error).toBeNull()
      expect(state.cachedContext).toBeNull()
    })

    it('does not clear state when setting same analysis', () => {
      const { setCurrentAnalysis } = useChatStore.getState()
      
      // Set up initial state
      useChatStore.setState({
        currentAnalysisId: 1,
        messages: [
          {
            id: 1,
            role: 'user',
            content: 'Message',
            timestamp: new Date(),
            analysisId: 1,
            sessionId: 'session-1',
          } as any,
        ],
      })
      
      // Set same analysis
      setCurrentAnalysis(1)
      
      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(1)
    })
  })

  describe('Storage quota', () => {
    it('checks storage quota', async () => {
      const { getStorageInfo } = await import('@/lib/db')
      
      vi.mocked(getStorageInfo).mockResolvedValue({
        usage: 950,
        quota: 1000,
        percentage: 95,
      } as any)
      
      const { checkStorageQuota } = useChatStore.getState()
      await checkStorageQuota()
      
      const { quotaExceeded, error } = useChatStore.getState()
      expect(quotaExceeded).toBe(true)
      expect(error).toContain('Storage is nearly full')
    })

    it('clears old conversations', async () => {
      const { analysisOps } = await import('@/lib/db')
      
      vi.mocked(analysisOps.deleteOlderThan).mockResolvedValue(5)
      
      useChatStore.setState({ 
        quotaExceeded: true, 
        error: 'Storage full',
        currentAnalysisId: 1,
      })
      
      const { clearOldConversations } = useChatStore.getState()
      const deletedCount = await clearOldConversations(30)
      
      expect(deletedCount).toBe(5)
      expect(useChatStore.getState().quotaExceeded).toBe(false)
      expect(useChatStore.getState().error).toBeNull()
    })
  })

  describe('Context caching', () => {
    it('refreshes context cache', async () => {
      const { db } = await import('@/lib/db')
      
      const mockAnalysis = {
        id: 1,
        resumeId: 1,
        jobDescriptionId: 1,
        scores: { total: 85, keyword: 80, semantic: 90, format: 85, ats: 88 },
        insights: {
          gaps: ['Python', 'Docker'],
          strengths: ['JavaScript', 'React'],
          missingKeywords: ['agile', 'scrum'],
        },
        atsIssues: [
          { type: 'format', severity: 'critical', message: 'Missing dates' },
        ],
        recommendations: [
          {
            type: 'keyword',
            priority: 'high',
            suggestedText: 'Add Python',
            explanation: 'Required skill',
          },
        ],
      }
      
      const mockResume = {
        id: 1,
        sections: { summary: 'Experienced developer' },
      }
      
      const mockJobDesc = {
        id: 1,
        title: 'Software Engineer',
        company: 'Tech Corp',
      }
      
      vi.mocked(db.analyses.get).mockResolvedValue(mockAnalysis as any)
      vi.mocked(db.resumes.get).mockResolvedValue(mockResume as any)
      vi.mocked(db.jobDescriptions.get).mockResolvedValue(mockJobDesc as any)
      
      const { refreshContextCache } = useChatStore.getState()
      await refreshContextCache(1)
      
      const { cachedContext } = useChatStore.getState()
      expect(cachedContext).not.toBeNull()
      expect(cachedContext?.analysisId).toBe(1)
      expect(cachedContext?.context.job_title).toBe('Software Engineer')
      expect(cachedContext?.context.scores?.total).toBe(85)
    })

    it('uses cached context when valid', async () => {
      const { db } = await import('@/lib/db')
      
      // Set up cached context
      useChatStore.setState({
        cachedContext: {
          analysisId: 1,
          context: { job_title: 'Cached Job' },
          timestamp: Date.now(),
        },
      })
      
      const { getContextFromCache } = useChatStore.getState()
      const context = await getContextFromCache(1)
      
      expect(context.job_title).toBe('Cached Job')
      // Should not call database
      expect(db.analyses.get).not.toHaveBeenCalled()
    })
  })
})
