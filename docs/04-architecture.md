# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│                    (Web Browser / Mobile)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│                   (React + TypeScript)                           │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   Pages    │  │ Components │  │   Stores   │  │  Hooks   │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              IndexedDB (Client Storage)                    │ │
│  │  • Resumes  • Versions  • Analysis  • Chat History       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│                      (FastAPI + Python)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  API Routes  │  │   Services   │  │   Models     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Services:                                                       │
│  • Resume Parser    • Bias Detection   • Localization          │
│  • ATS Analyzer     • AI Insights      • Batch Rewriter        │
│  • Chat Service     • Rate Limiter     • Validation            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       AI GATEWAY LAYER                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              AI Gateway Client                             │ │
│  │  • Unified AI Interface                                    │ │
│  │  • Automatic Fallback Logic                                │ │
│  │  • Health Checking                                         │ │
│  │  • Error Handling                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Primary: ngrok Gateway → Remote Ollama                         │
│  Fallback 1: Local Ollama (localhost:11434)                     │
│  Fallback 2: Rule-Based Analysis                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       AI MODEL LAYER                             │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  llama3.1:8b     │         │   gemma3:4b      │            │
│  │                  │         │                  │            │
│  │  • AI Insights   │         │  • Bullet        │            │
│  │  • Strengths     │         │    Rewriting     │            │
│  │  • Gaps          │         │  • AutoFix       │            │
│  │  • Recommendations│         │                  │            │
│  └──────────────────┘         └──────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Component Architecture

### Frontend Components

```
src/
├── pages/
│   ├── Home.tsx              # Landing page
│   ├── Analyze.tsx           # Main analysis dashboard
│   ├── History.tsx           # Version history
│   └── Templates.tsx         # Template gallery
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Navigation header
│   │   ├── Footer.tsx        # Footer with links
│   │   └── Sidebar.tsx       # Side navigation
│   │
│   ├── upload/
│   │   ├── FileUpload.tsx    # Drag & drop upload
│   │   └── FileValidator.tsx # File validation
│   │
│   ├── analysis/
│   │   ├── ScoreCard.tsx     # ATS score display
│   │   ├── RadarChart.tsx    # Skills radar
│   │   ├── InsightsPanel.tsx # AI insights
│   │   └── RecommendationsList.tsx
│   │
│   ├── autofix/
│   │   ├── AutoFixButton.tsx # Trigger AutoFix
│   │   ├── AutoFixModal.tsx  # Review changes
│   │   └── BulletComparison.tsx
│   │
│   ├── bias/
│   │   ├── BiasReportModal.tsx
│   │   └── BiasIssueCard.tsx
│   │
│   ├── localization/
│   │   ├── RegionSelector.tsx
│   │   └── LocalizationModal.tsx
│   │
│   ├── templates/
│   │   ├── TemplateGallery.tsx
│   │   ├── TemplatePreview.tsx
│   │   └── TemplateComparison.tsx
│   │
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   │
│   └── version/
│       ├── VersionHistory.tsx
│       └── VersionTimeline.tsx
│
├── lib/
│   ├── db/                   # IndexedDB operations
│   ├── ai/                   # AI utilities
│   ├── parsers/              # Document parsers
│   ├── validators/           # Validation logic
│   ├── accessibility/        # A11y utilities
│   └── utils/                # Helper functions
│
└── store/
    ├── resumeStore.ts        # Resume state
    ├── analysisStore.ts      # Analysis state
    └── chatStore.ts          # Chat state
```

### Backend Services

```
backend/app/
├── main.py                   # FastAPI app initialization
├── api.py                    # API route definitions
├── models.py                 # Pydantic models
│
├── services/
│   ├── resume_parser.py      # Parse PDF/DOCX/TXT
│   ├── ats_analyzer.py       # ATS scoring
│   ├── bias_detection.py     # Bias detection
│   ├── localization.py       # Regional advice
│   ├── ai_insights.py        # AI-powered insights
│   ├── batch_rewriter.py     # Bullet rewriting
│   ├── chat_service.py       # Chat assistant
│   └── rate_limiter.py       # Rate limiting
│
├── ai/
│   ├── ai_gateway_client.py  # Unified AI interface
│   ├── ollama_client.py      # Ollama integration
│   └── gemini_client.py      # Gemini fallback
│
└── utils/
    ├── validation.py         # Input validation
    ├── text_processing.py    # Text utilities
    └── error_handling.py     # Error handlers
```

## 🔄 Data Flow

### Resume Upload & Analysis Flow

```
1. User uploads resume (PDF/DOCX/TXT)
   ↓
2. Frontend validates file (size, type, content)
   ↓
3. Frontend parses document client-side
   ↓
4. Extracted text sent to backend API
   ↓
5. Backend performs:
   - ATS analysis
   - Bias detection
   - Skill extraction
   - Section identification
   ↓
6. Backend calls AI Gateway for insights
   ↓
7. AI Gateway routes to Ollama (llama3.1:8b)
   ↓
8. AI generates personalized insights
   ↓
9. Results returned to frontend
   ↓
10. Frontend stores in IndexedDB
    ↓
11. UI displays analysis dashboard
```

### AutoFix Flow

```
1. User clicks "AutoFix" button
   ↓
2. Frontend sends bullets to backend
   ↓
3. Backend calls AI Gateway (gemma3:4b)
   ↓
4. AI rewrites bullets (batch of 3)
   ↓
5. Backend detects changes
   ↓
6. Frontend displays before/after comparison
   ↓
7. User accepts or skips changes
   ↓
8. Accepted changes saved to IndexedDB
   ↓
9. New version created automatically
```

### Chat Flow

```
1. User types message in chat
   ↓
2. Frontend sends to backend with context
   ↓
3. Backend calls AI Gateway
   ↓
4. AI generates response
   ↓
5. Response streamed back to frontend
   ↓
6. Frontend displays message
   ↓
7. Chat history saved to IndexedDB
```

## 🗄️ Data Storage

### IndexedDB Schema

```typescript
// Resumes Table
interface Resume {
  id: string
  fileName: string
  fileType: string
  rawText: string
  parsedData: ParsedResume
  uploadedAt: Date
  lastModified: Date
}

// Versions Table
interface Version {
  id: string
  resumeId: string
  versionNumber: number
  content: ParsedResume
  changes: string[]
  createdAt: Date
  createdBy: 'user' | 'autofix' | 'manual'
}

// Analysis Table
interface Analysis {
  id: string
  resumeId: string
  atsScore: number
  biasScore: number
  insights: AIInsights
  recommendations: Recommendation[]
  analyzedAt: Date
}

// Chat History Table
interface ChatMessage {
  id: string
  resumeId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
```

## 🔐 Security Architecture

### Authentication (Future)
```
User → OAuth 2.0 → JWT Token → API Gateway → Backend
```

### API Security
- Rate limiting (10 req/min per IP)
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

### Data Privacy
- Client-side processing where possible
- No server-side data storage (MVP)
- Encrypted communication (HTTPS)
- No PII collection

## 🚀 Deployment Architecture

### MVP Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL / NETLIFY                         │
│                      (Frontend Hosting)                          │
│  • Static site hosting                                           │
│  • CDN distribution                                              │
│  • Automatic HTTPS                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD RUN / HEROKU                            │
│                     (Backend Hosting)                            │
│  • Containerized FastAPI                                         │
│  • Auto-scaling                                                  │
│  • Health checks                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ AI Requests
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AI GATEWAY (ngrok)                          │
│  • Public HTTPS endpoint                                         │
│  • Routes to local Ollama                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    OLLAMA SERVER                                 │
│                  (Dedicated Instance)                            │
│  • llama3.1:8b                                                   │
│  • gemma3:4b                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Full-Scale Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN (CloudFlare)                         │
│  • Global edge caching                                           │
│  • DDoS protection                                               │
│  • SSL/TLS termination                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER                               │
│  • Traffic distribution                                          │
│  • Health checks                                                 │
│  • SSL offloading                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   Frontend Cluster       │  │   Backend Cluster        │
│   (Multiple Instances)   │  │   (Multiple Instances)   │
│  • React App             │  │  • FastAPI               │
│  • Auto-scaling          │  │  • Auto-scaling          │
└──────────────────────────┘  └──────────────────────────┘
                                          │
                                          ↓
                              ┌─────────────────────────┐
                              │   AI Service Cluster    │
                              │  • Ollama instances     │
                              │  • Model caching        │
                              │  • Load balancing       │
                              └─────────────────────────┘
                                          │
                                          ↓
                              ┌─────────────────────────┐
                              │   Database Cluster      │
                              │  • PostgreSQL           │
                              │  • Redis cache          │
                              │  • Replication          │
                              └─────────────────────────┘
```

## 📊 Scalability Considerations

### Horizontal Scaling
- Frontend: Static files on CDN
- Backend: Multiple API instances
- AI: Dedicated model servers
- Database: Read replicas

### Vertical Scaling
- AI servers: GPU instances
- Database: Larger instances
- Cache: More memory

### Caching Strategy
- Frontend: CDN caching
- API: Redis for responses
- AI: Model result caching
- Database: Query caching

## 🔧 Technology Decisions

### Why React?
- Large ecosystem
- Component reusability
- Strong TypeScript support
- Excellent developer experience

### Why FastAPI?
- High performance
- Automatic API docs
- Type safety with Pydantic
- Async support

### Why IndexedDB?
- Client-side storage
- No server costs
- Offline capability
- Large storage capacity

### Why Ollama?
- Local AI processing
- Privacy-first
- Cost-effective
- Multiple model support

## 📈 Performance Targets

### Frontend
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

### Backend
- API Response Time: < 500ms
- AI Response Time: < 10s
- Uptime: > 99.9%

### AI
- Insights Generation: < 15s
- Bullet Rewriting: < 30s (batch of 3)
- Chat Response: < 5s

---

**Next**: [Architecture Layers](./05-architecture-layers.md)
