/**
 * PDFExporter Component
 * UI component for exporting resume to PDF
 */

import { useState } from 'react'
import { Download, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { downloadResumePDF, validateResumeForExport, estimatePDFSize } from '../../lib/pdf/pdf-exporter'
import type { ResumeData } from '../../lib/parsers/resume-parser'
import type { TemplateDefinition } from '../../lib/templates/template-definitions'

export interface PDFExporterProps {
  resumeData: ResumeData
  template: TemplateDefinition
  onExportComplete?: () => void
  onExportError?: (error: Error) => void
}

export function PDFExporter({
  resumeData,
  template,
  onExportComplete,
  onExportError
}: PDFExporterProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const validation = validateResumeForExport(resumeData)
  const estimatedSize = estimatePDFSize(resumeData)

  const handleExport = async () => {
    // Show validation if there are errors
    if (!validation.valid) {
      setShowValidation(true)
      return
    }

    setIsExporting(true)

    try {
      await downloadResumePDF(resumeData, template)
      onExportComplete?.()
    } catch (error) {
      console.error('Export failed:', error)
      onExportError?.(error as Error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-3 ${
          isExporting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isExporting ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Export to PDF
          </>
        )}
      </button>

      {/* File Info */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">
              Export Details
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Template:</span>
                <span className="font-medium">{template.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Page Size:</span>
                <span className="font-medium">US Letter (8.5" × 11")</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Size:</span>
                <span className="font-medium">
                  {(estimatedSize / 1024).toFixed(0)} KB
                </span>
              </div>
              <div className="flex justify-between">
                <span>ATS Score:</span>
                <span className="font-medium text-green-600">
                  {template.atsScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && showValidation && (
        <div className="space-y-2">
          {/* Errors */}
          {validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">
                    Required Fields Missing
                  </h4>
                  <ul className="space-y-1">
                    {validation.errors.map((error, idx) => (
                      <li key={idx} className="text-xs text-red-700">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                    Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx} className="text-xs text-yellow-700">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-yellow-600 mt-2">
                    You can still export, but adding this information will improve your resume.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {validation.valid && !showValidation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-800 mb-1">
                Ready to Export
              </h4>
              <p className="text-xs text-green-700">
                Your resume is complete and ready for export. The PDF will be ATS-optimized and professionally formatted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          💡 Export Tips
        </h4>
        <ul className="space-y-1 text-xs text-gray-700">
          <li>• PDF will be saved with your name and today's date</li>
          <li>• All formatting is ATS-compatible (no tables or graphics)</li>
          <li>• File can be directly uploaded to job applications</li>
          <li>• Keep a copy for your records</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Compact PDFExporter Button
 * Minimal version for toolbars
 */
export function PDFExportButton({
  resumeData,
  template,
  onExportComplete,
  onExportError
}: PDFExporterProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    const validation = validateResumeForExport(resumeData)
    
    if (!validation.valid) {
      alert('Please fill in required fields:\n' + validation.errors.join('\n'))
      return
    }

    setIsExporting(true)

    try {
      await downloadResumePDF(resumeData, template)
      onExportComplete?.()
    } catch (error) {
      console.error('Export failed:', error)
      onExportError?.(error as Error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
        isExporting
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
      title="Export to PDF"
    >
      {isExporting ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export PDF
        </>
      )}
    </button>
  )
}
