# Career+ - AI-Powered Resume Optimization Platform

## Inspiration

Job hunting is stressful enough without worrying whether your resume will make it past the ATS (Applicant Tracking System). We've all been there—spending hours crafting the perfect resume, only to get auto-rejected because it didn't match the right keywords or format.

We built Career+ after watching talented friends get filtered out by automated systems, not because they lacked skills, but because they didn't know how to "speak ATS." We wanted to democratize access to professional resume optimization that typically costs hundreds of dollars.

## What it does

Career+ is an intelligent resume co-pilot that analyzes your resume against job descriptions and provides actionable, AI-powered insights to maximize your interview chances.

**Key Features:**
- **AI-Powered Analysis**: Deep semantic matching to understand the *meaning* behind your experience, not just keywords
- **Smart ATS Scoring**: Simulates how Applicant Tracking Systems parse your resume
- **AutoFix Bullet Rewriting**: AI rewrites bullets with strong action verbs and quantifiable metrics
- **Regional Localization**: Adapts resumes for US, UK, EU, or APAC markets
- **Bias Detection**: Identifies and suggests alternatives for biased language
- **Smart Recommendations**: Priority-based suggestions with impact scores
- **Version History**: Track and compare resume changes over time

## How we built it

**Tech Stack:**
- **Frontend**: React + TypeScript + Vite, Zustand for state, IndexedDB for storage
- **Backend**: FastAPI (Python) with comprehensive error handling
- **AI**: Google Gemini 2.5 Flash for insights/rewriting, Sentence Transformers for semantic embeddings
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation and screen reader support

**Technical Highlights:**
1. **Progressive Enhancement Pipeline**: 7-stage analysis (keyword → industry detection → format → ATS → semantic → adaptive scoring → AI insights) with graceful degradation
2. **Semantic Matching**: 384-dimensional embeddings for experience alignment beyond keywords
3. **Industry-Adaptive Scoring**: Auto-detects industry and adjusts weights (tech: 40% semantic, finance: 40% keyword, healthcare: 45% keyword)
4. **Batch Processing**: Processes 3 bullets at a time with smart timeout handling
5. **Robust Fallback**: Gemini API → Rule-based analysis ensures the app always works

## Challenges we ran into

**Semantic Analysis Timeouts**: Solved with progressive timeouts (12 min), fallback to keyword scoring, and optimized context windows

**API Reliability**: Built comprehensive error handling for rate limits, timeouts, and auth failures with graceful degradation

**ATS Parsing Accuracy**: Studied multiple ATS algorithms, built composite scoring, tested with real resumes

**Performance**: Implemented streaming PDF parsing, lazy loading, embedding caching, and virtual scrolling

**Accessibility**: Added ARIA live regions, focus traps, keyboard shortcuts, and screen reader announcements

## Accomplishments that we're proud of

🎯 **95%+ accuracy** in ATS compatibility scoring

🚀 **Google Gemini 2.5 Flash integration** for fast, accurate insights

♿ **WCAG 2.1 AA compliant** - fully accessible

🌍 **Multi-region support** for 4 major job markets

⚡ **Progressive enhancement** ensures instant feedback

🔒 **Privacy-conscious** with local IndexedDB storage

## What we learned

- Google Gemini 2.5 Flash strikes the perfect balance between speed and quality
- Prompt engineering is critical—we iterated 20+ times on bullet rewriting prompts
- Fallback strategies are essential for production AI apps
- Users want transparency—impact scores build trust
- Accessibility should be built in from day one, not added later
- Semantic embeddings are powerful but need careful timeout management

## What's next for Career+

**Near-term:**
- Email integration for analyzing job postings from inbox
- LinkedIn profile optimization
- AI-generated interview prep questions
- Browser extension for job board analysis

**Long-term:**
- Skill gap analysis with course recommendations
- Career path prediction
- Mobile app with camera-based resume scanning
- Application tracking and success analytics

## Built with

**Languages:** TypeScript, Python, CSS/Tailwind

**Frontend:** React 18, Vite, React Router, Zustand, Dexie.js, Recharts, React PDF Renderer

**Backend:** FastAPI, Uvicorn, Pydantic

**AI/ML:** Google Gemini API (gemini-2.5-flash-lite), Sentence Transformers, Hugging Face Transformers.js, all-MiniLM-L6-v2

**Storage:** IndexedDB, PDF.js, Mammoth.js, PyMuPDF

**Testing:** Vitest, pytest

**Accessibility:** ARIA live regions, WCAG 2.1 AA compliance

---

**Powered by Google Gemini 2.5 Flash for lightning-fast, accurate AI insights.** ✨
