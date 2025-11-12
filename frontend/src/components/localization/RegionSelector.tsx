import { useState, useRef } from 'react'
import { useOptimizationStore } from '@/store/optimization-store'
import { pdfGenerator } from '@/lib/pdf/pdf-generator'
import type { Region } from '@/lib/optimization/resume-fixer'
import { ariaAnnouncer, useFocusTrap } from '@/lib/accessibility'

interface RegionSelectorProps {
  analysisId: number
  onLocalizationComplete?: (result: { optimizedResumeId: number; region: Region }) => void
}

interface RegionInfo {
  code: Region
  name: string
  flag: string
  description: string
  features: string[]
}

const REGIONS: RegionInfo[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    description: 'Optimized for US job market',
    features: [
      'No photo or personal details',
      'MM/DD/YYYY date format',
      'Skills-first approach',
      'Quantifiable achievements'
    ]
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    description: 'Optimized for UK job market',
    features: [
      'Optional photo',
      'DD/MM/YYYY date format',
      'CV terminology',
      'Nationality if relevant'
    ]
  },
  {
    code: 'EU',
    name: 'European Union',
    flag: '🇪🇺',
    description: 'Optimized for EU job market',
    features: [
      'Photo expected',
      'DD.MM.YYYY date format',
      'Date of birth included',
      'Detailed personal info'
    ]
  },
  {
    code: 'APAC',
    name: 'Asia-Pacific',
    flag: '🌏',
    description: 'Optimized for APAC job market',
    features: [
      'Photo required',
      'YYYY/MM/DD date format',
      'Personal details section',
      'Formal tone'
    ]
  }
]

export function RegionSelector({ analysisId, onLocalizationComplete }: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const {
    currentOptimizedResume,
    isApplyingLocalization,
    applyLocalization,
    loadLatestOptimizedResume
  } = useOptimizationStore()

  const handleClosePreview = () => {
    setShowPreview(false)
    setSelectedRegion(null)
    setError(null)
    ariaAnnouncer.announce('Preview modal closed', { priority: 'polite' })
  }
  
  // Focus trap for modal
  useFocusTrap(modalRef, showPreview, {
    escapeDeactivates: true,
    onEscape: handleClosePreview
  })

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region)
    setShowPreview(true)
    setError(null)
    
    const regionInfo = REGIONS.find(r => r.code === region)
    if (regionInfo) {
      ariaAnnouncer.announce(`Selected ${regionInfo.name} region. Preview modal opened.`, { priority: 'polite' })
    }
  }

  const handleApplyLocalization = async () => {
    if (!selectedRegion) return

    try {
      setIsProcessing(true)
      setError(null)
      
      ariaAnnouncer.announce(`Applying ${selectedRegion} localization`, { priority: 'polite' })

      // Check if optimized resume exists
      if (!currentOptimizedResume) {
        // Try to load latest optimized resume
        await loadLatestOptimizedResume(analysisId)
        
        // Check again after loading
        const state = useOptimizationStore.getState()
        if (!state.currentOptimizedResume) {
          throw new Error('No optimized resume found. Please run Auto Fix first.')
        }
      }

      const optimizedResumeId = useOptimizationStore.getState().currentOptimizedResume!.id!

      // Apply regional localization
      const localizedResume = await applyLocalization(optimizedResumeId, selectedRegion)

      // Generate PDF with region-specific filename
      const { templateEngine } = await import('@/lib/templates/template-engine')
      const template = templateEngine.getTemplate(localizedResume.templateId)
      
      if (!template) {
        throw new Error(`Template not found: ${localizedResume.templateId}`)
      }
      
      const blob = await pdfGenerator.generatePDF(localizedResume, template)

      // Generate filename: Resume_[Region]_[JobTitle]_[Date].pdf
      const jobTitle = localizedResume.content.experience[0]?.title || 'Resume'
      const date = new Date().toISOString().split('T')[0]
      const fileName = `Resume_${selectedRegion}_${jobTitle.replace(/\s+/g, '_')}_${date}.pdf`

      // Trigger download
      pdfGenerator.downloadPDF(blob, fileName)
      
      ariaAnnouncer.announceSuccess(`${selectedRegion} localized resume downloaded successfully`)

      // Close preview and notify completion
      setShowPreview(false)
      setSelectedRegion(null)
      
      if (onLocalizationComplete) {
        onLocalizationComplete({
          optimizedResumeId: localizedResume.id!,
          region: selectedRegion
        })
      }

    } catch (err: any) {
      console.error('Localization failed:', err)
      const errorMsg = err.message || 'Failed to apply regional localization'
      setError(errorMsg)
      ariaAnnouncer.announceError(`Localization failed: ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedRegionInfo = REGIONS.find(r => r.code === selectedRegion)

  return (
    <>
      {/* Region Selection Buttons */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-2">Regional Localization</h3>
            <p className="text-sm text-gray-600 mb-3">
              Optimize your resume for specific regions with tailored formatting and terminology.
            </p>
            <div className="flex gap-2 flex-wrap">
              {REGIONS.map(region => (
                <button
                  key={region.code}
                  onClick={() => handleRegionSelect(region.code)}
                  disabled={isApplyingLocalization || isProcessing}
                  className="px-4 py-2 bg-white border-2 border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  aria-label={`Optimize for ${region.name}`}
                  title={region.description}
                >
                  <span className="mr-2" aria-hidden="true">{region.flag}</span>
                  {region.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedRegionInfo && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="region-modal-title"
          aria-describedby="region-modal-description"
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                    {selectedRegionInfo.flag}
                  </div>
                  <div>
                    <h2 id="region-modal-title" className="text-2xl font-bold">{selectedRegionInfo.name}</h2>
                    <p id="region-modal-description" className="text-blue-100 text-sm">{selectedRegionInfo.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleClosePreview}
                  disabled={isProcessing}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Close preview modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Regional Features
                  </h3>
                  <ul className="space-y-2">
                    {selectedRegionInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                        <div className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          ✓
                        </div>
                        <span className="text-gray-800">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">What happens next?</h4>
                      <p className="text-sm text-amber-800">
                        Your resume will be reformatted according to {selectedRegionInfo.name} standards, 
                        and a PDF will be automatically downloaded with region-specific formatting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleClosePreview}
                  disabled={isProcessing}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyLocalization}
                  disabled={isProcessing || isApplyingLocalization}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  aria-label={isProcessing ? "Applying localization, please wait" : "Apply localization and download"}
                >
                  {isProcessing || isApplyingLocalization ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Apply & Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
