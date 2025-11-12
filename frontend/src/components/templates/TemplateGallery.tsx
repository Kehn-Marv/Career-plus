/**
 * TemplateGallery Component
 * Displays all available resume templates with preview, selection, and comparison features
 */

import { useState } from 'react'
import { Check, Eye, X, GitCompare, Award } from 'lucide-react'
import type { TemplateConfig } from '@/lib/templates/template-config'
import { templateEngine } from '@/lib/templates/template-engine'

export interface TemplateGalleryProps {
  selectedTemplateId?: string
  onTemplateSelect: (templateId: string) => void
  className?: string
}

/**
 * TemplateGallery Component
 * Grid layout with template thumbnails, ATS scores, and preview/comparison features
 */
export function TemplateGallery({
  selectedTemplateId,
  onTemplateSelect,
  className = ''
}: TemplateGalleryProps) {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareTemplates, setCompareTemplates] = useState<TemplateConfig[]>([])
  
  const templates = templateEngine.getAllTemplates()

  const handleTemplateClick = (template: TemplateConfig) => {
    if (compareMode) {
      handleCompareToggle(template)
    } else {
      onTemplateSelect(template.id)
    }
  }

  const handlePreview = (template: TemplateConfig, e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewTemplate(template)
  }

  const handleCompareToggle = (template: TemplateConfig) => {
    setCompareTemplates(prev => {
      const exists = prev.find(t => t.id === template.id)
      if (exists) {
        return prev.filter(t => t.id !== template.id)
      } else if (prev.length < 3) {
        return [...prev, template]
      }
      return prev
    })
  }

  const toggleCompareMode = () => {
    setCompareMode(!compareMode)
    if (compareMode) {
      setCompareTemplates([])
    }
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Resume Templates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose a professional template optimized for ATS compatibility
          </p>
        </div>
        
        <button
          onClick={toggleCompareMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            compareMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          {compareMode ? 'Exit Compare' : 'Compare Templates'}
        </button>
      </div>

      {/* Compare Mode Info */}
      {compareMode && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Compare Mode:</strong> Select up to 3 templates to compare side-by-side.
            {compareTemplates.length > 0 && (
              <span className="ml-2">
                ({compareTemplates.length} selected)
              </span>
            )}
          </p>
          {compareTemplates.length >= 2 && (
            <button
              onClick={() => setPreviewTemplate(compareTemplates[0])}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Comparison →
            </button>
          )}
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => {
          const isSelected = template.id === selectedTemplateId
          const isComparing = compareTemplates.find(t => t.id === template.id)
          
          return (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={isSelected}
              isComparing={!!isComparing}
              onClick={() => handleTemplateClick(template)}
              onPreview={(e) => handlePreview(template, e)}
            />
          )
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          compareTemplates={compareMode && compareTemplates.length >= 2 ? compareTemplates : undefined}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(templateId) => {
            onTemplateSelect(templateId)
            setPreviewTemplate(null)
            setCompareMode(false)
            setCompareTemplates([])
          }}
          selectedTemplateId={selectedTemplateId}
        />
      )}
    </div>
  )
}

/**
 * TemplateCard Component
 * Individual template card with thumbnail, ATS score, and actions
 */
interface TemplateCardProps {
  template: TemplateConfig
  isSelected: boolean
  isComparing: boolean
  onClick: () => void
  onPreview: (e: React.MouseEvent) => void
}

function TemplateCard({
  template,
  isSelected,
  isComparing,
  onClick,
  onPreview
}: TemplateCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer group ${
        isSelected
          ? 'border-blue-600 shadow-lg'
          : isComparing
          ? 'border-green-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white rounded-full p-1.5">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Compare Indicator */}
      {isComparing && (
        <div className="absolute top-3 right-3 z-10 bg-green-600 text-white rounded-full p-1.5">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* ATS Score Badge */}
      <div className="absolute top-3 left-3 z-10">
        <ATSScoreBadge score={template.atsScore} />
      </div>

      {/* Template Thumbnail */}
      <div className="relative aspect-[8.5/11] bg-gray-50 rounded-t-lg overflow-hidden">
        <TemplateThumbnail template={template} />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={onPreview}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {getTemplateDescription(template)}
        </p>
        
        {/* Template Features */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {template.style}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {template.layout.columns} column
          </span>
          {template.sections.showDividers && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              dividers
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ATS Score Badge Component
 */
function ATSScoreBadge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'bg-green-600'
    if (score >= 90) return 'bg-blue-600'
    return 'bg-yellow-600'
  }

  return (
    <div className={`${getScoreColor(score)} text-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5`}>
      <Award className="w-4 h-4" />
      <span className="text-sm font-bold">ATS {score}</span>
    </div>
  )
}

/**
 * Template Thumbnail Component
 * Renders a visual preview of the template
 */
function TemplateThumbnail({ template }: { template: TemplateConfig }) {
  const { colors, typography } = template

  return (
    <div
      className="w-full h-full p-4"
      style={{
        fontFamily: typography.fontFamily,
        backgroundColor: '#ffffff'
      }}
    >
      {/* Header */}
      <div className="mb-3">
        <div
          className="font-bold mb-1"
          style={{
            color: colors.primary,
            fontSize: `${typography.fontSize.name * 0.4}px`,
            fontWeight: typography.fontWeight.name
          }}
        >
          Your Name
        </div>
        <div
          className="text-xs"
          style={{
            color: colors.secondary,
            fontSize: `${typography.fontSize.small * 0.4}px`
          }}
        >
          email@example.com • (555) 123-4567
        </div>
      </div>

      {/* Section Example */}
      <div className="mb-2">
        <div
          className="font-semibold mb-1"
          style={{
            color: colors.primary,
            fontSize: `${typography.fontSize.heading * 0.4}px`,
            fontWeight: typography.fontWeight.heading,
            borderBottom: template.sections.showDividers ? `1px solid ${colors.accent}` : 'none',
            paddingBottom: template.sections.showDividers ? '2px' : '0'
          }}
        >
          EXPERIENCE
        </div>
        <div className="space-y-1">
          <div
            className="font-medium"
            style={{
              color: colors.text,
              fontSize: `${typography.fontSize.body * 0.4}px`
            }}
          >
            Job Title
          </div>
          <div
            style={{
              color: colors.secondary,
              fontSize: `${typography.fontSize.small * 0.4}px`
            }}
          >
            Company Name
          </div>
          <div
            className="space-y-0.5"
            style={{
              color: colors.text,
              fontSize: `${typography.fontSize.body * 0.35}px`
            }}
          >
            <div>• Achievement with metrics</div>
            <div>• Key responsibility</div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <div
          className="font-semibold mb-1"
          style={{
            color: colors.primary,
            fontSize: `${typography.fontSize.heading * 0.4}px`,
            fontWeight: typography.fontWeight.heading,
            borderBottom: template.sections.showDividers ? `1px solid ${colors.accent}` : 'none',
            paddingBottom: template.sections.showDividers ? '2px' : '0'
          }}
        >
          SKILLS
        </div>
        <div className="flex flex-wrap gap-1">
          {['Skill 1', 'Skill 2', 'Skill 3'].map((skill, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${colors.accent}20`,
                color: colors.text,
                fontSize: `${typography.fontSize.small * 0.35}px`
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Template Preview Modal
 * Full-size preview with comparison support
 */
interface TemplatePreviewModalProps {
  template: TemplateConfig
  compareTemplates?: TemplateConfig[]
  onClose: () => void
  onSelect: (templateId: string) => void
  selectedTemplateId?: string
}

function TemplatePreviewModal({
  template,
  compareTemplates,
  onClose,
  onSelect,
  selectedTemplateId
}: TemplatePreviewModalProps) {
  const [activeTemplate, setActiveTemplate] = useState(template)
  const isComparison = compareTemplates && compareTemplates.length >= 2

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isComparison ? 'Compare Templates' : 'Template Preview'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isComparison
                  ? `Comparing ${compareTemplates.length} templates side-by-side`
                  : activeTemplate.name
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Template Tabs (for comparison) */}
          {isComparison && (
            <div className="flex gap-2 mt-4">
              {compareTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTemplate.id === t.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {isComparison ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compareTemplates.map(t => (
                <TemplateComparisonCard
                  key={t.id}
                  template={t}
                  isSelected={t.id === selectedTemplateId}
                  onSelect={() => onSelect(t.id)}
                />
              ))}
            </div>
          ) : (
            <TemplateFullPreview template={activeTemplate} />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ATSScoreBadge score={activeTemplate.atsScore} />
              <div className="text-sm text-gray-600">
                <span className="font-medium">{activeTemplate.style}</span> style •{' '}
                <span>{activeTemplate.layout.columns} column</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSelect(activeTemplate.id)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Select Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Template Comparison Card
 * Shows template details in comparison view
 */
interface TemplateComparisonCardProps {
  template: TemplateConfig
  isSelected: boolean
  onSelect: () => void
}

function TemplateComparisonCard({
  template,
  isSelected,
  onSelect
}: TemplateComparisonCardProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-[8.5/11] bg-gray-50">
        <TemplateThumbnail template={template} />
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {template.name}
          </h3>
          <ATSScoreBadge score={template.atsScore} />
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {getTemplateDescription(template)}
        </p>

        {/* Comparison Features */}
        <div className="space-y-2 mb-4">
          <ComparisonFeature
            label="Style"
            value={template.style}
          />
          <ComparisonFeature
            label="Layout"
            value={`${template.layout.columns} column`}
          />
          <ComparisonFeature
            label="Font"
            value={template.typography.fontFamily.split(',')[0]}
          />
          <ComparisonFeature
            label="Sections"
            value={`${template.sections.order.length} sections`}
          />
          <ComparisonFeature
            label="Dividers"
            value={template.sections.showDividers ? 'Yes' : 'No'}
          />
        </div>

        {/* Select Button */}
        <button
          onClick={onSelect}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isSelected ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Selected
            </span>
          ) : (
            'Select'
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Comparison Feature Row
 */
function ComparisonFeature({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}

/**
 * Template Full Preview
 * Large preview of single template
 */
function TemplateFullPreview({ template }: { template: TemplateConfig }) {
  const { colors, typography } = template

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        style={{
          aspectRatio: '8.5 / 11'
        }}
      >
        <div
          className="w-full h-full overflow-auto"
          style={{
            padding: `${template.layout.margins.top}px ${template.layout.margins.right}px ${template.layout.margins.bottom}px ${template.layout.margins.left}px`,
            fontFamily: typography.fontFamily
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: `${template.layout.spacing.section}px` }}>
            <h1
              style={{
                fontSize: `${typography.fontSize.name}px`,
                fontWeight: typography.fontWeight.name,
                color: colors.primary,
                marginBottom: `${template.layout.spacing.item}px`
              }}
            >
              Your Name
            </h1>
            <div
              style={{
                fontSize: `${typography.fontSize.small}px`,
                color: colors.secondary,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <span>email@example.com</span>
              <span>•</span>
              <span>(555) 123-4567</span>
              <span>•</span>
              <span>City, State</span>
              <span>•</span>
              <span>linkedin.com/in/yourname</span>
            </div>
          </div>

          {/* Professional Summary */}
          <div style={{ marginBottom: `${template.layout.spacing.section}px` }}>
            <SectionHeader
              title="PROFESSIONAL SUMMARY"
              colors={colors}
              typography={typography}
              showDivider={template.sections.showDividers}
            />
            <p
              style={{
                marginTop: `${template.layout.spacing.item}px`,
                fontSize: `${typography.fontSize.body}px`,
                color: colors.text,
                lineHeight: 1.6
              }}
            >
              Results-driven professional with 5+ years of experience in software development.
              Proven track record of delivering high-quality solutions and leading cross-functional teams.
              Passionate about creating innovative products that solve real-world problems.
            </p>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: `${template.layout.spacing.section}px` }}>
            <SectionHeader
              title="EXPERIENCE"
              colors={colors}
              typography={typography}
              showDivider={template.sections.showDividers}
            />
            <div style={{ marginTop: `${template.layout.spacing.item}px` }}>
              {/* Job 1 */}
              <div style={{ marginBottom: `${template.layout.spacing.item * 2}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: `${template.layout.spacing.line}px` }}>
                  <div
                    style={{
                      fontSize: `${typography.fontSize.heading}px`,
                      fontWeight: typography.fontWeight.heading,
                      color: colors.text
                    }}
                  >
                    Senior Software Engineer
                  </div>
                  <div
                    style={{
                      fontSize: `${typography.fontSize.small}px`,
                      color: colors.secondary
                    }}
                  >
                    2020 - Present
                  </div>
                </div>
                <div
                  style={{
                    fontSize: `${typography.fontSize.body}px`,
                    color: colors.secondary,
                    marginBottom: `${template.layout.spacing.line}px`
                  }}
                >
                  Tech Company Inc.
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li
                    style={{
                      marginBottom: `${template.layout.spacing.line}px`,
                      fontSize: `${typography.fontSize.body}px`,
                      color: colors.text
                    }}
                  >
                    Led development of microservices architecture, improving system scalability by 300%
                  </li>
                  <li
                    style={{
                      marginBottom: `${template.layout.spacing.line}px`,
                      fontSize: `${typography.fontSize.body}px`,
                      color: colors.text
                    }}
                  >
                    Mentored team of 5 junior developers, resulting in 40% faster feature delivery
                  </li>
                  <li
                    style={{
                      fontSize: `${typography.fontSize.body}px`,
                      color: colors.text
                    }}
                  >
                    Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes
                  </li>
                </ul>
              </div>

              {/* Job 2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: `${template.layout.spacing.line}px` }}>
                  <div
                    style={{
                      fontSize: `${typography.fontSize.heading}px`,
                      fontWeight: typography.fontWeight.heading,
                      color: colors.text
                    }}
                  >
                    Software Engineer
                  </div>
                  <div
                    style={{
                      fontSize: `${typography.fontSize.small}px`,
                      color: colors.secondary
                    }}
                  >
                    2018 - 2020
                  </div>
                </div>
                <div
                  style={{
                    fontSize: `${typography.fontSize.body}px`,
                    color: colors.secondary,
                    marginBottom: `${template.layout.spacing.line}px`
                  }}
                >
                  Startup Solutions LLC
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li
                    style={{
                      marginBottom: `${template.layout.spacing.line}px`,
                      fontSize: `${typography.fontSize.body}px`,
                      color: colors.text
                    }}
                  >
                    Built RESTful APIs serving 100K+ daily active users with 99.9% uptime
                  </li>
                  <li
                    style={{
                      fontSize: `${typography.fontSize.body}px`,
                      color: colors.text
                    }}
                  >
                    Optimized database queries reducing response time by 60%
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Education */}
          <div style={{ marginBottom: `${template.layout.spacing.section}px` }}>
            <SectionHeader
              title="EDUCATION"
              colors={colors}
              typography={typography}
              showDivider={template.sections.showDividers}
            />
            <div style={{ marginTop: `${template.layout.spacing.item}px` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: `${template.layout.spacing.line}px` }}>
                <div
                  style={{
                    fontSize: `${typography.fontSize.heading}px`,
                    fontWeight: typography.fontWeight.heading,
                    color: colors.text
                  }}
                >
                  Bachelor of Science in Computer Science
                </div>
                <div
                  style={{
                    fontSize: `${typography.fontSize.small}px`,
                    color: colors.secondary
                  }}
                >
                  2018
                </div>
              </div>
              <div
                style={{
                  fontSize: `${typography.fontSize.body}px`,
                  color: colors.secondary
                }}
              >
                University Name
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <SectionHeader
              title="SKILLS"
              colors={colors}
              typography={typography}
              showDivider={template.sections.showDividers}
            />
            <div
              style={{
                marginTop: `${template.layout.spacing.item}px`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              {[
                'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
                'AWS', 'Docker', 'PostgreSQL', 'Git', 'Agile'
              ].map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: `${typography.fontSize.small}px`,
                    padding: '6px 12px',
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
        </div>
      </div>
    </div>
  )
}

/**
 * Section Header for Full Preview
 */
function SectionHeader({
  title,
  colors,
  typography,
  showDivider
}: {
  title: string
  colors: TemplateConfig['colors']
  typography: TemplateConfig['typography']
  showDivider: boolean
}) {
  return (
    <h2
      style={{
        fontSize: `${typography.fontSize.heading}px`,
        fontWeight: typography.fontWeight.heading,
        color: colors.primary,
        borderBottom: showDivider ? `2px solid ${colors.accent}` : 'none',
        paddingBottom: showDivider ? '4px' : '0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
    >
      {title}
    </h2>
  )
}

/**
 * Get template description based on style
 */
function getTemplateDescription(template: TemplateConfig): string {
  const descriptions: Record<string, string> = {
    'modern-professional': 'Clean single-column layout with sans-serif fonts and subtle color accents',
    'classic-executive': 'Traditional serif fonts with conservative black & white design',
    'minimal-tech': 'Ultra-clean layout with maximum white space and monospace accents'
  }

  return descriptions[template.id] || `${template.style} style template with ${template.layout.columns} column layout`
}
