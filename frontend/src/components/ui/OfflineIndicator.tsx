/**
 * OfflineIndicator Component
 * Shows when the user is offline
 */

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div 
      className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="w-5 h-5" aria-hidden="true" />
      <div>
        <p className="font-semibold text-sm">You're offline</p>
        <p className="text-xs">Some features may be unavailable</p>
      </div>
    </div>
  )
}
