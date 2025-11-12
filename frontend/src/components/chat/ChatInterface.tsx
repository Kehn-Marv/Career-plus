/**
 * ChatInterface Component
 * Interactive chat interface for resume assistance
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Loader, Bot, User, AlertCircle, RefreshCw, Database } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { List } from 'react-window'
import { useChatStore } from '../../store/chat-store'
import { db } from '@/lib/db'

export interface ChatInterfaceProps {
  analysisId?: number
}

export function ChatInterface({ analysisId }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const [showLongWait, setShowLongWait] = useState(false)
  const [contextPrompts, setContextPrompts] = useState<string[]>([])
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<any>(null)
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const longWaitTimerRef = useRef<NodeJS.Timeout | null>(null)

  
  const { 
    messages, 
    sendMessage, 
    isSending, 
    error, 
    clearError, 
    setCurrentAnalysis, 
    rateLimitCountdown,
    quotaExceeded,
    isOffline,
    messageQueue,
    clearOldConversations,
    checkStorageQuota,
    setOfflineStatus
  } = useChatStore()

  // Set current analysis on mount and load context-aware prompts
  useEffect(() => {
    if (analysisId) {
      setCurrentAnalysis(analysisId)
      loadContextAwarePrompts(analysisId)
      checkStorageQuota()
    }
  }, [analysisId, setCurrentAnalysis])
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setOfflineStatus(false)
    const handleOffline = () => setOfflineStatus(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Set initial status
    setOfflineStatus(!navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOfflineStatus])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 100 && listRef.current) {
      // For virtualized list, scroll to the last item
      listRef.current.scrollToRow({ index: messages.length - 1, align: 'end' })
    } else {
      // For regular rendering, use the ref
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Load context-aware prompts based on analysis insights
  const loadContextAwarePrompts = async (analysisId: number) => {
    try {
      const analysis = await db.analyses.get(analysisId)
      if (!analysis) return

      const prompts: string[] = []

      // Check for gaps
      if (analysis.insights.gaps && analysis.insights.gaps.length > 0) {
        const topGap = analysis.insights.gaps[0]
        prompts.push(`How can I address the missing ${topGap} requirement?`)
      }

      // Check for low ATS score
      if (analysis.scores.ats < 70) {
        prompts.push("What ATS issues should I fix first?")
      }

      // Check for missing keywords
      if (analysis.insights.missingKeywords && analysis.insights.missingKeywords.length > 0) {
        prompts.push("How can I incorporate the missing keywords naturally?")
      }

      // Check for low overall score
      if (analysis.scores.total < 70) {
        prompts.push("What are the top 3 things I can do to improve my match score?")
      }

      // Add default prompts if we don't have enough context-specific ones
      if (prompts.length < 4) {
        const defaultPrompts = [
          "Can you explain the gaps in my resume compared to the job requirements?",
          "Can you help me rewrite my professional summary to be more impactful?",
          "What can I do to make my resume more ATS-friendly?",
          "How can I better highlight my relevant experience?"
        ]
        
        // Add defaults that aren't already in the list
        for (const prompt of defaultPrompts) {
          if (prompts.length >= 4) break
          if (!prompts.some(p => p.toLowerCase().includes(prompt.toLowerCase().substring(0, 20)))) {
            prompts.push(prompt)
          }
        }
      }

      setContextPrompts(prompts.slice(0, 4))
    } catch (error) {
      console.error('Failed to load context-aware prompts:', error)
      // Fallback to default prompts
      setContextPrompts([
        "Can you explain the gaps in my resume compared to the job requirements?",
        "What are the top 3 things I can do to improve my match score?",
        "Can you help me rewrite my professional summary to be more impactful?",
        "What can I do to make my resume more ATS-friendly?"
      ])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isSending) return

    const userMessage = input.trim()
    setInput('')
    setIsTyping(true)
    setShowThinking(false)
    setShowLongWait(false)

    // Clear any existing timers
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current)
    }
    if (longWaitTimerRef.current) {
      clearTimeout(longWaitTimerRef.current)
    }

    // Set "Thinking..." after 3 seconds
    thinkingTimerRef.current = setTimeout(() => {
      setShowThinking(true)
    }, 3000)

    // Set "This may take a moment..." after 10 seconds
    longWaitTimerRef.current = setTimeout(() => {
      setShowLongWait(true)
    }, 10000)

    try {
      await sendMessage(userMessage)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsTyping(false)
      setShowThinking(false)
      setShowLongWait(false)
      
      // Clear timers
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
      }
      if (longWaitTimerRef.current) {
        clearTimeout(longWaitTimerRef.current)
      }
    }
  }

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMessage) {
        setInput(lastUserMessage.content)
        clearError()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleClearOldConversations = async (days: number) => {
    setIsClearing(true)
    try {
      const deletedCount = await clearOldConversations(days)
      clearError()
      setShowClearDialog(false)
      
      // Show success message briefly
      alert(`Successfully cleared ${deletedCount} old conversation${deletedCount !== 1 ? 's' : ''}.`)
    } catch (error) {
      console.error('Failed to clear conversations:', error)
      alert('Failed to clear old conversations. Please try again.')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Resume Assistant</h3>
            <p className="text-xs text-gray-600">Ask me anything about your resume</p>
          </div>
        </div>
      </div>

      {/* Messages - ARIA live region for screen readers */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
        aria-label="Chat messages"
      >
        {!analysisId ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              No Analysis Active
            </h4>
            <p className="text-sm text-gray-500 mb-6">
              Please upload and analyze a resume first to get personalized assistance.
            </p>
            <a
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              aria-label="Go to analyze page to upload and analyze a resume"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Analyze Resume
            </a>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              How can I help you today?
            </h4>
            <p className="text-sm text-gray-500 mb-6">
              Ask me about your resume, get suggestions, or request explanations
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {contextPrompts.map((prompt, index) => (
                <SuggestedPrompt
                  key={index}
                  text={prompt}
                  onClick={() => setInput(prompt)}
                />
              ))}
            </div>
          </div>
        ) : messages.length > 100 ? (
          // Use virtualization for long conversations (100+ messages)
          <div style={{ height: messagesContainerRef.current?.clientHeight || 600 }}>
            <List
              listRef={listRef}
              rowCount={messages.length}
              rowHeight={150}
              rowComponent={({ index, style, ariaAttributes }: any) => (
                <div style={style} className="px-4 py-2" {...ariaAttributes}>
                  <MessageBubble message={messages[index]} />
                </div>
              )}
              rowProps={{ messages } as any}
              className="space-y-4"
            />
          </div>
        ) : (
          // Regular rendering for shorter conversations
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex items-start gap-3" role="status" aria-live="polite" aria-label="Assistant is typing">
                <div className="p-2 bg-blue-100 rounded-lg" aria-hidden="true">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex gap-1" aria-hidden="true">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    {showThinking && (
                      <p className="text-xs text-gray-600">Thinking...</p>
                    )}
                    {showLongWait && (
                      <p className="text-xs text-gray-600">This may take a moment...</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {isOffline && (
              <div className="flex items-start gap-3" role="alert" aria-live="assertive">
                <div className="p-2 bg-orange-100 rounded-lg" aria-hidden="true">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800 font-medium mb-1">You are offline</p>
                  <p className="text-xs text-orange-700">
                    {messageQueue.length > 0 
                      ? `${messageQueue.length} message${messageQueue.length !== 1 ? 's' : ''} queued. They will be sent when your connection is restored.`
                      : 'Messages will be sent when your connection is restored.'}
                  </p>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-3" role="alert" aria-live="assertive">
                <div className="p-2 bg-red-100 rounded-lg" aria-hidden="true">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 mb-2">{error}</p>
                  {quotaExceeded ? (
                    <div className="space-y-2">
                      <p className="text-xs text-red-700">Your browser storage is full. Clear old conversations to free up space.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowClearDialog(true)}
                          className="flex items-center gap-2 text-sm text-white bg-red-600 hover:bg-red-700 font-medium px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label="Clear old conversations"
                        >
                          <Database className="w-4 h-4" aria-hidden="true" />
                          Clear Old Data
                        </button>
                      </div>
                    </div>
                  ) : rateLimitCountdown !== null ? (
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center">
                        <span className="text-xs font-bold">{rateLimitCountdown}</span>
                      </div>
                      <span>Please wait {rateLimitCountdown} seconds before trying again</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-2 text-sm text-red-700 hover:text-red-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                      aria-label="Retry sending message"
                    >
                      <RefreshCw className="w-4 h-4" aria-hidden="true" />
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isOffline
                ? "You are offline..."
                : rateLimitCountdown !== null 
                  ? `Please wait ${rateLimitCountdown} seconds...`
                  : analysisId 
                    ? "Ask a question about your resume..." 
                    : "Please analyze a resume first..."
            }
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
            disabled={isSending || !analysisId || rateLimitCountdown !== null || isOffline}
            aria-label="Chat message input"
            aria-describedby="chat-input-help"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending || !analysisId || rateLimitCountdown !== null || isOffline}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title={
              isOffline 
                ? "You are offline"
                : rateLimitCountdown !== null 
                  ? `Please wait ${rateLimitCountdown} seconds` 
                  : 'Send message'
            }
            aria-label={isSending ? 'Sending message' : 'Send message'}
          >
            {isSending ? (
              <Loader className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="sr-only">{isSending ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
        <p id="chat-input-help" className="text-xs text-gray-500 mt-2">
          {isOffline
            ? "You are currently offline. Check your internet connection."
            : rateLimitCountdown !== null 
              ? `Rate limit active. Please wait ${rateLimitCountdown} seconds.`
              : analysisId 
                ? "Press Enter to send, Shift+Enter for new line" 
                : "Upload and analyze a resume to start chatting"}
        </p>
      </div>
      
      {/* Clear Old Conversations Dialog */}
      {showClearDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !isClearing && setShowClearDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Database className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 id="clear-dialog-title" className="text-lg font-semibold text-gray-900 mb-1">
                  Clear Old Conversations
                </h3>
                <p className="text-sm text-gray-600">
                  Free up storage space by deleting old analysis conversations. This cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleClearOldConversations(30)}
                disabled={isClearing}
                className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <div className="font-medium text-gray-900">Clear conversations older than 30 days</div>
                <div className="text-xs text-gray-600 mt-1">Recommended for most users</div>
              </button>
              
              <button
                onClick={() => handleClearOldConversations(7)}
                disabled={isClearing}
                className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <div className="font-medium text-gray-900">Clear conversations older than 7 days</div>
                <div className="text-xs text-gray-600 mt-1">More aggressive cleanup</div>
              </button>
              
              <button
                onClick={() => handleClearOldConversations(1)}
                disabled={isClearing}
                className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <div className="font-medium text-gray-900">Clear all except today</div>
                <div className="text-xs text-gray-600 mt-1">Maximum cleanup</div>
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearDialog(false)}
                disabled={isClearing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
            
            {isClearing && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Clearing conversations...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Message Bubble Component
 */
interface MessageBubbleProps {
  message: {
    id?: number
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const time = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div 
        className={`p-2 rounded-lg flex-shrink-0 ${
          isUser ? 'bg-purple-100' : 'bg-blue-100'
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="w-4 h-4 text-purple-600" />
        ) : (
          <Bot className="w-4 h-4 text-blue-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`rounded-lg p-3 ${
            isUser 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-800'
          }`}
          role="article"
          aria-label={`${isUser ? 'Your' : 'Assistant'} message at ${time}`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-800 prose-strong:text-gray-900 prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800 prose-code:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-200 prose-pre:text-gray-800">
              <ReactMarkdown
                components={{
                  // Ensure links open in new tab
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" />
                  ),
                  // Style code blocks
                  code: ({ node, className, children, ...props }) => {
                    const isInline = !className?.includes('language-')
                    return isInline ? (
                      <code {...props} className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs">
                        {children}
                      </code>
                    ) : (
                      <code {...props} className="block bg-gray-200 text-gray-800 p-2 rounded text-xs overflow-x-auto">
                        {children}
                      </code>
                    )
                  },
                  // Style lists
                  ul: ({ node, ...props }) => (
                    <ul {...props} className="list-disc list-inside space-y-1 my-2" />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol {...props} className="list-decimal list-inside space-y-1 my-2" />
                  ),
                  // Style paragraphs
                  p: ({ node, ...props }) => (
                    <p {...props} className="my-2 leading-relaxed" />
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {time}
        </p>
      </div>
    </div>
  )
}

/**
 * Suggested Prompt Component
 */
interface SuggestedPromptProps {
  text: string
  onClick: () => void
}

function SuggestedPrompt({ text, onClick }: SuggestedPromptProps) {
  // Create a short display version for the button
  const displayText = text.length > 50 ? text.substring(0, 47) + '...' : text
  
  return (
    <button
      onClick={onClick}
      className="text-left p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm text-gray-700 hover:text-blue-700 min-h-[60px] flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      title={text}
      aria-label={`Use suggested prompt: ${text}`}
    >
      {displayText}
    </button>
  )
}
