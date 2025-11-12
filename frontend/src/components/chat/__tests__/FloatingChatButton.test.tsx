/**
 * Unit tests for FloatingChatButton component
 * Tests interactions, keyboard accessibility, and badge display
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FloatingChatButton } from '../FloatingChatButton'

describe('FloatingChatButton', () => {
  it('renders with correct aria label when closed', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Open chat assistant')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders with correct aria label when open', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Close chat assistant')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when Enter key is pressed', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} />)
    
    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter' })
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when Space key is pressed', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} />)
    
    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: ' ' })
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick for other keys', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} />)
    
    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'a' })
    
    expect(onClick).not.toHaveBeenCalled()
  })

  it('displays unread badge when count is provided', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} unreadCount={5} />)
    
    const badge = screen.getByText('5')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', '5 unread messages')
  })

  it('displays 99+ for counts over 99', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} unreadCount={150} />)
    
    const badge = screen.getByText('99+')
    expect(badge).toBeInTheDocument()
  })

  it('does not display badge when count is 0', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} unreadCount={0} />)
    
    const badge = screen.queryByText('0')
    expect(badge).not.toBeInTheDocument()
  })

  it('does not display badge when sidebar is open', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={true} unreadCount={5} />)
    
    const badge = screen.queryByText('5')
    expect(badge).not.toBeInTheDocument()
  })

  it('is keyboard focusable', () => {
    const onClick = vi.fn()
    render(<FloatingChatButton onClick={onClick} isOpen={false} />)
    
    const button = screen.getByRole('button')
    button.focus()
    
    expect(document.activeElement).toBe(button)
  })

  it('shows MessageCircle icon when closed', () => {
    const onClick = vi.fn()
    const { container } = render(<FloatingChatButton onClick={onClick} isOpen={false} />)
    
    // Check for MessageCircle icon (lucide-react adds specific classes)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('shows X icon when open', () => {
    const onClick = vi.fn()
    const { container } = render(<FloatingChatButton onClick={onClick} isOpen={true} />)
    
    // Check for X icon
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})
