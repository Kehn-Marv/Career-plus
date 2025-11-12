/**
 * useKeyboardShortcuts Hook
 * Provides keyboard shortcuts for common actions
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Keyboard shortcuts with Alt key
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault()
            navigate('/')
            break
          case 'a':
            event.preventDefault()
            navigate('/analyze')
            break
          case 'r':
            event.preventDefault()
            navigate('/history')
            break
        }
      }

      // Escape key to close modals (handled by individual components)
      // Tab navigation is handled natively by the browser
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}
