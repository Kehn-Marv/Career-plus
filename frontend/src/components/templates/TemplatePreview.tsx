/**
 * TemplatePreview Component
 * Live preview of resume with selected template and user data
 */

import { useState, useEffect } from 'react'
import { ZoomIn, ZoomOut, Download, RefreshCw } from 'lucide-react'
import type { ResumeData } from '../../lib/parsers/resume-parser'
import type { TemplateDefinition } from '../../lib/templates/template-definitions'

export interface TemplatePreviewProps {
  template: TemplateDefinition
  resumeData: ResumeData
  onExport?: () => void
}

export function TemplatePreview({
  template,
  resumeData,
  onExport
}: TemplatePreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [key, setKey] = useState(0)

  // Reset zoom when template changes
  useEffect(() => {
    setZoom(100)
  }, [template.id])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50))
  }

  const handleRefresh = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Preview: {template.name}
          </h3>
          <p className="text-xs text-gray-600">
            Live preview with your resume data
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-700" />
            </button>
            <span className="text-xs font-medium text-gray-700 px-2 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="w-4 h-4 text-gray-700" />
          </button>

          {/* Export */}
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8">
        <div
          className="mx-auto bg-white shadow-lg"
          style={{
            width: '8.5in',
            minHeight: '11in',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s'
          }}
        >
          <ResumePreviewContent
            key={key}
            template={template}
            resumeData={resumeData}
          />
        </div>
      </div>

      {/* Page Info */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
        <p className="text-xs text-gray-600">
          US Letter (8.5" × 11") • {template.name} Template • ATS Score: {template.atsScore}%
        </p>
      </div>
    </div>
  )
}

/**
 * Resume Preview Content
 * Renders the actual resume content with template styling
 */
function ResumePreviewContent({
  template,
  resumeData
}: {
  template: TemplateDefinition
  resumeData: ResumeData
}) {
  const { colors, fonts, layout } = template

  return (
    <div
      style={{
        padding: `${layout.margins.top}px ${layout.margins.right}px ${layout.margins.bottom}px ${layout.margins.left}px`,
        fontFamily: fonts.body,
        color: colors.text,
        fontSize: `${fonts.size.body}pt`,
        lineHeight: 1.4
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: `${layout.spacing.section}px` }}>
        <h1
          style={{
            fontSize: `${fonts.size.name}pt`,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: `${layout.spacing.item}px`,
            fontFamily: fonts.heading
          }}
        >
          {resumeData.name || 'Your Name'}
        </h1>

        {/* Contact Info */}
        <div
          style={{
            fontSize: `${fonts.size.small}pt`,
            color: colors.secondary,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {resumeData.email && <span>{resumeData.email}</span>}
          {resumeData.phone && <span>•</span>}
          {resumeData.phone && <span>{resumeData.phone}</span>}
          {resumeData.location && <span>•</span>}
          {resumeData.location && <span>{resumeData.location}</span>}
          {resumeData.linkedin && <span>•</span>}
          {resumeData.linkedin && <span>{resumeData.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {resumeData.summary && (
        <div style={{ marginBottom: `${layout.spacing.section}px` }}>
          <SectionHeader title="PROFESSIONAL SUMMARY" colors={colors} fonts={fonts} />
          <p style={{ marginTop: `${layout.spacing.item}px` }}>
            {resumeData.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience.length > 0 && (
        <div style={{ marginBottom: `${layout.spacing.section}px` }}>
          <SectionHeader title="EXPERIENCE" colors={colors} fonts={fonts} />
          <div style={{ marginTop: `${layout.spacing.item}px` }}>
            {resumeData.experience.map((exp: ResumeData['experience'][0], idx: number) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx < resumeData.experience.length - 1 ? `${layout.spacing.item * 2}px` : 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: `${layout.spacing.line}px` }}>
                  <div style={{ fontWeight: 'bold', fontSize: `${fonts.size.subheading}pt` }}>
                    {exp.title}
                  </div>
                  <div style={{ fontSize: `${fonts.size.small}pt`, color: colors.secondary }}>
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                <div style={{ fontSize: `${fonts.size.small}pt`, color: colors.secondary, marginBottom: `${layout.spacing.line}px` }}>
                  {exp.company}
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {exp.description?.map((bullet: string, bulletIdx: number) => (
                    <li
                      key={bulletIdx}
                      style={{
                        marginBottom: `${layout.spacing.line}px`,
                        color: colors.text
                      }}
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <div style={{ marginBottom: `${layout.spacing.section}px` }}>
          <SectionHeader title="EDUCATION" colors={colors} fonts={fonts} />
          <div style={{ marginTop: `${layout.spacing.item}px` }}>
            {resumeData.education.map((edu: ResumeData['education'][0], idx: number) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx < resumeData.education.length - 1 ? `${layout.spacing.item}px` : 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: `${layout.spacing.line}px` }}>
                  <div style={{ fontWeight: 'bold', fontSize: `${fonts.size.subheading}pt` }}>
                    {edu.degree}
                  </div>
                  <div style={{ fontSize: `${fonts.size.small}pt`, color: colors.secondary }}>
                    {edu.graduationDate}
                  </div>
                </div>
                <div style={{ fontSize: `${fonts.size.small}pt`, color: colors.secondary }}>
                  {edu.institution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <div style={{ marginBottom: `${layout.spacing.section}px` }}>
          <SectionHeader title="SKILLS" colors={colors} fonts={fonts} />
          <div
            style={{
              marginTop: `${layout.spacing.item}px`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            {resumeData.skills.map((skill: string, idx: number) => (
              <span
                key={idx}
                style={{
                  fontSize: `${fonts.size.small}pt`,
                  padding: '4px 8px',
                  backgroundColor: `${colors.accent}20`,
                  borderRadius: '4px',
                  color: colors.text
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resumeData.certifications && resumeData.certifications.length > 0 && (
        <div>
          <SectionHeader title="CERTIFICATIONS" colors={colors} fonts={fonts} />
          <ul style={{ margin: `${layout.spacing.item}px 0 0 20px`, padding: 0 }}>
            {resumeData.certifications?.map((cert: string, idx: number) => (
              <li
                key={idx}
                style={{
                  marginBottom: `${layout.spacing.line}px`,
                  color: colors.text
                }}
              >
                {cert}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Section Header Component
 */
function SectionHeader({
  title,
  colors,
  fonts
}: {
  title: string
  colors: TemplateDefinition['colors']
  fonts: TemplateDefinition['fonts']
}) {
  return (
    <h2
      style={{
        fontSize: `${fonts.size.heading}pt`,
        fontWeight: 'bold',
        color: colors.primary,
        borderBottom: `2px solid ${colors.accent}`,
        paddingBottom: '4px',
        fontFamily: fonts.heading,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
    >
      {title}
    </h2>
  )
}
