/**
 * Example usage of AnalysisProgress component
 * Demonstrates different states and configurations
 */

import { useState } from 'react'
import AnalysisProgress from './AnalysisProgress'
import FeatureStatusIndicator from './FeatureStatusIndicator'
import type { AnalysisProgress as AnalysisProgressType, AnalysisCapabilities } from '@/lib/ai/enhanced-types'

// Example capabilities - all features active
const fullCapabilities: AnalysisCapabilities = {
  keywordMatching: 'enhanced',
  semanticAnalysis: 'ai',
  bulletQuality: 'ai',
  formatAnalysis: 'comprehensive',
  atsSimulation: 'full',
  industryRules: true,
  adaptiveThresholds: true
}

// Example capabilities - degraded mode
const degradedCapabilities: AnalysisCapabilities = {
  keywordMatching: 'basic',
  semanticAnalysis: 'keyword-only',
  bulletQuality: 'rule-based',
  formatAnalysis: 'basic',
  atsSimulation: 'basic',
  industryRules: false,
  adaptiveThresholds: false
}

// Example capabilities - mixed mode
const mixedCapabilities: AnalysisCapabilities = {
  keywordMatching: 'enhanced',
  semanticAnalysis: 'embedding',
  bulletQuality: 'rule-based',
  formatAnalysis: 'comprehensive',
  atsSimulation: 'full',
  industryRules: true,
  adaptiveThresholds: true
}

export default function AnalysisProgressExample() {
  const [showProgress, setShowProgress] = useState(false)
  const [currentStage, setCurrentStage] = useState<AnalysisProgressType['stage']>('parsing')
  const [percentage, setPercentage] = useState(0)
  const [capabilityMode, setCapabilityMode] = useState<'full' | 'degraded' | 'mixed'>('full')

  const capabilities = 
    capabilityMode === 'full' ? fullCapabilities :
    capabilityMode === 'degraded' ? degradedCapabilities :
    mixedCapabilities

  const stageMessages: Record<AnalysisProgressType['stage'], string> = {
    parsing: 'Extracting text and structure from your files',
    keyword: 'Matching skills and requirements with enhanced algorithms',
    semantic: 'Understanding context and meaning with AI',
    format: 'Evaluating structure, bullets, and visual quality',
    ats: 'Testing compatibility with applicant tracking systems',
    'ai-enhancement': 'Generating intelligent insights and recommendations',
    complete: 'Analysis finished successfully'
  }

  const stagePercentages: Record<AnalysisProgressType['stage'], number> = {
    parsing: 10,
    keyword: 30,
    semantic: 50,
    format: 70,
    ats: 85,
    'ai-enhancement': 95,
    complete: 100
  }

  const stageTimes: Record<AnalysisProgressType['stage'], number> = {
    parsing: 55,
    keyword: 45,
    semantic: 30,
    format: 20,
    ats: 10,
    'ai-enhancement': 5,
    complete: 0
  }

  const progress: AnalysisProgressType = {
    stage: currentStage,
    percentage: percentage || stagePercentages[currentStage],
    message: stageMessages[currentStage],
    estimatedTimeRemaining: stageTimes[currentStage]
  }

  const simulateAnalysis = () => {
    setShowProgress(true)
    setPercentage(0)
    setCurrentStage('parsing')

    const stages: AnalysisProgressType['stage'][] = [
      'parsing', 'keyword', 'semantic', 'format', 'ats', 'ai-enhancement', 'complete'
    ]

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < stages.length) {
        setCurrentStage(stages[currentIndex])
        setPercentage(stagePercentages[stages[currentIndex]])
        currentIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowProgress(false), 2000)
      }
    }, 2000)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Progress Tracking Examples</h1>
        <p className="text-gray-600 mb-8">
          Demonstration of the analysis progress tracking system
        </p>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          <div className="space-y-4">
            {/* Capability Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capability Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCapabilityMode('full')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    capabilityMode === 'full'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Full (All AI)
                </button>
                <button
                  onClick={() => setCapabilityMode('mixed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    capabilityMode === 'mixed'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mixed (Partial AI)
                </button>
                <button
                  onClick={() => setCapabilityMode('degraded')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    capabilityMode === 'degraded'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Degraded (No AI)
                </button>
              </div>
            </div>

            {/* Stage Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stage
              </label>
              <select
                value={currentStage}
                onChange={(e) => setCurrentStage(e.target.value as AnalysisProgressType['stage'])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="parsing">Parsing</option>
                <option value="keyword">Keyword Analysis</option>
                <option value="semantic">Semantic Analysis</option>
                <option value="format">Format Analysis</option>
                <option value="ats">ATS Simulation</option>
                <option value="ai-enhancement">AI Enhancement</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            {/* Progress Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress: {percentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowProgress(!showProgress)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {showProgress ? 'Hide' : 'Show'} Progress
              </button>
              <button
                onClick={simulateAnalysis}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Simulate Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Feature Status Display */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Feature Status</h2>
          <FeatureStatusIndicator
            capabilities={capabilities}
            compact={false}
            showDetails={true}
          />
        </div>

        {/* Compact Feature Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Compact Feature Status</h2>
          <FeatureStatusIndicator
            capabilities={capabilities}
            compact={true}
            showDetails={false}
          />
        </div>
      </div>

      {/* Progress Modal */}
      <AnalysisProgress
        show={showProgress}
        progress={progress}
        capabilities={capabilities}
      />
    </div>
  )
}

// Example: Using in a real analysis flow
export function RealWorldExample() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState<AnalysisProgressType>({
    stage: 'parsing',
    percentage: 0,
    message: '',
    estimatedTimeRemaining: 0
  })
  const [capabilities] = useState<AnalysisCapabilities>(fullCapabilities)

  const runAnalysis = async () => {
    setIsAnalyzing(true)

    // Simulate analysis stages
    const stages: Array<{
      stage: AnalysisProgressType['stage']
      percentage: number
      message: string
      time: number
      duration: number
    }> = [
      { stage: 'parsing', percentage: 10, message: 'Loading documents...', time: 55, duration: 2000 },
      { stage: 'keyword', percentage: 30, message: 'Analyzing keywords...', time: 45, duration: 3000 },
      { stage: 'semantic', percentage: 50, message: 'Understanding context...', time: 30, duration: 4000 },
      { stage: 'format', percentage: 70, message: 'Checking format...', time: 20, duration: 3000 },
      { stage: 'ats', percentage: 85, message: 'Simulating ATS...', time: 10, duration: 2000 },
      { stage: 'ai-enhancement', percentage: 95, message: 'Generating insights...', time: 5, duration: 2000 },
      { stage: 'complete', percentage: 100, message: 'Complete!', time: 0, duration: 1000 }
    ]

    for (const stage of stages) {
      setProgress({
        stage: stage.stage,
        percentage: stage.percentage,
        message: stage.message,
        estimatedTimeRemaining: stage.time
      })
      await new Promise(resolve => setTimeout(resolve, stage.duration))
    }

    setIsAnalyzing(false)
  }

  return (
    <div className="p-8">
      <button
        onClick={runAnalysis}
        disabled={isAnalyzing}
        className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
      </button>

      <AnalysisProgress
        show={isAnalyzing}
        progress={progress}
        capabilities={capabilities}
      />
    </div>
  )
}
