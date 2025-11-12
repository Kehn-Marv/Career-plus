import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { FileUploader, FileValidator, UploadProgress } from '@/components/upload'
import { ScoreCard } from '@/components/analysis/ScoreCard'
import { AchievementRadar } from '@/components/analysis/AchievementRadar'
import { ATSScoreCard } from '@/components/analysis/ATSScoreCard'
import { AnalysisProgress } from '@/components/analysis'
import { InsightsPanel } from '@/components/insights/InsightsPanel'
import { RecommendationList } from '@/components/recommendations/RecommendationList'
import { AutoFixButton } from '@/components/autofix'
import { ExportPDFButton } from '@/components/export'
import { RegionSelector } from '@/components/localization'
import { BiasReportModal } from '@/components/bias'
import { VersionHistory } from '@/components/version-history'
import { useAnalysisStore } from '@/store/analysis-store'
import { calculateDimensions, analyzeATSCompatibility, detectGaps, analyzeStrengths } from '@/lib/analysis'
import type { DimensionScores } from '@/lib/analysis/dimension-calculator'
import type { ATSIssue } from '@/lib/analysis/ats-analyzer'
import type { GapAnalysis } from '@/lib/analysis/gap-detector'
import type { StrengthAnalysis } from '@/lib/analysis/strength-analyzer'
import type { Resume } from '@/lib/db/schema'

export default function Analyze() {
  const [searchParams] = useSearchParams()
  const analysisId = searchParams.get('analysisId')
  
  const { 
    currentAnalysis, 
    currentResume, 
    currentJobDescription,
    analysisProgress,
    analysisCapabilities,
    isAnalyzing,
    loadAnalysis,
    runAnalysis,
    error: analysisError
  } = useAnalysisStore()
  
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescFile, setJobDescFile] = useState<File | null>(null)
  const [resumeValid, setResumeValid] = useState(false)
  const [jobDescValid, setJobDescValid] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isRestoring, setIsRestoring] = useState(false)
  const [dimensions, setDimensions] = useState<DimensionScores | null>(null)
  const [atsIssues, setAtsIssues] = useState<ATSIssue[]>([])
  const [atsScore, setAtsScore] = useState<number>(0)
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null)
  const [strengthAnalysis, setStrengthAnalysis] = useState<StrengthAnalysis | null>(null)
  const [isBiasModalOpen, setIsBiasModalOpen] = useState(false)

  
  // Load analysis from history if analysisId is provided
  useEffect(() => {
    if (analysisId) {
      const id = parseInt(analysisId, 10)
      if (!isNaN(id)) {
        setIsRestoring(true)
        loadAnalysis(id).finally(() => {
          setIsRestoring(false)
        })
      }
    }
  }, [analysisId, loadAnalysis])

  // Calculate dimensions and ATS issues when analysis completes
  useEffect(() => {
    if (currentAnalysis && currentResume && currentJobDescription) {
      console.log('Analysis completed:', currentAnalysis)
      console.log('Resume:', currentResume)
      console.log('Job Description:', currentJobDescription)
      
      // Convert Resume to ResumeData format
      const resumeData = {
        fileName: currentResume.fileName,
        fileType: currentResume.fileType,
        fileSize: currentResume.fileSize,
        rawText: currentResume.rawText,
        name: currentResume.sections.contact?.name,
        email: currentResume.sections.contact?.email,
        phone: currentResume.sections.contact?.phone,
        location: currentResume.sections.contact?.location,
        linkedin: currentResume.sections.contact?.linkedin,
        portfolio: currentResume.sections.contact?.portfolio,
        summary: currentResume.sections.summary,
        experience: currentResume.sections.experience || [],
        education: currentResume.sections.education || [],
        skills: currentResume.sections.skills || {}
      }
      
      // Convert JobDescription to JobDescriptionData format
      const jobDescData = {
        title: currentJobDescription.title,
        company: currentJobDescription.company,
        location: currentJobDescription.location,
        rawText: currentJobDescription.rawText,
        requirements: currentJobDescription.requirements
      }
      
      // Calculate 6-dimensional scores
      try {
        // Create keyword analysis from insights
        const keywordAnalysis = {
          matchedKeywords: [],
          missingKeywords: (currentAnalysis.insights?.missingKeywords || []).map(kw => ({
            keyword: kw,
            inResume: false,
            inJobDescription: true,
            frequency: 1,
            importance: 'medium' as const,
            weight: 1
          })),
          score: currentAnalysis.scores.keyword,
          matchRate: currentAnalysis.scores.keyword / 100
        }
        
        const dims = calculateDimensions(
          resumeData as any,
          jobDescData as any,
          keywordAnalysis
        )
        setDimensions(dims)
        console.log('Dimensions calculated:', dims)
      } catch (error) {
        console.error('Error calculating dimensions:', error)
      }
      
      // Analyze ATS compatibility
      try {
        const atsResult = analyzeATSCompatibility(currentResume.rawText)
        setAtsIssues(atsResult.issues)
        setAtsScore(atsResult.atsScore)
        console.log('ATS analysis:', atsResult)
      } catch (error) {
        console.error('Error analyzing ATS compatibility:', error)
      }
      
      // Detect gaps
      try {
        const gaps = detectGaps(resumeData as any, jobDescData as any)
        setGapAnalysis(gaps)
        console.log('Gap analysis:', gaps)
      } catch (error) {
        console.error('Error detecting gaps:', error)
      }
      
      // Analyze strengths
      try {
        const strengths = analyzeStrengths(resumeData as any, jobDescData as any)
        setStrengthAnalysis(strengths)
        console.log('Strength analysis:', strengths)
      } catch (error) {
        console.error('Error analyzing strengths:', error)
      }
    }
  }, [currentAnalysis, currentResume, currentJobDescription])

  const handleResumeSelect = (file: File) => {
    setResumeFile(file)
    setResumeValid(false)
  }

  const handleJobDescSelect = (file: File) => {
    setJobDescFile(file)
    setJobDescValid(false)
  }

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescFile || !resumeValid || !jobDescValid) {
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      // Import necessary functions
      const { parseResume, parseJobDescription } = await import('@/lib/parsers')
      const { resumeOps, jobDescriptionOps } = await import('@/lib/db')

      // Step 1: Parse resume (20%)
      setProgress(20)
      const resumeText = await resumeFile.text()
      const parsedResume = await parseResume(
        resumeText,
        resumeFile.name,
        resumeFile.name.endsWith('.pdf') ? 'pdf' : 'docx',
        resumeFile.size
      )

      // Save resume to DB
      const resumeId = await resumeOps.create({
        ...parsedResume,
        uploadDate: new Date()
      })

      // Step 2: Parse job description (40%)
      setProgress(40)
      const jdText = await jobDescFile.text()
      const parsedJD = await parseJobDescription(jdText)

      // Save job description to DB
      const jdId = await jobDescriptionOps.create({
        ...parsedJD,
        uploadDate: new Date()
      })

      // Step 3: Run analysis (60-100%)
      setProgress(60)
      console.log('Starting analysis with resumeId:', resumeId, 'jdId:', jdId)
      await runAnalysis(resumeId, jdId)

      setProgress(100)
      console.log('Analysis complete! Current analysis:', useAnalysisStore.getState().currentAnalysis)
      
      // Success! The analysis results are now in the store and will be displayed
      setTimeout(() => {
        setIsProcessing(false)
        // Scroll to results
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 500)

    } catch (error: any) {
      console.error('Analysis failed:', error)
      console.error('Error stack:', error.stack)
      alert(`Analysis failed: ${error.message}\n\nCheck the console for more details.`)
      setIsProcessing(false)
    }
  }

  const canAnalyze = resumeFile && jobDescFile && resumeValid && jobDescValid

  // Handler for when auto-fix completes
  const handleAutoFixComplete = (result: { optimizedResumeId: number; appliedFixes: number }) => {
    console.log('Auto-fix completed:', result)
    // Optionally refresh analysis or show additional feedback
  }



  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {currentAnalysis ? (
                <>
                  Analysis
                  <span className="block text-emerald-600 mt-2">Results</span>
                </>
              ) : (
                <>
                  Analyze Your
                  <span className="block text-emerald-600 mt-2">Resume</span>
                </>
              )}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {currentAnalysis 
                ? 'Review your detailed analysis and get actionable insights'
                : 'Upload your resume and job description for instant AI-powered feedback'
              }
            </p>
          </div>
          
          {/* Loading State for Restoration */}
          {isRestoring && (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center mb-8 shadow-sm">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-6"></div>
              <p className="text-lg font-medium text-gray-900 mb-2">Loading Analysis</p>
              <p className="text-gray-600">Please wait while we restore your results...</p>
            </div>
          )}
          
          {/* Error State */}
          {analysisError && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-red-900 mb-1">Error</h3>
                  <p className="text-red-800">{analysisError}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Analysis Results Display */}
          {currentAnalysis && !isRestoring && (
            <div className="space-y-8 mb-8">
              {/* Analysis Info Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analysis Details</h2>
                    <p className="text-sm text-gray-600">
                      Analyzed on {new Date(currentAnalysis.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {currentJobDescription && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm font-medium text-blue-600 mb-1">Job Title</p>
                      <p className="font-bold text-gray-900">{currentJobDescription.title}</p>
                      {currentJobDescription.company && (
                        <p className="text-sm text-gray-600 mt-1">{currentJobDescription.company}</p>
                      )}
                    </div>
                  )}
                  {currentResume && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                      <p className="text-sm font-medium text-emerald-600 mb-1">Resume File</p>
                      <p className="font-bold text-gray-900">{currentResume.fileName}</p>
                      <p className="text-sm text-gray-600 mt-1">{(currentResume.fileSize / 1024).toFixed(1)} KB</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Visual Analytics */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Animated Score Card */}
                <ScoreCard
                  overallScore={currentAnalysis.scores.total}
                  breakdown={{
                    semantic: currentAnalysis.scores.semantic,
                    keyword: currentAnalysis.scores.keyword,
                    format: currentAnalysis.scores.format
                  }}
                  animate={true}
                />
                
                {/* 6-Dimensional Radar Chart */}
                {dimensions && (
                  <AchievementRadar dimensions={dimensions} />
                )}
              </div>
              
              {/* ATS Compatibility Card */}
              <ATSScoreCard
                atsScore={atsScore || currentAnalysis.scores.ats}
                issues={atsIssues}
              />
              
              {/* Enhanced Insights Panel */}
              {gapAnalysis && strengthAnalysis && (
                <InsightsPanel 
                  gapAnalysis={gapAnalysis}
                  strengthAnalysis={strengthAnalysis}
                />
              )}
              
              {/* Enhanced Recommendations List */}
              {currentAnalysis.recommendations.length > 0 && (
                <RecommendationList 
                  recommendations={currentAnalysis.recommendations.map(rec => ({
                    id: rec.id,
                    category: rec.type as any,
                    priority: rec.priority,
                    title: rec.suggestedText || 'Recommendation',
                    description: rec.explanation,
                    impact: rec.impact,
                    actionable: true,
                    actions: [rec.explanation]
                  }))}
                  onApply={(id) => console.log('Apply recommendation:', id)}
                  appliedIds={[]}
                />
              )}
              
              {/* Bias Detection Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">Inclusive Language Check</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Your resume has been analyzed for potentially biased language across 8 categories including gender, age, race, disability, religion, marital status, and socioeconomic terms.
                    </p>
                    <button
                      onClick={() => setIsBiasModalOpen(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                      View Detailed Bias Report →
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Regional Localization */}
              {currentAnalysis && (
                <RegionSelector
                  analysisId={currentAnalysis.id!}
                  onLocalizationComplete={(result) => {
                    console.log('Localization completed:', result)
                  }}
                />
              )}
              
              {/* Action Buttons */}
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Take Action</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Auto-Fix Button - Integrated with Optimization Store */}
                  {currentAnalysis && (
                    <AutoFixButton
                      analysisId={currentAnalysis.id!}
                      onComplete={handleAutoFixComplete}
                    />
                  )}
                  {/* Export PDF Button - Integrated with Optimization Store */}
                  {currentAnalysis && (
                    <ExportPDFButton
                      analysisId={currentAnalysis.id!}
                      onExportComplete={() => console.log('PDF export completed successfully')}
                    />
                  )}
                </div>
              </div>
              
              {/* Version History */}
              {currentAnalysis && (
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <VersionHistory
                    analysisId={currentAnalysis.id!}
                    onVersionSelect={(version) => {
                      console.log('Version selected:', version)
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Upload Section - Only show if not viewing a restored analysis */}
          {!currentAnalysis && !isRestoring && (
            <div className="max-w-4xl mx-auto">
              {/* Upload Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Resume Upload */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Resume</h3>
                      <p className="text-sm text-gray-600">PDF or DOCX, max 5MB</p>
                    </div>
                  </div>
                  <FileUploader
                    label=""
                    description="Upload your resume"
                    acceptedFileTypes={['.pdf', '.doc', '.docx']}
                    maxSizeMB={5}
                    currentFile={resumeFile}
                    onFileSelect={handleResumeSelect}
                    onFileRemove={() => {
                      setResumeFile(null)
                      setResumeValid(false)
                    }}
                  />
                  <FileValidator
                    file={resumeFile}
                    validationType="resume"
                    onValidationComplete={(valid, error) => {
                      setResumeValid(valid)
                      if (error) {
                        console.error('Resume validation error:', error)
                      }
                    }}
                  />
                </div>

                {/* Job Description Upload */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Job Description</h3>
                      <p className="text-sm text-gray-600">PDF, DOCX, or TXT</p>
                    </div>
                  </div>
                  <FileUploader
                    label=""
                    description="Upload job posting"
                    acceptedFileTypes={['.pdf', '.doc', '.docx', '.txt']}
                    maxSizeMB={3}
                    currentFile={jobDescFile}
                    onFileSelect={handleJobDescSelect}
                    onFileRemove={() => {
                      setJobDescFile(null)
                      setJobDescValid(false)
                    }}
                  />
                  <FileValidator
                    file={jobDescFile}
                    validationType="job-description"
                    onValidationComplete={(valid, error) => {
                      setJobDescValid(valid)
                      if (error) {
                        console.error('Job description validation error:', error)
                      }
                    }}
                  />
                </div>
              </div>

              {/* Analyze Button */}
              <div className="text-center mb-8">
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || isProcessing}
                  className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Analyze Resume →'
                  )}
                </button>
                <p className="mt-4 text-sm text-gray-500">
                  Takes less than 30 seconds • 100% private
                </p>
              </div>

              {/* Privacy Notice */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Your Privacy is Protected</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      All files are processed locally in your browser. Nothing is uploaded to our servers. 
                      Your resume and analysis results are stored securely in your browser's local storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Analysis Progress with Feature Status */}
      <AnalysisProgress
        show={isAnalyzing || isProcessing}
        progress={{
          stage: analysisProgress.step === 'idle' ? 'parsing' : 
                 analysisProgress.step === 'embedding' ? 'keyword' :
                 analysisProgress.step === 'scoring' ? 'semantic' :
                 analysisProgress.step === 'recommendations' ? 'ai-enhancement' :
                 analysisProgress.step as any,
          percentage: isProcessing ? progress : analysisProgress.percentage,
          message: isProcessing ? 'Analyzing your resume...' : analysisProgress.message,
          estimatedTimeRemaining: analysisProgress.estimatedTimeRemaining
        }}
        capabilities={analysisCapabilities}
      />
      
      {/* Fallback to simple progress for file upload phase */}
      <UploadProgress
        show={isProcessing && !isAnalyzing && progress < 60}
        progress={progress}
        message="Processing files..."
      />
      
      {/* Bias Report Modal */}
      {currentResume && (
        <BiasReportModal
          resume={currentResume}
          isOpen={isBiasModalOpen}
          onClose={() => setIsBiasModalOpen(false)}
          onApplyFixes={(fixedResume: Resume) => {
            console.log('Bias fixes applied:', fixedResume)
            // Optionally update the resume in the database
            // and refresh the analysis
          }}
        />
      )}
      
      <Footer />
    </div>
  )
}
