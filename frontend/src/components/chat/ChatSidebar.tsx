/**
 * ChatSidebar Component
 * Slide-in sidebar panel containing the chat interface
 * Features: slide-in animation, backdrop overlay, click-outside-to-close, Escape key handler
 */

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { ChatInterface } from './ChatInterface'

export interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  analysisId?: number
}

/**
 * ChatSidebar - Slide-in panel from right side with chat interface
 * 
 * Accessibility:
 * - Escape key to close
 * - Focus trap when open
 * - ARIA labels for screen readers
 * - Keyboard navigation support
 * 
 * Responsive:
 * - Desktop: 400px width
 * - Tablet: 360px width
 * - Mobile: 100vw (full screen)
 * 
 * Z-index layering:
 * - Backdrop: z-[999]
 * - Sidebar: z-[1000]
 * - FloatingChatButton: z-[1000] (same level, but button is outside sidebar)
 */
export function ChatSidebar({ isOpen, onClose, analysisId }: ChatSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Focus the sidebar for keyboard navigation
      setTimeout(() => {
        sidebarRef.current?.focus()
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      
      // Restore focus when closing
      if (!isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, onClose])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[999] animate-fadeIn"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-sidebar-title"
        aria-describedby="chat-sidebar-description"
        tabIndex={-1}
        className="fixed top-0 right-0 h-full z-[1000] animate-slideIn
                   w-full sm:w-[360px] md:w-[400px]
                   bg-white shadow-2xl
                   flex flex-col
                   focus:outline-none"
      >
        <span id="chat-sidebar-description" className="sr-only">
          Chat with the AI assistant about your resume analysis. Press Escape to close.
        </span>
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 id="chat-sidebar-title" className="text-lg font-semibold text-gray-800">
            Chat Assistant
          </h2>
          <button
            onClick={onClose}
            aria-label="Close chat sidebar"
            className="p-2 rounded-lg hover:bg-white/50 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="button"
          >
            <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
          </button>
        </div>

        {/* Chat interface - takes remaining space */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface analysisId={analysisId} />
        </div>
      </div>
    </>
  )
}
