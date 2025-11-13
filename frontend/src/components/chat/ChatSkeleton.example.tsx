/**
 * ChatSkeleton Example
 * Demonstrates the usage of the ChatSkeleton component
 */

import { ChatSkeleton } from './ChatSkeleton'

/**
 * Example: Basic usage of ChatSkeleton
 * Shows the skeleton loader while chat interface is initializing
 */
export function ChatSkeletonExample() {
  return (
    <div className="h-screen w-full max-w-md mx-auto p-4">
      <ChatSkeleton />
    </div>
  )
}

/**
 * Example: Using ChatSkeleton in a loading state
 * Typical usage pattern with conditional rendering
 */
export function ChatWithLoadingExample() {
  const isLoading = true // This would be actual loading state

  return (
    <div className="h-screen w-full max-w-md mx-auto p-4">
      {isLoading ? (
        <ChatSkeleton />
      ) : (
        <div>Actual Chat Interface</div>
      )}
    </div>
  )
}
