/**
 * Unit tests for ChatSidebar component
 * Tests open/close behavior, keyboard navigation, and accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatSidebar } from '../ChatSidebar'

// Mock ChatInterface component
vi.mock('../ChatInterface', () => ({
  ChatInterface: ({ analysisId }: { analysisId?: number }) => (
    <div data-testid="chat-interface">Chat Interface {analysisId}</div>
  ),
}))

describe('ChatSidebar', () => {
  beforeEach(() => {
    // Reset body overflow before each test
    document.body.style.overflow = ''
  })

  afterEach(() => {
    // Clean up after each test
    document.body.style.overflow = ''
  })

  it('does not render when isOpen is false', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={false} onClose={onClose} />)
    
    const sidebar = screen.queryByRole('dialog')
    expect(sidebar).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    const sidebar = screen.getByRole('dialog')
    expect(sidebar).toBeInTheDocument()
  })

  it('renders with correct ARIA attributes', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    const sidebar = screen.getByRole('dialog')
    expect(sidebar).toHaveAttribute('aria-modal', 'true')
    expect(sidebar).toHaveAttribute('aria-labelledby', 'chat-sidebar-title')
    expect(sidebar).toHaveAttribute('aria-describedby', 'chat-sidebar-description')
  })

  it('displays title', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    const title = screen.getByText('Chat Assistant')
    expect(title).toBeInTheDocument()
  })

  it('renders ChatInterface with analysisId', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} analysisId={123} />)
    
    const chatInterface = screen.getByTestId('chat-interface')
    expect(chatInterface).toHaveTextContent('Chat Interface 123')
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close chat sidebar/i })
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    // Find backdrop (the fixed overlay)
    const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/50')
    expect(backdrop).toBeInTheDocument()
    
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('does not call onClose when clicking inside sidebar', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    const sidebar = screen.getByRole('dialog')
    fireEvent.click(sidebar)
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('does not call onClose for other keys', async () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Enter' })
    
    await waitFor(() => {
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  it('prevents body scroll when open', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const onClose = vi.fn()
    const { rerender } = render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<ChatSidebar isOpen={false} onClose={onClose} />)
    
    expect(document.body.style.overflow).toBe('')
  })

  it('focuses sidebar when opened', async () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    await waitFor(() => {
      const sidebar = screen.getByRole('dialog')
      expect(document.activeElement).toBe(sidebar)
    }, { timeout: 200 })
  })

  it('close button is keyboard accessible', () => {
    const onClose = vi.fn()
    render(<ChatSidebar isOpen={true} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close chat sidebar/i })
    closeButton.focus()
    
    expect(document.activeElement).toBe(closeButton)
  })
})
