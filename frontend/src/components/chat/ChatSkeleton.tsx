/**
 * ChatSkeleton Component
 * Animated placeholder UI shown during chat interface initialization
 * Matches the structure of ChatInterface for smooth loading experience
 */

import { Bot } from 'lucide-react'

/**
 * Skeleton loader for chat interface
 * Displays animated placeholders that match the actual ChatInterface layout
 * Includes ARIA attributes for accessibility
 */
export function ChatSkeleton() {
  return (
    <div 
      className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200"
      role="status"
      aria-busy="true"
      aria-label="Loading chat interface"
    >
      {/* Header skeleton - matches ChatInterface header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          {/* Bot icon placeholder */}
          <div className="p-2 bg-gray-300 rounded-lg animate-pulse" aria-hidden="true">
            <Bot className="w-5 h-5 text-gray-400" />
          </div>
          {/* Title and subtitle placeholders */}
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-32 mb-2 animate-pulse" aria-hidden="true" />
            <div className="h-3 bg-gray-200 rounded w-48 animate-pulse" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Messages skeleton - matches ChatInterface messages area */}
      <div className="flex-1 overflow-hidden p-4 space-y-4">
        {/* Assistant message skeleton */}
        <div className="flex items-start gap-3" aria-hidden="true">
          {/* Avatar placeholder */}
          <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse flex-shrink-0" />
          {/* Message content placeholder */}
          <div className="flex-1 space-y-2 max-w-[80%]">
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>

        {/* User message skeleton */}
        <div className="flex items-start gap-3 flex-row-reverse" aria-hidden="true">
          {/* Avatar placeholder */}
          <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse flex-shrink-0" />
          {/* Message content placeholder */}
          <div className="flex-1 space-y-2 max-w-[80%] items-end">
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse ml-auto" />
          </div>
        </div>

        {/* Another assistant message skeleton */}
        <div className="flex items-start gap-3" aria-hidden="true">
          {/* Avatar placeholder */}
          <div className="w-8 h-8 bg-gray-300 rounded-lg animate-pulse flex-shrink-0" />
          {/* Message content placeholder */}
          <div className="flex-1 space-y-2 max-w-[80%]">
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Input skeleton - matches ChatInterface input area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          {/* Textarea placeholder */}
          <div 
            className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" 
            aria-hidden="true"
          />
          {/* Send button placeholder */}
          <div 
            className="w-20 h-12 bg-gray-300 rounded-lg animate-pulse" 
            aria-hidden="true"
          />
        </div>
        {/* Help text placeholder */}
        <div 
          className="h-3 bg-gray-200 rounded w-64 mt-2 animate-pulse" 
          aria-hidden="true"
        />
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading chat interface, please wait...</span>
    </div>
  )
}
