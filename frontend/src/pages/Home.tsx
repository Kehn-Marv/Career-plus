import { Link } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AnimatedGradient } from '@/components/ui/AnimatedGradient'
import { GradientButton } from '@/components/ui/GradientButton'
import { GlassButton } from '@/components/ui/GlassButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Target, Sparkles, BarChart3, Shield, Zap, FileText, CheckCircle2 } from 'lucide-react'

export default function Home() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-1" role="main" aria-label="Main content">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50" aria-labelledby="hero-heading">
          {/* Subtle animated gradient overlay */}
          <AnimatedGradient 
            className="absolute inset-0 opacity-20"
            colors={['#064e3b', '#047857', '#059669', '#10b981']}
            duration={20}
          />
          
          {/* Content */}
          <div className="relative z-10 py-20 sm:py-28 lg:py-36">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-16 lg:gap-20 items-center">
                  {/* Left Column - Text Content */}
                  <div className="text-left space-y-10">
                    {/* Headline - Stunning typography with proper overflow handling */}
                    <div className="overflow-visible pb-4">
                      <h1 id="hero-heading" className="leading-[1.1]">
                        <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 tracking-tight mb-3">
                          Land Your
                        </span>
                        <span className="block font-serif italic text-6xl sm:text-7xl lg:text-8xl xl:text-[7rem] 2xl:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 my-4 tracking-tight leading-[1.05] pb-6">
                          Dream Job
                        </span>
                        <span className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-700 tracking-tight mt-4">
                          with AI-Powered Insights
                        </span>
                      </h1>
                    </div>
                    
                    {/* Subtitle - Clear and readable */}
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                      Get instant feedback on your resume, match with jobs perfectly, and stand out from the competition—all for free.
                    </p>
                    
                    {/* CTA Buttons - Properly sized */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2">
                      <Link to="/analyze" className="inline-block flex-shrink-0" aria-label="Get started with free resume analysis">
                        <GradientButton 
                          size="lg"
                          className="w-full sm:w-auto text-base lg:text-lg px-8 lg:px-10 py-3.5 lg:py-4 whitespace-nowrap"
                          onClick={() => {}}
                        >
                          Analyze My Resume →
                        </GradientButton>
                      </Link>
                      <GlassButton 
                        size="lg"
                        onClick={() => scrollToSection('how-it-works')}
                        className="w-full sm:w-auto text-base lg:text-lg px-8 lg:px-10 py-3.5 lg:py-4 bg-white/80 hover:bg-white border border-gray-200 whitespace-nowrap flex-shrink-0"
                        aria-label="Scroll to how it works section"
                      >
                        See How It Works
                      </GlassButton>
                    </div>
                    
                    {/* Trust Indicators - Refined */}
                    <div className="flex flex-wrap items-center gap-6 lg:gap-8 pt-8 border-t border-gray-200" role="list" aria-label="Trust indicators">
                      <div role="listitem" className="flex items-center gap-2.5 text-sm lg:text-base text-gray-600">
                        <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                        <span className="font-medium">No signup</span>
                      </div>
                      <div role="listitem" className="flex items-center gap-2.5 text-sm lg:text-base text-gray-600">
                        <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                        <span className="font-medium">100% private</span>
                      </div>
                      <div role="listitem" className="flex items-center gap-2.5 text-sm lg:text-base text-gray-600">
                        <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                        <span className="font-medium">Free forever</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Visual Element */}
                  <div className="relative lg:block" role="img" aria-label="Product preview showing AI-powered resume analysis dashboard">
                    {/* Decorative background elements */}
                    <div className="absolute -top-8 -right-8 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" aria-hidden="true"></div>
                    <div className="absolute -bottom-12 -left-8 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" aria-hidden="true" style={{ animationDelay: '2s' }}></div>
                    
                    {/* Product Preview Card */}
                    <div className="relative transform lg:scale-100 xl:scale-105">
                      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl p-6 lg:p-8 border border-gray-100">
                        {/* Mock Dashboard */}
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">Resume Analysis</div>
                                <div className="text-xs text-gray-500">Instant AI Feedback</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <div className="text-xs text-gray-600 font-medium">Live</div>
                            </div>
                          </div>
                          
                          {/* Score Cards */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
                              <div className="text-2xl font-bold text-emerald-600">92%</div>
                              <div className="text-xs text-gray-600 mt-1">ATS Score</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                              <div className="text-2xl font-bold text-blue-600">87%</div>
                              <div className="text-xs text-gray-600 mt-1">Match</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                              <div className="text-2xl font-bold text-purple-600">15</div>
                              <div className="text-xs text-gray-600 mt-1">Tips</div>
                            </div>
                          </div>
                          
                          {/* Progress Bars */}
                          <div className="space-y-3 pt-2">
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Keywords</span>
                                <span className="font-medium">8/10</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '80%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Format</span>
                                <span className="font-medium">9/10</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '90%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Impact</span>
                                <span className="font-medium">7/10</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '70%' }}></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold py-3 rounded-lg hover:shadow-lg transition-shadow">
                            View Full Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="relative py-20 lg:py-28 bg-white" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 id="features-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Powerful Features,
                  <span className="block text-emerald-600 mt-1">Simple Experience</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  Everything you need to optimize your resume and land more interviews
                </p>
              </div>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <ScrollReveal delay={0.1}>
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Target className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900" id="feature-matching">Smart Job Matching</h3>
                    <p className="text-base text-gray-600 mb-6 leading-relaxed">
                      Get instant compatibility scores that show how well your resume matches any job description.
                    </p>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>AI-powered semantic analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Keyword optimization tips</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Skills gap identification</span>
                      </li>
                    </ul>
                  </div>
                </ScrollReveal>
                
                {/* Feature 2 */}
                <ScrollReveal delay={0.2}>
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900" id="feature-autofix">Auto-Fix Mode</h3>
                    <p className="text-base text-gray-600 mb-6 leading-relaxed">
                      One-click AI optimization that rewrites your content for maximum impact and relevance.
                    </p>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Intelligent content rewriting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Bias detection & removal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Regional localization</span>
                      </li>
                    </ul>
                  </div>
                </ScrollReveal>
                
                {/* Feature 3 */}
                <ScrollReveal delay={0.3}>
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-purple-200 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900" id="feature-ats">ATS Compatibility</h3>
                    <p className="text-base text-gray-600 mb-6 leading-relaxed">
                      Ensure your resume passes Applicant Tracking Systems with comprehensive format analysis.
                    </p>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Format compatibility check</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Structure optimization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span>Keyword density analysis</span>
                      </li>
                    </ul>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="relative py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-emerald-50/30" aria-labelledby="how-it-works-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Get Started in
                  <span className="block text-emerald-600 mt-1">3 Simple Steps</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  From upload to optimization in under 2 minutes
                </p>
              </div>
              
              {/* Steps */}
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-emerald-600" aria-hidden="true" />
                        Upload Your Resume
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Drag and drop your resume (PDF or DOCX). No signup required—your data stays completely private in your browser.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                        <Target className="w-6 h-6 text-blue-600" aria-hidden="true" />
                        Add Job Description (Optional)
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Paste the job posting you're targeting. Our AI analyzes requirements and gives you a compatibility score.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-purple-600" aria-hidden="true" />
                        Get Instant AI Insights
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Receive detailed analysis, ATS scores, optimization tips, and one-click fixes to improve your resume instantly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="mt-12 text-center">
                <Link to="/analyze" className="inline-block" aria-label="Try Career+ now for free">
                  <GradientButton 
                    size="lg"
                    className="text-lg px-10 py-4"
                    onClick={() => {}}
                  >
                    Start Analyzing Now →
                  </GradientButton>
                </Link>
                <p className="mt-4 text-sm text-gray-500">No credit card required • Takes less than 2 minutes</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Privacy & Trust Section */}
        <section className="relative py-20 lg:py-28 bg-white" aria-labelledby="privacy-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-6">
                  <Shield className="w-10 h-10 text-emerald-600" aria-hidden="true" />
                </div>
                <h2 id="privacy-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Your Privacy,
                  <span className="block text-emerald-600 mt-1">Our Promise</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  Built with privacy-first principles. Your data never leaves your browser.
                </p>
              </div>
              
              {/* Privacy Cards */}
              <div className="grid sm:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    100% Local Storage
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    All your data stays in your browser's IndexedDB. We never see or store your resume.
                  </p>
                </div>
                
                {/* Card 2 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🌐</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Open Source
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Fully transparent code on GitHub. Audit our security and privacy yourself.
                  </p>
                </div>
                
                {/* Card 3 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">🚫</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Zero Tracking
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    No analytics, no cookies, no tracking. Your job search is completely private.
                  </p>
                </div>
              </div>
              
              {/* Additional Trust Indicators */}
              <div className="mt-12 pt-12 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">No Data Collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">Client-Side Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">No Account Required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
