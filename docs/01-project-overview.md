# Project Overview

## 🎯 What is Career+?

Career+ is an AI-powered career co-pilot that helps job seekers optimize their resumes for maximum impact. It combines advanced AI analysis, ATS optimization, bias detection, and regional localization to create resumes that stand out.

## 🌟 Key Features

### 1. AI-Powered Resume Analysis
- **Smart Parsing**: Extracts structured data from PDF, DOCX, and TXT files
- **ATS Scoring**: Analyzes resume compatibility with Applicant Tracking Systems
- **Skill Gap Detection**: Identifies missing skills based on job descriptions
- **Strength Analysis**: Highlights your strongest qualifications

### 2. AutoFix Bullet Rewriting
- **AI Enhancement**: Rewrites resume bullets using advanced language models
- **Batch Processing**: Improves multiple bullets simultaneously
- **Before/After Comparison**: See exactly what changed
- **Accept/Skip Workflow**: Full control over changes

### 3. Bias Detection & Removal
- **Comprehensive Scanning**: Detects age, gender, race, and other biases
- **Smart Suggestions**: Provides neutral alternatives
- **Category Filtering**: Focus on specific bias types
- **One-Click Fixes**: Apply suggestions instantly

### 4. Regional Localization
- **Multi-Region Support**: US, UK, EU, and APAC formats
- **Cultural Adaptation**: Region-specific terminology and conventions
- **Format Guidelines**: Date formats, section ordering, and more
- **Terminology Mapping**: Automatic term conversion (CV → Resume, etc.)

### 5. Template Gallery
- **Professional Templates**: ATS-optimized resume designs
- **Live Preview**: See your resume in different formats
- **Comparison Mode**: Compare templates side-by-side
- **One-Click Export**: Generate PDF instantly

### 6. Version History
- **Automatic Versioning**: Every change is saved
- **Timeline View**: Visual history of all changes
- **Easy Restore**: Roll back to any previous version
- **Export Any Version**: Download any historical version

### 7. AI Chat Assistant
- **Contextual Help**: Ask questions about your resume
- **Career Advice**: Get personalized recommendations
- **Real-time Feedback**: Instant answers to your questions
- **Multi-turn Conversations**: Natural dialogue flow

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: IndexedDB (Dexie.js)
- **Routing**: React Router v6
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer
- **AI**: Transformers.js (client-side embeddings)

### Backend
- **Framework**: FastAPI (Python)
- **AI Models**: 
  - Ollama (llama3.1:8b for insights)
  - Ollama (gemma3:4b for rewriting)
  - Google Gemini (fallback)
- **Document Parsing**: PyMuPDF, python-docx, pdfminer.six
- **Embeddings**: sentence-transformers
- **API Docs**: OpenAPI/Swagger

### Infrastructure
- **AI Gateway**: ngrok tunnel to local Ollama
- **Rate Limiting**: 10 requests/minute per IP
- **CORS**: Configured for local development
- **Environment**: .env configuration

## 🎨 Design Philosophy

### User-Centric
- Intuitive interface requiring no training
- Clear visual feedback for all actions
- Progressive disclosure of advanced features
- Mobile-responsive design

### AI-Augmented
- AI assists but doesn't replace human judgment
- Users maintain full control over changes
- Transparent AI decision-making
- Fallback to rule-based systems

### Privacy-First
- Client-side processing where possible
- No data stored on servers
- IndexedDB for local storage
- Optional cloud sync (future)

### Accessible
- WCAG 2.1 AA compliant
- Keyboard navigation throughout
- Screen reader support
- High contrast mode

## 📊 Use Cases

### Job Seekers
- Optimize resume for specific job postings
- Remove unconscious bias from language
- Adapt resume for different regions
- Track resume improvements over time

### Career Coaches
- Provide data-driven feedback to clients
- Demonstrate resume improvements
- Export professional-looking resumes
- Track client progress

### Recruiters
- Understand ATS scoring factors
- Provide feedback to candidates
- Standardize resume formats
- Reduce bias in screening

## 🚀 Project Status

### ✅ Completed Features
- Resume parsing (PDF, DOCX, TXT)
- ATS scoring and analysis
- AI-powered insights generation
- AutoFix bullet rewriting
- Bias detection and removal
- Regional localization (4 regions)
- Template gallery with export
- Version history and restore
- AI chat assistant
- Accessibility compliance (WCAG 2.1 AA)

### 🚧 In Progress
- Cloud deployment
- User authentication
- Team collaboration features
- Advanced analytics dashboard

### 📋 Roadmap
- Mobile app (iOS/Android)
- LinkedIn integration
- Cover letter generation
- Interview preparation
- Job matching algorithm
- Premium features

## 🎯 Target Audience

### Primary Users
- **Job Seekers**: Actively looking for new opportunities
- **Career Changers**: Transitioning to new industries
- **Recent Graduates**: Creating their first professional resume
- **International Applicants**: Adapting resumes for different regions

### Secondary Users
- **Career Coaches**: Helping clients improve resumes
- **Recruiters**: Understanding candidate qualifications
- **HR Professionals**: Standardizing resume formats

## 💡 Competitive Advantages

1. **AI-Powered**: Advanced language models for personalized insights
2. **Privacy-First**: Client-side processing, no data storage
3. **Multi-Region**: Support for US, UK, EU, and APAC formats
4. **Bias Detection**: Comprehensive bias scanning and removal
5. **Version History**: Never lose your work
6. **Accessible**: WCAG 2.1 AA compliant
7. **Open Source**: Transparent and customizable

## 📈 Success Metrics

### User Engagement
- Resume uploads per user
- AutoFix acceptance rate
- Chat interactions per session
- Template downloads

### Quality Metrics
- ATS score improvements
- Bias reduction percentage
- User satisfaction ratings
- Time to complete resume

### Technical Metrics
- API response times
- AI model accuracy
- System uptime
- Error rates

## 🔮 Vision

Career+ aims to democratize access to professional resume optimization tools. By combining AI technology with user-friendly design, we empower everyone to present their best professional self, regardless of their background or resources.

## 📞 Contact & Support

- **Documentation**: [docs/](.)
- **Issues**: [GitHub Issues]
- **Email**: support@careerplus.ai
- **Community**: [Discord/Slack]

---

**Next Steps**: Check out the [Quick Start Guide](./02-quick-start.md) to get started!
