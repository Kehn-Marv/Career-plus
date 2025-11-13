/**
 * KeyboardShortcutsHelp Component
 * Displays available keyboard shortcuts
 */

import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show shortcuts with ? key
      if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const target = event.target as HTMLElement
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          !target.isContentEditable
        ) {
          event.preventDefault()
          setIsOpen(true)
        }
      }
      
      // Close with Escape
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(true)
          }
        }}
        className={`
          flex items-center justify-center
          w-12 h-12 md:w-14 md:h-14
          bg-white border border-gray-300
          rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-out
          hover:scale-110 hover:-translate-y-1
          focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50
          active:scale-95
          motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none
        `}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5 md:w-6 md:h-6 text-gray-700" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl" role="dialog" aria-labelledby="shortcuts-title">
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-xl font-bold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Navigation
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Go to Home</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                  Alt + H
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Go to Analyze</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                  Alt + A
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Go to History</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                  Alt + R
                </kbd>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
              General
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Show this help</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Close dialogs</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                  Esc
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Skip to content</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                  Tab
                </kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}
