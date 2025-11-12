/**
 * AutoFixButton Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AutoFixButton } from '../AutoFixButton'
import { useOptimizationStore } from '@/store/optimization-store'

// Mock the optimization store
vi.mock('@/store/optimization-store', () => ({
  useOptimizationStore: vi.fn()
}))

// Mock the template engine
vi.mock('@/lib/templates/template-engine', () => ({
  templateEngine: {
    getAllTemplates: () => [
      { id: 'modern', name: 'Modern Professional', atsScore: 95 }
    ]
  }
}))

describe('AutoFixButton', () => {
  const mockRunAutoFix = vi.fn()
  const mockSelectTemplate = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    ;(useOptimizationStore as any).mockReturnValue({
      isOptimizing: false,
      optimizationProgress: {
        step: 'idle',
        percentage: 0,
        message: ''
      },
      selectedTemplate: { id: 'modern', name: 'Modern Professional' },
      error: null,
      runAutoFix: mockRunAutoFix,
      selectTemplate: mockSelectTemplate,
      clearError: mockClearError
    })
  })

  it('renders the button with correct text', () => {
    render(<AutoFixButton analysisId={1} />)
    
    expect(screen.getByRole('button', { name: /auto-fix resume/i })).toBeInTheDocument()
  })

  it('shows loading state when optimizing', () => {
    ;(useOptimizationStore as any).mockReturnValue({
      isOptimizing: true,
      optimizationProgress: {
        step: 'applying',
        percentage: 50,
        message: 'Applying fixes...'
      },
      selectedTemplate: { id: 'modern', name: 'Modern Professional' },
      error: null,
      runAutoFix: mockRunAutoFix,
      selectTemplate: mockSelectTemplate,
      clearError: mockClearError
    })

    render(<AutoFixButton analysisId={1} />)
    
    expect(screen.getByText(/applying fixes/i)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('calls runAutoFix when button is clicked', async () => {
    const user = userEvent.setup()
    mockRunAutoFix.mockResolvedValue({
      success: true,
      optimizedResumeId: 123,
      appliedFixes: 5
    })

    render(<AutoFixButton analysisId={1} />)
    
    const button = screen.getByRole('button', { name: /auto-fix resume/i })
    await user.click(button)

    expect(mockClearError).toHaveBeenCalled()
    expect(mockRunAutoFix).toHaveBeenCalledWith(1, 'modern')
  })

  it('shows success message after optimization completes', async () => {
    const user = userEvent.setup()
    let isOptimizing = false
    
    mockRunAutoFix.mockImplementation(async () => {
      isOptimizing = true
      return {
        success: true,
        optimizedResumeId: 123,
        appliedFixes: 5
      }
    })

    const { rerender } = render(<AutoFixButton analysisId={1} />)
    
    const button = screen.getByRole('button', { name: /auto-fix resume/i })
    await user.click(button)

    // Simulate store update after completion
    ;(useOptimizationStore as any).mockReturnValue({
      isOptimizing: false,
      optimizationProgress: {
        step: 'complete',
        percentage: 100,
        message: 'Optimization complete!'
      },
      selectedTemplate: { id: 'modern', name: 'Modern Professional' },
      error: null,
      runAutoFix: mockRunAutoFix,
      selectTemplate: mockSelectTemplate,
      clearError: mockClearError
    })

    rerender(<AutoFixButton analysisId={1} />)

    await waitFor(() => {
      expect(screen.getByText(/optimization complete/i)).toBeInTheDocument()
    })
  })

  it('shows error message when optimization fails', () => {
    ;(useOptimizationStore as any).mockReturnValue({
      isOptimizing: false,
      optimizationProgress: {
        step: 'idle',
        percentage: 0,
        message: ''
      },
      selectedTemplate: { id: 'modern', name: 'Modern Professional' },
      error: 'Failed to optimize resume',
      runAutoFix: mockRunAutoFix,
      selectTemplate: mockSelectTemplate,
      clearError: mockClearError
    })

    render(<AutoFixButton analysisId={1} />)
    
    expect(screen.getByText(/optimization failed/i)).toBeInTheDocument()
    expect(screen.getByText(/failed to optimize resume/i)).toBeInTheDocument()
  })

  it('disables button when disabled prop is true', () => {
    render(<AutoFixButton analysisId={1} disabled={true} />)
    
    const button = screen.getByRole('button', { name: /auto-fix resume/i })
    expect(button).toBeDisabled()
  })

  it('calls onComplete callback when optimization succeeds', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    
    mockRunAutoFix.mockResolvedValue({
      success: true,
      optimizedResumeId: 123,
      appliedFixes: 5
    })

    render(<AutoFixButton analysisId={1} onComplete={onComplete} />)
    
    const button = screen.getByRole('button', { name: /auto-fix resume/i })
    await user.click(button)

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({
        optimizedResumeId: 123,
        appliedFixes: 5
      })
    })
  })
})
