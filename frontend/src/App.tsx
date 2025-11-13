import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom'
import SkipLink from '@/components/accessibility/SkipLink'
import KeyboardShortcutsHelp from '@/components/accessibility/KeyboardShortcutsHelp'
import OfflineIndicator from '@/components/ui/OfflineIndicator'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { FloatingChatButton } from '@/components/chat/FloatingChatButton'
import FloatingButtonGroup from '@/components/layout/FloatingButtonGroup'
import { useChatStore } from '@/store/chat-store'
import { useAnalysisStore } from '@/store/analysis-store'

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/Home'))
const Analyze = lazy(() => import('@/pages/Analyze'))
const History = lazy(() => import('@/pages/History'))

// Lazy load ChatSidebar - only load when first opened
const ChatSidebar = lazy(() => import('@/components/chat/ChatSidebar').then(module => ({ default: module.ChatSidebar })))

function AppContent() {
  useKeyboardShortcuts()
  const [searchParams] = useSearchParams()
  const { isOpen, toggleSidebar, closeSidebar, currentAnalysisId, setCurrentAnalysis } = useChatStore()
  const { currentAnalysis } = useAnalysisStore()
  
  // Set currentAnalysisId when viewing an analysis
  useEffect(() => {
    if (currentAnalysis?.id && currentAnalysis.id !== currentAnalysisId) {
      setCurrentAnalysis(currentAnalysis.id)
    }
  }, [currentAnalysis, currentAnalysisId, setCurrentAnalysis])
  
  // Also check URL params for analysisId (when loading from history)
  useEffect(() => {
    const analysisIdParam = searchParams.get('analysisId')
    if (analysisIdParam) {
      const id = parseInt(analysisIdParam, 10)
      if (!isNaN(id) && id !== currentAnalysisId) {
        setCurrentAnalysis(id)
      }
    }
  }, [searchParams, currentAnalysisId, setCurrentAnalysis])
  
  return (
    <>
      <SkipLink />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Suspense>
      <OfflineIndicator />
      
      {/* Floating action buttons - Grouped for proper positioning */}
      <FloatingButtonGroup>
        <KeyboardShortcutsHelp />
        <FloatingChatButton
          onClick={toggleSidebar}
          isOpen={isOpen}
          unreadCount={0}
        />
      </FloatingButtonGroup>
      
      {/* Chat Sidebar - Lazy loaded, only rendered when opened */}
      {isOpen && (
        <Suspense fallback={null}>
          <ChatSidebar
            isOpen={isOpen}
            onClose={closeSidebar}
            analysisId={currentAnalysisId || undefined}
          />
        </Suspense>
      )}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
