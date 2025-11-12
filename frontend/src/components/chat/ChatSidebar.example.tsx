/**
 * ChatSidebar Example
 * Demonstrates usage of the ChatSidebar component
 */

import { useState } from 'react'
import { ChatSidebar } from './ChatSidebar'
import { FloatingChatButton } from './FloatingChatButton'

/**
 * Example: Basic ChatSidebar with FloatingChatButton
 * 
 * This example shows how to integrate the ChatSidebar with the FloatingChatButton
 * to create a complete chat assistant interface.
 */
export function ChatSidebarExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount] = useState(3)
  const analysisId = 1 // Example analysis ID

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Your main content here */}
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Chat Assistant Demo</h1>
        <p className="text-gray-600 mb-4">
          Click the floating button in the bottom-right corner to open the chat assistant.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="font-semibold mb-2">Features:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Slide-in animation from right side</li>
              <li>Semi-transparent backdrop overlay</li>
              <li>Click outside to close</li>
              <li>Press Escape to close</li>
              <li>Responsive design (400px desktop, 360px tablet, 100vw mobile)</li>
              <li>Proper z-index layering</li>
              <li>Focus management for accessibility</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        unreadCount={unreadCount}
      />

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        analysisId={analysisId}
      />
    </div>
  )
}

/**
 * Example: ChatSidebar without analysis context
 * 
 * When no analysisId is provided, the chat interface will show
 * a message prompting the user to upload and analyze a resume first.
 */
export function ChatSidebarNoContextExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Chat Without Context</h1>
        <p className="text-gray-600">
          This example shows the chat assistant when no analysis context is available.
        </p>
      </div>

      <FloatingChatButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      />

      <ChatSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        // No analysisId provided
      />
    </div>
  )
}

/**
 * Example: Programmatic control
 * 
 * Shows how to control the sidebar programmatically,
 * such as opening it automatically when certain conditions are met.
 */
export function ChatSidebarProgrammaticExample() {
  const [isOpen, setIsOpen] = useState(false)
  const analysisId = 1

  // Example: Auto-open after 3 seconds
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsOpen(true)
  //   }, 3000)
  //   return () => clearTimeout(timer)
  // }, [])

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Programmatic Control</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open Chat
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close Chat
          </button>
        </div>
      </div>

      <FloatingChatButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      />

      <ChatSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        analysisId={analysisId}
      />
    </div>
  )
}
