/**
 * FloatingChatButton Example Usage
 * Demonstrates how to use the FloatingChatButton component
 */

import { useState } from 'react'
import { FloatingChatButton } from './FloatingChatButton'

/**
 * Example 1: Basic usage with state management
 */
export function BasicExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative h-screen">
      <FloatingChatButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      />
      
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-[999]">
          <div className="p-4">
            <h3 className="font-semibold">Chat Interface</h3>
            <p className="text-sm text-gray-600">Chat content goes here...</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Example 2: With unread message badge
 */
export function WithUnreadBadgeExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const handleClick = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Clear unread count when opening
      setUnreadCount(0)
    }
  }

  return (
    <div className="relative h-screen">
      <FloatingChatButton
        onClick={handleClick}
        isOpen={isOpen}
        unreadCount={unreadCount}
      />
    </div>
  )
}

/**
 * Example 3: Integrated with Zustand store
 */
export function WithStoreExample() {
  // In real usage, this would come from useChatStore
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = 5

  return (
    <div className="relative h-screen">
      <FloatingChatButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        unreadCount={unreadCount}
      />
    </div>
  )
}

/**
 * Example 4: Accessibility demonstration
 * Shows keyboard navigation and ARIA attributes
 */
export function AccessibilityExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Accessibility Features</h2>
        <ul className="space-y-2 text-sm text-gray-700 mb-8">
          <li>✓ Keyboard focusable with visible focus ring</li>
          <li>✓ Press Enter or Space to activate</li>
          <li>✓ ARIA label describes current state</li>
          <li>✓ ARIA expanded attribute for screen readers</li>
          <li>✓ Minimum 44px touch target (48px mobile, 56px desktop)</li>
          <li>✓ Respects prefers-reduced-motion</li>
        </ul>
        
        <p className="text-sm text-gray-600 mb-4">
          Try tabbing to the button and pressing Enter or Space to toggle it.
        </p>
      </div>

      <FloatingChatButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        unreadCount={2}
      />
    </div>
  )
}
