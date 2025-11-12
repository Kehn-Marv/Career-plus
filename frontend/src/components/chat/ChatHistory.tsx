/**
 * ChatHistory Component
 * Displays past chat conversations with search and filter
 */

import { useState } from 'react'
import { Search, Trash2, MessageSquare, Calendar } from 'lucide-react'
import { useChatStore } from '../../store/chat-store'

export function ChatHistory() {
  const [searchQuery, setSearchQuery] = useState('')
  const { messages, currentAnalysisId, loadHistory, clearHistory } = useChatStore()

  // Group messages by analysis ID to create "sessions"
  const sessions = messages.reduce((acc: any[], message: any) => {
    const existingSession = acc.find(s => s.id === message.analysisId)
    if (!existingSession) {
      acc.push({
        id: message.analysisId,
        title: `Analysis ${message.analysisId}`,
        timestamp: message.timestamp,
        messageCount: 1
      })
    } else {
      existingSession.messageCount++
    }
    return acc
  }, [])

  // Filter sessions based on search
  const filteredSessions = sessions.filter((session: any) => {
    const query = searchQuery.toLowerCase()
    return (
      session.title?.toLowerCase().includes(query) ||
      session.id?.toString().toLowerCase().includes(query)
    )
  })

  const handleDeleteSession = async (sessionId: number | undefined, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!sessionId) return
    if (confirm('Delete this conversation?')) {
      // Delete messages for this analysis
      const { db } = await import('@/lib/db')
      await db.chatMessages.where('analysisId').equals(sessionId).delete()
      // Reload if this was the current session
      if (sessionId === currentAnalysisId) {
        clearHistory()
      }
    }
  }

  const handleClearAll = async () => {
    if (confirm('Delete all conversations? This cannot be undone.')) {
      const { db } = await import('@/lib/db')
      await db.chatMessages.clear()
      clearHistory()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Chat History</h3>
          {sessions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'No conversations found' : 'No chat history yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session: any) => (
              <SessionCard
                key={session.id}
                session={session}
                isActive={session.id === currentAnalysisId}
                onSelect={() => session.id && loadHistory(session.id)}
                onDelete={(e: React.MouseEvent) => handleDeleteSession(session.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Session Card Component
 */
interface SessionCardProps {
  session: {
    id?: string
    title?: string
    messageCount: number
    createdAt: Date
    updatedAt: Date
  }
  isActive: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
}

function SessionCard({ session, isActive, onSelect, onDelete }: SessionCardProps) {
  const messageCount = session.messageCount
  const preview = session.title || 'New Conversation'
  const date = new Date(session.updatedAt).toLocaleDateString()

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-800 text-sm line-clamp-1">
          {preview}
        </h4>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 rounded transition-colors"
          title="Delete conversation"
        >
          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
        </button>
      </div>

      <p className="text-xs text-gray-600 mb-2">
        {messageCount} {messageCount === 1 ? 'message' : 'messages'}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>{messageCount} messages</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}
