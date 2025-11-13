/**
 * FloatingChatButton Component
 * Floating button in bottom-right corner to open/close chat assistant
 * Features: badge for unread count, rotation animation, keyboard accessible
 */

import { MessageCircle, X } from 'lucide-react'

export interface FloatingChatButtonProps {
  onClick: () => void
  isOpen: boolean
  unreadCount?: number
}

/**
 * FloatingChatButton - Persistent button to access chat assistant
 * 
 * Accessibility:
 * - Keyboard focusable with visible focus ring
 * - Enter/Space to activate
 * - ARIA label for screen readers
 * - Minimum 44px touch target
 * 
 * Responsive:
 * - 56px on desktop (≥768px)
 * - 48px on mobile (<768px)
 */
export function FloatingChatButton({ 
  onClick, 
  isOpen, 
  unreadCount = 0 
}: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
      aria-expanded={isOpen}
      className={`
        flex items-center justify-center
        w-12 h-12 md:w-14 md:h-14
        bg-gradient-to-br from-blue-600 to-blue-700
        text-white rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        hover:scale-110 hover:-translate-y-1
        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
        active:scale-95
        motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none
      `}
      style={{
        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
      }}
    >
      {/* Icon with rotation animation */}
      <div className="relative">
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
        )}
        
        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white"
            aria-label={`${unreadCount} unread messages`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </button>
  )
}
