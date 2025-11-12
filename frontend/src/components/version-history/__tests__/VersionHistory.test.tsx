/**
 * VersionHistory Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VersionHistory } from '../VersionHistory'
import { useOptimizationStore } from '@/store/optimization-store'
import * as optimizedResumeOps from '@/lib/db/optimized-resume-operations'

// Mock the optimization store
vi.mock('@/store/optimization-store', () => ({
  useOptimizationStore: vi.fn()
}))

// Mock the database operations
vi.mock('@/lib/db/optimized-resume-operations', () => ({
  getVersionChangeSummary: vi.fn(),
  compareVersions: vi.fn()
}))

describe('VersionHistory', () => {
  const mockLoadVersionHistory = vi.fn()
  const mockRestoreVersion = vi.fn()
  const mockExportToPDF = vi.fn()

  const mockVersion1 = {
    id: 1,
    analysisId: 123,
    resumeId: 1,
    version: 1,
    templateId: 'modern',
    content: {
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0100'
      },
      summary: 'Experienced developer',
      experience: [
        {
          title: 'Software Engineer',
          company: 'Tech Corp',
          startDate: '2020-01',
          endDate: '2023-01',
          current: false,
          bullets: ['Built features', 'Fixed bugs']
        }
      ],
      education: [
        {
          degree: 'BS Computer Science',
          institution: 'University'
        }
      ],
      skills: {
        technical: ['JavaScript', 'React'],
        soft: ['Communication']
      }
    },
    appliedFixes: {
      recommendationIds: ['rec1', 'rec2'],
      atsIssuesFixes: ['ats1'],
      biasFixesApplied: 1,
      localizationApplied: false
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    wordCount: 500,
    pageCount: 1,
    atsCompatibilityScore: 95
  }

  const mockVersion2 = {
    ...mockVersion1,
    id: 2,
    version: 2,
    region: 'US' as const,
    atsCompatibilityScore: 98,
    appliedFixes: {
      ...mockVersion1.appliedFixes,
      localizationApplied: true
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    ;(useOptimizationStore as any).mockReturnValue({
      versions: [mockVersion2, mockVersion1],
      currentOptimizedResume: mockVersion2,
      loadVersionHistory: mockLoadVersionHistory,
      restoreVersion: mockRestoreVersion,
      exportToPDF: mockExportToPDF,
      isGeneratingPDF: false
    })

    // Mock database operations
    ;(optimizedResumeOps.getVersionChangeSummary as any).mockResolvedValue([
      'Template: modern',
      '2 recommendations applied',
      'ATS Score: 95'
    ])
  })

  it('renders empty state when no versions exist', () => {
    ;(useOptimizationStore as any).mockReturnValue({
      versions: [],
      currentOptimizedResume: null,
      loadVersionHistory: mockLoadVersionHistory,
      restoreVersion: mockRestoreVersion,
      exportToPDF: mockExportToPDF,
      isGeneratingPDF: false
    })

    render(<VersionHistory analysisId={123} />)
    
    expect(screen.getByText(/no version history/i)).toBeInTheDocument()
    expect(screen.getByText(/run auto-fix to create your first optimized resume version/i)).toBeInTheDocument()
  })

  it('loads version history on mount', () => {
    render(<VersionHistory analysisId={123} />)
    
    expect(mockLoadVersionHistory).toHaveBeenCalledWith(123)
  })

  it('displays all versions in the timeline', async () => {
    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText(/version 1/i)).toBeInTheDocument()
      expect(screen.getByText(/version 2/i)).toBeInTheDocument()
    })
  })

  it('marks current version with badge', async () => {
    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      const currentBadges = screen.getAllByText(/current/i)
      expect(currentBadges.length).toBeGreaterThan(0)
    })
  })

  it('displays region badge for localized versions', async () => {
    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText('US')).toBeInTheDocument()
    })
  })

  it('shows ATS score and word count for each version', async () => {
    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText(/ATS: 95/i)).toBeInTheDocument()
      expect(screen.getByText(/ATS: 98/i)).toBeInTheDocument()
      expect(screen.getByText(/Words: 500/i)).toBeInTheDocument()
    })
  })

  it('calls restoreVersion when restore button is clicked', async () => {
    const user = userEvent.setup()
    mockRestoreVersion.mockResolvedValue(undefined)

    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText(/version 1/i)).toBeInTheDocument()
    })

    // Find restore buttons (there should be one for version 1, not for current version 2)
    const restoreButtons = screen.getAllByLabelText(/restore this version/i)
    await user.click(restoreButtons[0])

    expect(mockRestoreVersion).toHaveBeenCalledWith(1)
  })

  it('calls exportToPDF when export button is clicked', async () => {
    const user = userEvent.setup()
    mockExportToPDF.mockResolvedValue(undefined)

    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText(/version 1/i)).toBeInTheDocument()
    })

    const exportButtons = screen.getAllByLabelText(/export as pdf/i)
    await user.click(exportButtons[0])

    expect(mockExportToPDF).toHaveBeenCalledWith(1)
  })

  it('expands version details when chevron is clicked', async () => {
    const user = userEvent.setup()

    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText(/version 1/i)).toBeInTheDocument()
    })

    const expandButtons = screen.getAllByLabelText(/expand details/i)
    await user.click(expandButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/changes/i)).toBeInTheDocument()
    })
  })

  it('opens preview modal when preview button is clicked', async () => {
    const user = userEvent.setup()

    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText(/version 1/i)).toBeInTheDocument()
    })

    const previewButtons = screen.getAllByLabelText(/preview version/i)
    await user.click(previewButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('displays error message when operation fails', async () => {
    const user = userEvent.setup()
    mockRestoreVersion.mockRejectedValue(new Error('Failed to restore'))

    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText(/version 1/i)).toBeInTheDocument()
    })

    const restoreButtons = screen.getAllByLabelText(/restore this version/i)
    await user.click(restoreButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/failed to restore/i)).toBeInTheDocument()
    })
  })

  it('calls onVersionSelect callback when version is previewed', async () => {
    const user = userEvent.setup()
    const onVersionSelect = vi.fn()

    render(<VersionHistory analysisId={123} onVersionSelect={onVersionSelect} />)
    
    await waitFor(() => {
      expect(screen.getByText(/version 1/i)).toBeInTheDocument()
    })

    const previewButtons = screen.getAllByLabelText(/preview version/i)
    await user.click(previewButtons[0])

    expect(onVersionSelect).toHaveBeenCalledWith(mockVersion1)
  })

  it('shows loading state during operations', async () => {
    const user = userEvent.setup()
    mockRestoreVersion.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<VersionHistory analysisId={123} />)
    
    await waitFor(() => {
      expect(screen.getByText(/version 1/i)).toBeInTheDocument()
    })

    const restoreButtons = screen.getAllByLabelText(/restore this version/i)
    await user.click(restoreButtons[0])

    // Should show loading spinner
    await waitFor(() => {
      const button = restoreButtons[0]
      expect(button).toBeDisabled()
    })
  })
})
