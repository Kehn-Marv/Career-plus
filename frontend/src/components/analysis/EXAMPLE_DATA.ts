/**
 * Example Data for Testing UI Components
 * Use these mock data structures to test the enhanced UI components
 */

import type {
  EnhancedKeywordAnalysis,
  BulletQualityAnalysis,
  IndustryAnalysis,
  SeniorityAnalysis,
  ATSParseResult,
  SemanticMatch,
  AIInsights,
  AnalysisCapabilities
} from '@/lib/ai/enhanced-types'

// Example Enhanced Keyword Analysis
export const exampleEnhancedKeywordAnalysis: EnhancedKeywordAnalysis = {
  matchedKeywords: [
    {
      keyword: 'React',
      matchType: 'exact',
      confidence: 100,
      context: 'Built responsive web applications using React',
      inResume: true,
      inJobDescription: true
    },
    {
      keyword: 'leadership',
      matchType: 'synonym',
      confidence: 85,
      context: 'Led team of 5 developers',
      inResume: true,
      inJobDescription: true
    }
  ],
  missingKeywords: [
    {
      keyword: 'GraphQL',
      matchType: 'exact',
      confidence: 100,
      context: '',
      inResume: false,
      inJobDescription: true
    }
  ],
  phraseMatches: [
    {
      phrase: 'machine learning',
      inResume: true,
      inJobDescription: true,
      importance: 'high',
      weight: 2.0
    }
  ],
  score: 78,
  matchRate: 0.78,
  stemmedMatches: 12,
  synonymMatches: 8,
  exactMatches: 25,
  phraseMatchCount: 5
}

// Example Bullet Quality Analysis
export const exampleBulletQualityAnalysis: BulletQualityAnalysis = {
  averageScore: 72,
  scores: [
    {
      bullet: 'Led team of 5 developers to deliver project 2 weeks ahead of schedule',
      score: 92,
      hasActionVerb: true,
      hasMetric: true,
      hasOutcome: true,
      specificity: 90,
      relevance: 95,
      aiSuggestion: 'Excellent bullet! Consider adding the project value or impact.',
      confidence: 95
    },
    {
      bullet: 'Worked on various projects',
      score: 35,
      hasActionVerb: false,
      hasMetric: false,
      hasOutcome: false,
      specificity: 20,
      relevance: 40,
      aiSuggestion: 'Too vague. Specify what projects, your role, and measurable outcomes.',
      confidence: 90
    }
  ],
  topBullets: [
    'Led team of 5 developers to deliver project 2 weeks ahead of schedule',
    'Increased system performance by 40% through code optimization'
  ],
  weakBullets: [
    'Worked on various projects',
    'Responsible for tasks'
  ]
}

// Example Industry Analysis
export const exampleIndustryAnalysis: IndustryAnalysis = {
  detectedIndustry: 'technology',
  confidence: 92,
  industryScore: 85,
  industryRecommendations: [
    'Emphasize technical skills and projects in your experience section',
    'Include links to GitHub or portfolio to showcase your work',
    'Consider adding technical certifications (AWS, Azure, etc.)',
    'Highlight contributions to open-source projects if applicable'
  ]
}

// Example Seniority Analysis
export const exampleSeniorityAnalysis: SeniorityAnalysis = {
  detectedSeniority: 'senior',
  confidence: 88,
  alignmentScore: 82,
  seniorityRecommendations: [
    'Emphasize leadership and mentoring experience',
    'Highlight strategic decision-making and architecture design',
    'Include examples of cross-functional collaboration',
    'Showcase impact on business metrics and team growth'
  ]
}

// Example ATS Parse Result
export const exampleATSResult: ATSParseResult = {
  success: true,
  parsedSections: {
    contact: true,
    experience: true,
    education: true,
    skills: false
  },
  issues: [
    {
      type: 'structure',
      severity: 'critical',
      description: 'Skills section not detected by ATS parser',
      location: 'Skills section',
      fix: 'Use a clear "Skills" or "Technical Skills" heading'
    },
    {
      type: 'formatting',
      severity: 'warning',
      description: 'Tables detected - may not parse correctly',
      location: 'Experience section',
      fix: 'Replace tables with standard bullet points'
    }
  ],
  compatibility: 75,
  simulatedOutput: 'John Doe\njohn@email.com\n(555) 123-4567\n\nEXPERIENCE\nSenior Developer...',
  systemTested: 'workday'
}

// Example Semantic Matches
export const exampleSemanticMatches: SemanticMatch[] = [
  {
    resumeSection: 'Led team of 5 developers in building scalable microservices architecture',
    jdRequirement: 'Experience leading engineering teams and designing distributed systems',
    matchScore: 88,
    explanation: 'Your leadership experience and microservices work directly align with the requirement for team leadership and distributed systems design. The scale (5 developers) demonstrates hands-on management capability.',
    implicitSkills: ['Team Leadership', 'Microservices', 'System Architecture', 'Scalability'],
    confidence: 92
  },
  {
    resumeSection: 'Implemented CI/CD pipeline reducing deployment time by 60%',
    jdRequirement: 'Strong DevOps background with automation experience',
    matchScore: 85,
    explanation: 'Your CI/CD implementation shows practical DevOps skills and quantifiable automation impact. The 60% improvement demonstrates significant value delivery.',
    implicitSkills: ['DevOps', 'Automation', 'CI/CD', 'Process Improvement'],
    confidence: 88
  }
]

// Example AI Insights
export const exampleAIInsights: AIInsights = {
  strengths: [
    'Strong technical leadership with proven track record of managing development teams',
    'Excellent quantifiable achievements showing measurable business impact',
    'Diverse technology stack demonstrating adaptability and continuous learning',
    'Clear progression from junior to senior roles showing career growth'
  ],
  gaps: [
    'Limited mention of cloud platforms (AWS, Azure, GCP) which are required',
    'No certifications listed despite being preferred for this role',
    'Soft skills could be more explicitly demonstrated with examples',
    'Missing keywords: GraphQL, Kubernetes, Docker'
  ],
  implicitSkills: [
    'Agile Methodology',
    'Code Review',
    'Technical Documentation',
    'Stakeholder Communication',
    'Performance Optimization',
    'Problem Solving',
    'Cross-functional Collaboration'
  ],
  careerAdvice: [
    'Consider obtaining AWS or Azure certification to strengthen cloud credentials',
    'Add a "Certifications" section to highlight professional development',
    'Quantify more achievements with specific metrics (%, $, time saved)',
    'Include examples of mentoring junior developers to emphasize leadership',
    'Add links to technical blog posts or conference talks if applicable'
  ]
}

// Example Analysis Capabilities (Full AI)
export const exampleCapabilitiesFull: AnalysisCapabilities = {
  keywordMatching: 'enhanced',
  semanticAnalysis: 'ai',
  bulletQuality: 'ai',
  formatAnalysis: 'comprehensive',
  atsSimulation: 'full',
  industryRules: true,
  adaptiveThresholds: true
}

// Example Analysis Capabilities (Degraded)
export const exampleCapabilitiesDegraded: AnalysisCapabilities = {
  keywordMatching: 'basic',
  semanticAnalysis: 'embedding',
  bulletQuality: 'rule-based',
  formatAnalysis: 'basic',
  atsSimulation: 'basic',
  industryRules: false,
  adaptiveThresholds: false
}

// Example Complete Analysis Result
export const exampleCompleteAnalysis = {
  scores: {
    total: 78,
    semantic: 75,
    keyword: 82,
    format: 76,
    ats: 75
  },
  enhancedKeywordAnalysis: exampleEnhancedKeywordAnalysis,
  bulletQualityAnalysis: exampleBulletQualityAnalysis,
  industryAnalysis: exampleIndustryAnalysis,
  seniorityAnalysis: exampleSeniorityAnalysis,
  atsResult: exampleATSResult,
  semanticMatches: exampleSemanticMatches,
  aiInsights: exampleAIInsights,
  radarData: {
    technical: { user: 85, required: 80 },
    softSkills: { user: 70, required: 75 },
    experience: { user: 90, required: 85 },
    education: { user: 80, required: 70 },
    certifications: { user: 60, required: 80 },
    domain: { user: 75, required: 70 }
  }
}

// Usage Example:
/*
import { 
  exampleCompleteAnalysis,
  exampleCapabilitiesFull 
} from '@/components/analysis/EXAMPLE_DATA'

function TestAnalysisPage() {
  return (
    <div>
      <ScoreCard
        overallScore={exampleCompleteAnalysis.scores.total}
        breakdown={{
          semantic: exampleCompleteAnalysis.scores.semantic,
          keyword: exampleCompleteAnalysis.scores.keyword,
          format: exampleCompleteAnalysis.scores.format
        }}
        enhancedKeywordAnalysis={exampleCompleteAnalysis.enhancedKeywordAnalysis}
        bulletQualityAnalysis={exampleCompleteAnalysis.bulletQualityAnalysis}
        industryAnalysis={exampleCompleteAnalysis.industryAnalysis}
        seniorityAnalysis={exampleCompleteAnalysis.seniorityAnalysis}
        atsResult={exampleCompleteAnalysis.atsResult}
      />
      
      <AIInsightsPanel
        semanticMatches={exampleCompleteAnalysis.semanticMatches}
        aiInsights={exampleCompleteAnalysis.aiInsights}
        showConfidenceScores={true}
      />
      
      <FeatureStatusIndicator
        capabilities={exampleCapabilitiesFull}
        showDetails={true}
      />
    </div>
  )
}
*/
