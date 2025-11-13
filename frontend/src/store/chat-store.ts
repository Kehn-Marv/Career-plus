/**
 * Chat Store
 * Manages chat state and AI interactions using Zustand
 */

import { create } from 'zustand'
import { db, QuotaExceededError, getStorageInfo, chatOps, analysisOps } from '@/lib/db'
import type { ChatMessage } from '@/types/analysis'

/**
 * Context object sent to backend for AI chat
 */
interface ChatContext {
  job_title?: string
  job_company?: string
  job_description?: string
  resume_summary?: string
  scores?: {
    total: number
    keyword: number
    semantic: number
    format: number
    ats: number
  }
  gaps?: string[]
  strengths?: string[]
  missing_keywords?: string[]
  ats_issues?: Array<{
    type: string
    severity: string
    message: string
  }>
  recommendations?: Array<{
    type: string
    priority: string
    suggestedText: string
    explanation: string
  }>
}

/**
 * Cached context to avoid repeated IndexedDB queries
 */
interface CachedContext {
  analysisId: number
  context: ChatContext
  timestamp: number
}

interface QueuedMessage {
  content: string
  timestamp: number
}

interface ChatStore {
  messages: ChatMessage[]
  currentAnalysisId: number | null
  isSending: boolean
  error: string | null
  isOpen: boolean
  cachedContext: CachedContext | null
  rateLimitCountdown: number | null
  quotaExceeded: boolean
  isOffline: boolean
  messageQueue: QueuedMessage[]
  abortController: AbortController | null
  
  // Actions
  sendMessage: (content: string) => Promise<void>
  loadHistory: (analysisId: number) => Promise<void>
  clearHistory: () => void
  setCurrentAnalysis: (analysisId: number) => void
  addMessage: (message: ChatMessage) => void
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  clearError: () => void
  setRateLimitCountdown: (seconds: number | null) => void
  clearOldConversations: (days: number) => Promise<number>
  checkStorageQuota: () => Promise<void>
  setOfflineStatus: (isOffline: boolean) => void
  processMessageQueue: () => Promise<void>
  refreshContextCache: (analysisId: number) => Promise<void>
  getContextFromCache: (analysisId: number) => Promise<ChatContext>
}

export const useChatStore = create<ChatStore>((set, get) => ({
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
  
  toggleSidebar: () => {
    set(state => ({ isOpen: !state.isOpen }))
  },
  
  openSidebar: () => {
    set({ isOpen: true })
  },
  
  closeSidebar: () => {
    set({ isOpen: false })
  },
  
  setRateLimitCountdown: (seconds: number | null) => {
    set({ rateLimitCountdown: seconds })
  },
  
  setOfflineStatus: (isOffline: boolean) => {
    set({ isOffline })
    
    // When coming back online, process queued messages
    if (!isOffline && get().messageQueue.length > 0) {
      get().processMessageQueue()
    }
  },
  
  processMessageQueue: async () => {
    const { messageQueue } = get()
    
    if (messageQueue.length === 0) return
    
    // Process messages one at a time
    for (const queuedMessage of messageQueue) {
      try {
        // Remove from queue
        set(state => ({
          messageQueue: state.messageQueue.filter(m => m.timestamp !== queuedMessage.timestamp)
        }))
        
        // Send the message
        await get().sendMessage(queuedMessage.content)
        
        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Failed to send queued message:', error)
        // Stop processing if there's an error
        break
      }
    }
  },
  
  checkStorageQuota: async () => {
    try {
      const storageInfo = await getStorageInfo()
      // Check if storage is over 90% full
      if (storageInfo.percentage > 90) {
        set({ 
          quotaExceeded: true,
          error: 'Storage is nearly full. Please clear old conversations to continue.'
        })
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error)
    }
  },
  
  clearOldConversations: async (days: number) => {
    try {
      const deletedCount = await analysisOps.deleteOlderThan(days)
      
      // Reload current conversation if it still exists
      const { currentAnalysisId } = get()
      if (currentAnalysisId) {
        await get().loadHistory(currentAnalysisId)
      }
      
      // Reset quota exceeded flag
      set({ quotaExceeded: false, error: null })
      
      return deletedCount
    } catch (error) {
      console.error('Failed to clear old conversations:', error)
      throw error
    }
  },
  
  setCurrentAnalysis: (analysisId: number) => {
    const previousAnalysisId = get().currentAnalysisId
    const { abortController } = get()
    
    // Clean up when switching analyses
    if (previousAnalysisId !== null && previousAnalysisId !== analysisId) {
      // Abort any in-flight requests
      if (abortController) {
        abortController.abort()
      }
      
      set({ 
        messages: [], 
        cachedContext: null,
        error: null,
        quotaExceeded: false,
        isSending: false,
        abortController: null
      })
    }
    
    set({ currentAnalysisId: analysisId })
    get().loadHistory(analysisId)
  },
  
  loadHistory: async (analysisId: number) => {
    try {
      // Load messages from IndexedDB
      const messages = await chatOps.getByAnalysis(analysisId)
      
      set({ messages, error: null })
    } catch (error) {
      console.error('Failed to load chat history:', error)
      set({ error: 'Failed to load chat history' })
    }
  },
  
  addMessage: (message: ChatMessage) => {
    set(state => ({
      messages: [...state.messages, message]
    }))
  },
  
  sendMessage: async (content: string) => {
    const { currentAnalysisId, messages, cachedContext, isOffline, messageQueue } = get()
    
    // Store the analysis ID at the start to detect switches
    const startAnalysisId = currentAnalysisId
    
    // Check if offline - queue the message
    if (isOffline || !navigator.onLine) {
      // Add to queue
      set(state => ({
        messageQueue: [...state.messageQueue, { content, timestamp: Date.now() }],
        error: 'You are offline. Message will be sent when connection is restored.'
      }))
      return
    }
    
    // Check if analysis is selected
    if (!currentAnalysisId) {
      set({ 
        error: 'Please upload and analyze a resume first to get personalized assistance.',
        isSending: false 
      })
      return
    }
    
    set({ isSending: true, error: null })
    
    try {
      // Create user message
      const userMessage: any = {
        role: 'user',
        content,
        timestamp: new Date(),
        analysisId: currentAnalysisId,
        sessionId: `session-${currentAnalysisId}`
      }
      
      // Check if analysis switched before saving
      if (get().currentAnalysisId !== startAnalysisId) {
        console.log('Analysis switched, aborting message send')
        set({ isSending: false })
        return
      }
      
      // Save user message to IndexedDB
      try {
        const userMessageId = await chatOps.create(userMessage)
        userMessage.id = userMessageId
        
        // Check again after async operation
        if (get().currentAnalysisId !== startAnalysisId) {
          console.log('Analysis switched during save, aborting')
          set({ isSending: false })
          return
        }
        
        // Add to state
        get().addMessage(userMessage)
      } catch (error: any) {
        if (error instanceof QuotaExceededError) {
          set({ 
            quotaExceeded: true,
            error: 'Storage is full. Please clear old conversations to continue.',
            isSending: false 
          })
          return
        }
        throw error
      }
      
      // Build comprehensive context from IndexedDB with caching
      // Use the new getContextFromCache method to reduce IndexedDB queries
      const context = await get().getContextFromCache(currentAnalysisId)
      
      // Check if analysis switched before API call
      if (get().currentAnalysisId !== startAnalysisId) {
        console.log('Analysis switched before API call, aborting')
        set({ isSending: false })
        return
      }
      
      // Create abort controller for this request
      const abortController = new AbortController()
      set({ abortController })
      
      // Call chat API
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context,
          conversation_history: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
        signal: abortController.signal
      })
      
      // Clear abort controller
      set({ abortController: null })
      
      // Check if analysis switched during API call
      if (get().currentAnalysisId !== startAnalysisId) {
        console.log('Analysis switched during API call, discarding response')
        set({ isSending: false })
        return
      }
      
      if (!response.ok) {
        if (response.status === 429) {
          // Start 60-second countdown for rate limit
          const startCountdown = () => {
            let countdown = 60
            set({ rateLimitCountdown: countdown })
            
            const interval = setInterval(() => {
              countdown--
              if (countdown <= 0) {
                clearInterval(interval)
                set({ rateLimitCountdown: null })
              } else {
                set({ rateLimitCountdown: countdown })
              }
            }, 1000)
          }
          
          startCountdown()
          throw new Error('Too many requests. Please wait before trying again.')
        } else if (response.status === 503) {
          throw new Error('AI service is temporarily unavailable. Please try again in a moment.')
        } else {
          throw new Error('Failed to get AI response. Please check your connection and try again.')
        }
      }
      
      const data = await response.json()
      
      // Create assistant message
      const assistantMessage: any = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        analysisId: currentAnalysisId,
        sessionId: `session-${currentAnalysisId}`
      }
      
      // Final check before saving assistant message
      if (get().currentAnalysisId !== startAnalysisId) {
        console.log('Analysis switched before saving response, discarding')
        set({ isSending: false })
        return
      }
      
      // Save assistant message to IndexedDB
      try {
        const assistantMessageId = await chatOps.create(assistantMessage)
        assistantMessage.id = assistantMessageId
        
        // Final check after save
        if (get().currentAnalysisId !== startAnalysisId) {
          console.log('Analysis switched after saving response, not adding to state')
          set({ isSending: false })
          return
        }
        
        // Add to state
        get().addMessage(assistantMessage)
      } catch (error: any) {
        if (error instanceof QuotaExceededError) {
          set({ 
            quotaExceeded: true,
            error: 'Storage is full. The response was received but could not be saved. Please clear old conversations.',
            isSending: false 
          })
          return
        }
        throw error
      }
      
      set({ isSending: false })
      
    } catch (error: any) {
      // Don't show error if request was aborted due to analysis switch
      if (error.name === 'AbortError') {
        console.log('Request aborted due to analysis switch')
        set({ isSending: false, abortController: null })
        return
      }
      
      console.error('Failed to send message:', error)
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to send message. Please try again.'
      
      if (error.message.includes('Analysis not found')) {
        errorMessage = 'Analysis not found. Please run the analysis again.'
      } else if (error.message.includes('Resume or job description not found')) {
        errorMessage = 'Resume or job description not found. Please upload them again.'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.'
      } else if (error.message.includes('temporarily unavailable')) {
        errorMessage = 'AI service is temporarily unavailable. Please try again in a moment.'
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      set({ 
        error: errorMessage,
        isSending: false,
        abortController: null
      })
    }
  },
  
  clearHistory: () => {
    set({ messages: [], error: null })
  },
  
  clearError: () => {
    set({ error: null })
  },
  
  /**
   * Refresh the context cache for a specific analysis
   * This should be called when the analysis is updated
   */
  refreshContextCache: async (analysisId: number) => {
    try {
      const analysis = await db.analyses.get(analysisId)
      
      if (!analysis) {
        throw new Error('Analysis not found')
      }
      
      const resume = await db.resumes.get(analysis.resumeId)
      const jobDesc = await db.jobDescriptions.get(analysis.jobDescriptionId)
      
      if (!resume || !jobDesc) {
        throw new Error('Resume or job description not found')
      }
      
      // Build comprehensive context object
      const context: ChatContext = {
        job_title: jobDesc.title || '',
        job_company: jobDesc.company || '',
        resume_summary: resume.sections.summary || '',
        scores: {
          total: analysis.scores.total,
          keyword: analysis.scores.keyword,
          semantic: analysis.scores.semantic,
          format: analysis.scores.format,
          ats: analysis.scores.ats
        },
        gaps: analysis.insights.gaps || [],
        strengths: analysis.insights.strengths || [],
        missing_keywords: analysis.insights.missingKeywords || [],
        ats_issues: analysis.atsIssues.map(issue => ({
          type: issue.type,
          severity: issue.severity,
          message: issue.message
        })),
        recommendations: analysis.recommendations
          .filter(rec => rec.priority === 'high' || rec.priority === 'medium')
          .slice(0, 10)
          .map(rec => ({
            type: rec.type,
            priority: rec.priority,
            suggestedText: rec.suggestedText,
            explanation: rec.explanation
          }))
      }
      
      // Add job description text with error handling
      if (jobDesc.rawText && jobDesc.rawText.trim()) {
        context.job_description = jobDesc.rawText
      } else {
        console.warn('Job description text is empty or missing')
        context.job_description = ''
      }
      
      // Update cache
      set({
        cachedContext: {
          analysisId,
          context,
          timestamp: Date.now()
        }
      })
    } catch (error) {
      console.error('Failed to refresh context cache:', error)
      throw error
    }
  },
  
  /**
   * Get context from cache or fetch from IndexedDB
   * This reduces repeated IndexedDB queries
   */
  getContextFromCache: async (analysisId: number): Promise<ChatContext> => {
    const { cachedContext } = get()
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    
    // Check if we have a valid cached context
    if (
      cachedContext && 
      cachedContext.analysisId === analysisId &&
      Date.now() - cachedContext.timestamp < CACHE_DURATION
    ) {
      return cachedContext.context
    }
    
    // Refresh cache and return
    await get().refreshContextCache(analysisId)
    const updatedCache = get().cachedContext
    
    if (!updatedCache || updatedCache.analysisId !== analysisId) {
      throw new Error('Failed to load context')
    }
    
    return updatedCache.context
  }
}))
