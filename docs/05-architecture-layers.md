# Architecture Layers

Detailed breakdown of Career+ platform layers and their responsibilities.

## 🏗️ Layer Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│                  (User Interface & Experience)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                  (Business Logic & Workflows)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│                  (Core Services & Processing)                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│                  (Storage & Persistence)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                           │
│                  (Hosting & External Services)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Presentation Layer

### Responsibility
Handle all user interactions, display data, and manage UI state.

### Components

#### Pages
```typescript
src/pages/
├── Home.tsx              // Landing page
├── Analyze.tsx           // Main analysis dashboard
├── History.tsx           // Version history
└── Templates.tsx         // Template gallery
```

**Responsibilities:**
- Route handling
- Page-level state management
- Component composition
- Layout structure

#### UI Components
```typescript
src/components/
├── layout/
│   ├── Header.tsx        // Navigation
│   ├── Footer.tsx        // Footer
│   └── Sidebar.tsx       // Side navigation
│
├── upload/
│   ├── FileUpload.tsx    // Drag & drop
│   └── FileValidator.tsx // Validation
│
├── analysis/
│   ├── ScoreCard.tsx     // Score display
│   ├── RadarChart.tsx    // Skills visualization
│   └── InsightsPanel.tsx // AI insights
│
└── ui/
    ├── Button.tsx        // Reusable button
    ├── Modal.tsx         // Modal dialog
    └── Input.tsx         // Form input
```

**Responsibilities:**
- Render UI elements
- Handle user events
- Display data
- Manage component state

#### State Management
```typescript
src/store/
├── resumeStore.ts        // Resume state
├── analysisStore.ts      // Analysis state
└── chatStore.ts          // Chat state
```

**Using Zustand:**
```typescript
interface ResumeStore {
  resumes: Resume[]
  currentResume: Resume | null
  setCurrentResume: (resume: Resume) => void
  addResume: (resume: Resume) => void
  deleteResume: (id: string) => void
}

const useResumeStore = create<ResumeStore>((set) => ({
  resumes: [],
  currentResume: null,
  setCurrentResume: (resume) => set({ currentResume: resume }),
  addResume: (resume) => set((state) => ({ 
    resumes: [...state.resumes, resume] 
  })),
  deleteResume: (id) => set((state) => ({
    resumes: state.resumes.filter(r => r.id !== id)
  }))
}))
```

### Technologies
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **React Router**: Navigation
- **Recharts**: Data visualization

---

## 2️⃣ Application Layer

### Responsibility
Implement business logic, orchestrate workflows, and coordinate between layers.

### Components

#### Custom Hooks
```typescript
src/hooks/
├── useResumeUpload.ts    // Upload logic
├── useAnalysis.ts        // Analysis workflow
├── useAutoFix.ts         // AutoFix workflow
└── useChat.ts            // Chat logic
```

**Example: useAutoFix Hook**
```typescript
export function useAutoFix() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AutoFixResult[]>([])
  
  const runAutoFix = async (bullets: string[]) => {
    setLoading(true)
    try {
      // Call API
      const response = await fetch('/api/rewrite-batch', {
        method: 'POST',
        body: JSON.stringify({ bullets })
      })
      
      const data = await response.json()
      setResults(data.rewritten)
      
      // Update store
      useResumeStore.getState().updateBullets(data.rewritten)
      
      // Create new version
      await createVersion('autofix', data.rewritten)
      
    } catch (error) {
      console.error('AutoFix failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return { runAutoFix, loading, results }
}
```

#### Workflows
```typescript
src/workflows/
├── uploadWorkflow.ts     // Upload → Parse → Analyze
├── optimizeWorkflow.ts   // AutoFix → Bias → Localize
└── exportWorkflow.ts     // Template → Generate → Download
```

**Example: Upload Workflow**
```typescript
export async function uploadWorkflow(file: File) {
  // 1. Validate file
  const validation = validateFile(file)
  if (!validation.valid) throw new Error(validation.error)
  
  // 2. Parse document
  const text = await parseDocument(file)
  
  // 3. Extract structured data
  const parsed = await extractData(text)
  
  // 4. Store in IndexedDB
  const resume = await saveResume({
    fileName: file.name,
    fileType: file.type,
    rawText: text,
    parsedData: parsed
  })
  
  // 5. Trigger analysis
  await analyzeResume(resume.id)
  
  return resume
}
```

### Technologies
- **React Hooks**: Logic reuse
- **Async/Await**: Async operations
- **Error Boundaries**: Error handling

---

## 3️⃣ Service Layer

### Responsibility
Provide core services, process data, and integrate with external systems.

### Frontend Services

#### Document Parsers
```typescript
src/lib/parsers/
├── pdfParser.ts          // PDF parsing
├── docxParser.ts         // DOCX parsing
└── txtParser.ts          // TXT parsing
```

**PDF Parser:**
```typescript
import * as pdfjsLib from 'pdfjs-dist'

export async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
  
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ')
  }
  
  return text
}
```

#### AI Services
```typescript
src/lib/ai/
├── embeddings.ts         // Text embeddings
├── similarity.ts         // Similarity scoring
└── keywords.ts           // Keyword extraction
```

**Client-side Embeddings:**
```typescript
import { pipeline } from '@xenova/transformers'

let embedder: any = null

export async function getEmbedding(text: string) {
  if (!embedder) {
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )
  }
  
  const output = await embedder(text, {
    pooling: 'mean',
    normalize: true
  })
  
  return Array.from(output.data)
}
```

### Backend Services

#### Core Services
```python
backend/app/services/
├── resume_parser.py      # Parse resumes
├── ats_analyzer.py       # ATS scoring
├── bias_detection.py     # Bias detection
├── localization.py       # Regional advice
├── ai_insights.py        # AI insights
├── batch_rewriter.py     # Bullet rewriting
└── chat_service.py       # Chat assistant
```

**ATS Analyzer:**
```python
class ATSAnalyzer:
    def analyze(self, resume_text: str, job_description: str = None):
        score = 0
        
        # Check sections
        sections = self.detect_sections(resume_text)
        score += len(sections) * 10
        
        # Check keywords
        if job_description:
            keywords = self.extract_keywords(job_description)
            matches = self.match_keywords(resume_text, keywords)
            score += (len(matches) / len(keywords)) * 40
        
        # Check formatting
        formatting_score = self.check_formatting(resume_text)
        score += formatting_score * 20
        
        return {
            'ats_score': min(score, 100),
            'sections_found': sections,
            'keyword_matches': matches if job_description else [],
            'recommendations': self.generate_recommendations(score)
        }
```

#### AI Gateway Client
```python
backend/app/ai/
├── ai_gateway_client.py  # Unified AI interface
├── ollama_client.py      # Ollama integration
└── gemini_client.py      # Gemini fallback
```

**AI Gateway Client:**
```python
class AIGatewayClient:
    def __init__(self):
        self.gateway_url = os.getenv('AI_GATEWAY_URL')
        self.ollama_url = os.getenv('OLLAMA_BASE_URL')
        self.gemini_key = os.getenv('GOOGLE_API_KEY')
    
    async def generate(self, prompt: str, model: str):
        # Try AI Gateway first
        try:
            return await self._call_gateway(prompt, model)
        except Exception as e:
            logger.warning(f"Gateway failed: {e}")
        
        # Fallback to local Ollama
        try:
            return await self._call_ollama(prompt, model)
        except Exception as e:
            logger.warning(f"Ollama failed: {e}")
        
        # Fallback to Gemini
        if self.gemini_key:
            return await self._call_gemini(prompt)
        
        raise Exception("All AI services unavailable")
```

### Technologies
- **Frontend**: Transformers.js, pdfjs-dist, mammoth
- **Backend**: FastAPI, sentence-transformers, PyMuPDF
- **AI**: Ollama, Google Gemini

---

## 4️⃣ Data Layer

### Responsibility
Store, retrieve, and manage data persistence.

### Frontend Data (IndexedDB)

#### Database Schema
```typescript
src/lib/db/
├── schema.ts             // Database schema
├── operations.ts         // CRUD operations
└── migrations.ts         // Schema migrations
```

**Dexie.js Schema:**
```typescript
import Dexie from 'dexie'

class CareerPlusDB extends Dexie {
  resumes!: Dexie.Table<Resume, string>
  versions!: Dexie.Table<Version, string>
  analysis!: Dexie.Table<Analysis, string>
  chatMessages!: Dexie.Table<ChatMessage, string>
  
  constructor() {
    super('CareerPlusDB')
    
    this.version(1).stores({
      resumes: 'id, fileName, uploadedAt, lastModified',
      versions: 'id, resumeId, versionNumber, createdAt',
      analysis: 'id, resumeId, analyzedAt',
      chatMessages: 'id, resumeId, conversationId, timestamp'
    })
  }
}

export const db = new CareerPlusDB()
```

#### Operations
```typescript
// Create
export async function saveResume(resume: Resume) {
  return await db.resumes.add(resume)
}

// Read
export async function getResume(id: string) {
  return await db.resumes.get(id)
}

// Update
export async function updateResume(id: string, changes: Partial<Resume>) {
  return await db.resumes.update(id, changes)
}

// Delete
export async function deleteResume(id: string) {
  return await db.resumes.delete(id)
}

// Query
export async function getRecentResumes(limit: number = 5) {
  return await db.resumes
    .orderBy('lastModified')
    .reverse()
    .limit(limit)
    .toArray()
}
```

### Backend Data (Future: PostgreSQL)

#### Models
```python
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Resume(Base):
    __tablename__ = 'resumes'
    
    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    file_name = Column(String)
    raw_text = Column(String)
    parsed_data = Column(JSON)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
```

### Technologies
- **Frontend**: IndexedDB (Dexie.js)
- **Backend**: PostgreSQL (future), SQLAlchemy
- **Caching**: Redis (future)

---

## 5️⃣ Infrastructure Layer

### Responsibility
Provide hosting, networking, and external service integration.

### Components

#### Hosting
```
Frontend:
- Vercel / Netlify
- CDN distribution
- Automatic HTTPS
- Edge caching

Backend:
- Cloud Run / Heroku
- Auto-scaling
- Load balancing
- Health checks

AI Services:
- Ollama server
- ngrok tunnel
- GPU instances
```

#### External Services
```
AI Models:
- Ollama (llama3.1:8b, gemma3:4b)
- Google Gemini (fallback)

Monitoring:
- Sentry (error tracking)
- DataDog (metrics)
- LogRocket (session replay)

Analytics:
- Google Analytics
- Mixpanel
```

#### Networking
```
API Gateway:
- Rate limiting
- CORS handling
- Request validation
- Response caching

CDN:
- CloudFlare
- Static asset caching
- DDoS protection
- SSL/TLS
```

### Technologies
- **Hosting**: Vercel, Cloud Run, Heroku
- **CDN**: CloudFlare
- **Monitoring**: Sentry, DataDog
- **AI**: Ollama, ngrok

---

## 🔄 Layer Communication

### Request Flow

```
User Action (Presentation)
    ↓
Event Handler (Presentation)
    ↓
Custom Hook (Application)
    ↓
Service Call (Service)
    ↓
API Request (Service)
    ↓
Backend Endpoint (Service)
    ↓
Business Logic (Application)
    ↓
Data Access (Data)
    ↓
Database Query (Data)
    ↓
Response (reverse flow)
```

### Example: AutoFix Flow

```
1. User clicks "AutoFix" button
   Layer: Presentation (Button component)

2. onClick handler triggered
   Layer: Presentation (Event handler)

3. useAutoFix hook called
   Layer: Application (Custom hook)

4. API request sent
   Layer: Service (HTTP client)

5. Backend receives request
   Layer: Service (FastAPI endpoint)

6. AI Gateway called
   Layer: Service (AI client)

7. Results processed
   Layer: Application (Business logic)

8. Data saved to IndexedDB
   Layer: Data (Database operation)

9. UI updated with results
   Layer: Presentation (Component re-render)
```

---

## 📊 Layer Dependencies

```
Presentation Layer
    ↓ depends on
Application Layer
    ↓ depends on
Service Layer
    ↓ depends on
Data Layer
    ↓ depends on
Infrastructure Layer
```

**Rules:**
- ✅ Upper layers can depend on lower layers
- ❌ Lower layers cannot depend on upper layers
- ✅ Layers can skip levels (e.g., Presentation → Service)
- ✅ Use dependency injection for flexibility

---

## 🎯 Best Practices

### Separation of Concerns
- Each layer has single responsibility
- Clear boundaries between layers
- Minimal coupling

### Dependency Management
- Use dependency injection
- Avoid circular dependencies
- Mock dependencies for testing

### Error Handling
- Handle errors at appropriate layer
- Propagate errors up the stack
- Provide meaningful error messages

### Testing Strategy
- Unit test each layer independently
- Integration test layer interactions
- E2E test full stack

---

**Next**: [AI Gateway Architecture](./06-ai-gateway.md)
