/**
 * ExportPDFButton Component Tests
 * Tests for the PDF export button functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportPDFButton, ExportPDFButtonCompact } from '../ExportPDFButton'
import { useOptimizationStore } from '@/store/optimization-store'

// Mock the optimization store
vi.mock('@/store/optimization-store', () => ({
  useOptimizationStore: vi.fn(),
  optimizationSelectors: {
    hasOptimizedResume: vi.fn()
  }
}))

describe('ExportPDFButton', () => {
  const mockExportToPDF = vi.fn()
  const mockLoadLatestOptimizedResume = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    vi.mocked(useOptimizationStore).mockReturnValue({
      currentOptimizedResume: null,
      isGeneratingPDF: false,
      error: null,
      exportToPDF: mockExportToPDF,
      loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
      clearError: mockClearError
    } as any)
  })

  describe('Basic Rendering', () => {
    it('should render the export button', () => {
      render(<ExportPDFButton analysisId={1} />)
      
      expect(screen.getByRole('button', { name: /export resume as pdf/i })).toBeInTheDocument()
      expect(screen.getByText('Export as PDF')).toBeInTheDocument()
    })

    it('should show loading state when generating PDF', () => {
      vi.mocked(useOptimizationStore).mockReturnValue({
        currentOptimizedResume: { id: 1 } as any,
        isGeneratingPDF: true,
        error: null,
        exportToPDF: mockExportToPDF,
        loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
        clearError: mockClearError
      } as any)

      render(<ExportPDFButton analysisId={1} />)
      
      expect(screen.getByText('Generating PDF...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<ExportPDFButton analysisId={1} disabled={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Export Functionality', () => {
    it('should show prompt when no optimized resume exists', async () => {
      const user = userEvent.setup()
      
      render(<ExportPDFButton analysisId={1} />)
      
      const button = screen.getByRole('button', { name: /export resume as pdf/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('No Optimized Resume Found')).toBeInTheDocument()
        expect(screen.getByText(/please run auto fix resume first/i)).toBeInTheDocument()
      })
    })

    it('should call exportToPDF when optimized resume exists', async () => {
      const user = userEvent.setup()
      const mockOptimizedResume = {
        id: 123,
        analysisId: 1,
        content: { contact: { name: 'Test User' } }
      }
      
      vi.mocked(useOptimizationStore).mockReturnValue({
        currentOptimizedResume: mockOptimizedResume as any,
        isGeneratingPDF: false,
        error: null,
        exportToPDF: mockExportToPDF,
        loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
        clearError: mockClearError
      } as any)

      mockExportToPDF.mockResolvedValue(undefined)
      
      render(<ExportPDFButton analysisId={1} />)
      
      const button = screen.getByRole('button', { name: /export resume as pdf/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(mockExportToPDF).toHaveBeenCalledWith(123)
      })
    })

    it('should call onExportComplete callback on success', async () => {
      const user = userEvent.setup()
      const onExportComplete = vi.fn()
      const mockOptimizedResume = {
        id: 123,
        analysisId: 1
      }
      
      vi.mocked(useOptimizationStore).mockReturnValue({
        currentOptimizedResume: mockOptimizedResume as any,
        isGeneratingPDF: false,
        error: null,
        exportToPDF: mockExportToPDF,
        loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
        clearError: mockClearError
      } as any)

      mockExportToPDF.mockResolvedValue(undefined)
      
      render(<ExportPDFButton analysisId={1} onExportComplete={onExportComplete} />)
      
      const button = screen.getByRole('button', { name: /export resume as pdf/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(onExportComplete).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when export fails', async () => {
      const user = userEvent.setup()
      const mockOptimizedResume = { id: 123, analysisId: 1 }
      const errorMessage = 'PDF generation failed'
      
      vi.mocked(useOptimizationStore).mockReturnValue({
        currentOptimizedResume: mockOptimizedResume as any,
        isGeneratingPDF: false,
        error: null,
        exportToPDF: mockExportToPDF,
        loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
        clearError: mockClearError
      } as any)

      mockExportToPDF.mockRejectedValue(new Error(errorMessage))
      
      render(<ExportPDFButton analysisId={1} />)
      
      const button = screen.getByRole('button', { name: /export resume as pdf/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText('Export Failed')).toBeInTheDocument()
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should show troubleshooting guidance in error message', async () => {
      const user = userEvent.setup()
      const mockOptimizedResume = { id: 123, analysisId: 1 }
      
      vi.mocked(useOptimizationStore).mockReturnValue({
        currentOptimizedResume: mockOptimizedResume as any,
        isGeneratingPDF: false,
        error: null,
        exportToPDF: mockExportToPDF,
        loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
        clearError: mockClearError
      } as any)

      mockExportToPDF.mockRejectedValue(new Error('Test error'))
      
      render(<ExportPDFButton analysisId={1} />)
      
      const button = screen.getByRole('button', { name: /export resume as pdf/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText(/troubleshooting/i)).toBeInTheDocument()
        expect(screen.getByText(/ensure you've run auto fix resume first/i)).toBeInTheDocument()
      })
    })

    it('should call onExportError callback on failure', async () => {
      const user = userEvent.setup()
      const onExportError = vi.fn()
      const mockOptimizedResume = { id: 123, analysisId: 1 }
      const error = new Error('Test error')
      
      vi.mocked(useOptimizationStore).mockReturnValue({
        currentOptimizedResume: mockOptimizedResume as any,
        isGeneratingPDF: false,
        error: null,
        exportToPDF: mockExportToPDF,
        loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
        clearError: mockClearError
      } as any)

      mockExportToPDF.mockRejectedValue(error)
      
      render(<ExportPDFButton analysisId={1} onExportError={onExportError} />)
      
      const button = screen.getByRole('button', { name: /export resume as pdf/i })
      await user.click(button)
      
      await waitFor(() => {
        expect(onExportError).toHaveBeenCalledWith(error)
      })
    })
  })

  describe('Success State', () => {
    it('should show ready message when optimized resume exists', () => {
      const mockOptimizedResume = { id: 123, analysisId: 1 }
      
      vi.mocked(useOptimizationStore).mockReturnValue({
        currentOptimizedResume: mockOptimizedResume as any,
        isGeneratingPDF: false,
        error: null,
        exportToPDF: mockExportToPDF,
        loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
        clearError: mockClearError
      } as any)

      render(<ExportPDFButton analysisId={1} />)
      
      expect(screen.getByText(/ready to export/i)).toBeInTheDocument()
      expect(screen.getByText(/ats-compatible pdf/i)).toBeInTheDocument()
    })
  })
})

describe('ExportPDFButtonCompact', () => {
  const mockExportToPDF = vi.fn()
  const mockLoadLatestOptimizedResume = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(useOptimizationStore).mockReturnValue({
      currentOptimizedResume: null,
      isGeneratingPDF: false,
      error: null,
      exportToPDF: mockExportToPDF,
      loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
      clearError: vi.fn()
    } as any)
  })

  it('should render compact button', () => {
    render(<ExportPDFButtonCompact analysisId={1} />)
    
    expect(screen.getByRole('button', { name: /export resume as pdf/i })).toBeInTheDocument()
    expect(screen.getByText('Export PDF')).toBeInTheDocument()
  })

  it('should show alert when no optimized resume exists', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<ExportPDFButtonCompact analysisId={1} />)
    
    const button = screen.getByRole('button', { name: /export resume as pdf/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Please run Auto Fix Resume first')
      )
    })
    
    alertSpy.mockRestore()
  })

  it('should export when optimized resume exists', async () => {
    const user = userEvent.setup()
    const mockOptimizedResume = { id: 123, analysisId: 1 }
    
    vi.mocked(useOptimizationStore).mockReturnValue({
      currentOptimizedResume: mockOptimizedResume as any,
      isGeneratingPDF: false,
      error: null,
      exportToPDF: mockExportToPDF,
      loadLatestOptimizedResume: mockLoadLatestOptimizedResume,
      clearError: vi.fn()
    } as any)

    mockExportToPDF.mockResolvedValue(undefined)
    
    render(<ExportPDFButtonCompact analysisId={1} />)
    
    const button = screen.getByRole('button', { name: /export resume as pdf/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(mockExportToPDF).toHaveBeenCalledWith(123)
    })
  })
})
