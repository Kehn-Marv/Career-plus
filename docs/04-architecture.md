# System Architecture

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end
    
    subgraph "Frontend Layer (React + TypeScript)"
        REACT[React App]
        ROUTER[React Router]
        ZUSTAND[Zustand State]
        TAILWIND[TailwindCSS]
        
        subgraph "Frontend Components"
            PAGES[Pages]
            COMPONENTS[UI Components]
            HOOKS[Custom Hooks]
        end
        
        subgraph "Client Storage"
            INDEXEDDB[(IndexedDB)]
            DEXIE[Dexie.js]
        end
    end
    
    subgraph "API Layer"
        FASTAPI[FastAPI Server]
        CORS[CORS Middleware]
        RATE[Rate Limiting]
        VALIDATION[Input Validation]
    end
    
    subgraph "Backend Services"
        PARSER[Resume Parser]
        ATS[ATS Analyzer]
        BIAS[Bias Detection]
        LOCAL[Localization]
        CHAT[Chat Service]
    end
    
    subgraph "AI Gateway Layer"
        GATEWAY[AI Gateway Client]
        HEALTH[Health Checker]
        FALLBACK[Fallback Logic]
    end
    
    subgraph "AI Services"
        OLLAMA[Ollama Server]
        LLAMA[llama3.1:8b]
        GEMMA[gemma3:4b]
        GEMINI[Google Gemini]
        TRANSFORMERS[Transformers.js]
    end
    
    subgraph "External Services"
        NGROK[ngrok Tunnel]
        CDN[CDN/Vercel]
    end
    
    %% Client connections
    WEB --> REACT
    MOBILE --> REACT
    
    %% Frontend internal
    REACT --> ROUTER
    REACT --> ZUSTAND
    REACT --> TAILWIND
    REACT --> PAGES
    PAGES --> COMPONENTS
    COMPONENTS --> HOOKS
    
    %% Client storage
    HOOKS --> DEXIE
    DEXIE --> INDEXEDDB
    
    %% API connections
    REACT --> FASTAPI
    FASTAPI --> CORS
    FASTAPI --> RATE
    FASTAPI --> VALIDATION
    
    %% Backend services
    FASTAPI --> PARSER
    FASTAPI --> ATS
    FASTAPI --> BIAS
    FASTAPI --> LOCAL
    FASTAPI --> CHAT
    
    %% AI Gateway
    PARSER --> GATEWAY
    ATS --> GATEWAY
    CHAT --> GATEWAY
    GATEWAY --> HEALTH
    GATEWAY --> FALLBACK
    
    %% AI Services
    GATEWAY --> NGROK
    NGROK --> OLLAMA
    OLLAMA --> LLAMA
    OLLAMA --> GEMMA
    FALLBACK --> GEMINI
    REACT --> TRANSFORMERS
    
    %% External
    CDN --> REACT
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef ai fill:#fff3e0
    classDef storage fill:#e8f5e8
    classDef external fill:#fce4ec
    
    class REACT,ROUTER,ZUSTAND,TAILWIND,PAGES,COMPONENTS,HOOKS frontend
    class FASTAPI,CORS,RATE,VALIDATION,PARSER,ATS,BIAS,LOCAL,CHAT backend
    class GATEWAY,HEALTH,FALLBACK,OLLAMA,LLAMA,GEMMA,GEMINI,TRANSFORMERS ai
    class INDEXEDDB,DEXIE storage
    class NGROK,CDN external
```

---

## 🔄 Data Flow Architecture

### Resume Upload & Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant P as Parser
    participant A as API
    participant AI as AI Gateway
    participant O as Ollama
    participant DB as IndexedDB
    
    Note over U,DB: Resume Upload & Analysis Flow
    
    U->>F: Upload Resume (PDF/DOCX/TXT)
    F->>F: Validate File (size, type)
    F->>P: Parse Document
    P-->>F: Extract Text & Structure
    F->>DB: Store Raw Resume
    
    F->>A: POST /api/analyze-ats
    A->>A: Calculate ATS Score
    A->>A: Detect Sections
    A->>A: Extract Keywords
    A-->>F: Return Analysis
    
    F->>A: POST /api/generate-insights
    A->>AI: Request AI Insights
    AI->>O: Call llama3.1:8b
    O-->>AI: Generate Insights
    AI-->>A: Return Insights
    A-->>F: Return Results
    
    F->>DB: Store Analysis
    F-->>U: Display Dashboard
```

### AutoFix Bullet Rewriting Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant AI as AI Gateway
    participant O as Ollama
    participant DB as IndexedDB
    
    Note over U,DB: AutoFix Flow
    
    U->>F: Click "AutoFix"
    F->>F: Extract Bullets
    F->>A: POST /api/rewrite-batch
    
    loop Batch of 3 bullets
        A->>AI: Request Rewrite
        AI->>O: Call gemma3:4b
        O-->>AI: Rewritten Bullets
        AI-->>A: Return Results
    end
    
    A->>A: Detect Changes
    A->>A: Highlight Differences
    A-->>F: Return Before/After
    
    F-->>U: Show Comparison Modal
    
    alt User Accepts
        U->>F: Accept Changes
        F->>DB: Update Resume
        F->>DB: Create New Version
        F-->>U: Show Success
    else User Skips
        U->>F: Skip Changes
        F-->>U: Keep Original
    end
```

### AI Chat Assistant Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant AI as AI Gateway
    participant O as Ollama
    participant DB as IndexedDB
    
    Note over U,DB: Chat Flow
    
    U->>F: Type Message
    F->>F: Build Context
    F->>DB: Get Resume Data
    DB-->>F: Resume Context
    
    F->>A: POST /api/chat
    A->>A: Add Context
    A->>AI: Request Response
    AI->>O: Call llama3.1:8b
    
    loop Streaming Response
        O-->>AI: Response Chunk
        AI-->>A: Stream Chunk
        A-->>F: Stream Chunk
        F-->>U: Display Chunk
    end
    
    F->>DB: Save Message
    F->>DB: Save Response
```

---

## 📦 Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        HOME[Home Page]
        ANALYZE[Analyze Page]
        HISTORY[History Page]
        TEMPLATES[Templates Page]
    end
    
    subgraph "Analysis Components"
        SCORE[Score Cards]
        RADAR[Radar Chart]
        INSIGHTS[AI Insights]
        RECS[Recommendations]
    end
    
    subgraph "Feature Components"
        AUTOFIX[AutoFix Modal]
        BIAS_MODAL[Bias Report]
        LOCAL_MODAL[Localization]
        CHAT[Chat Interface]
        EXPORT[Export PDF]
    end
    
    subgraph "Shared Components"
        NAV[Navbar]
        FOOTER[Footer]
        BUTTON[Button]
        MODAL[Modal]
        CARD[Card]
    end
    
    %% Page connections
    HOME --> ANALYZE
    HOME --> HISTORY
    HOME --> TEMPLATES
    
    %% Analysis components
    ANALYZE --> SCORE
    ANALYZE --> RADAR
    ANALYZE --> INSIGHTS
    ANALYZE --> RECS
    
    %% Feature components
    ANALYZE --> AUTOFIX
    ANALYZE --> BIAS_MODAL
    ANALYZE --> LOCAL_MODAL
    ANALYZE --> CHAT
    ANALYZE --> EXPORT
    
    %% Shared components
    NAV --> HOME
    NAV --> ANALYZE
    NAV --> HISTORY
    NAV --> TEMPLATES
    
    CARD --> SCORE
    CARD --> INSIGHTS
    CARD --> RECS
    
    MODAL --> AUTOFIX
    MODAL --> BIAS_MODAL
    MODAL --> LOCAL_MODAL
    
    BUTTON --> AUTOFIX
    BUTTON --> EXPORT
    
    FOOTER --> HOME
```

---

## 🗄️ Data Storage Architecture

```mermaid
graph TB
    subgraph "IndexedDB Schema"
        RESUMES[(Resumes Table)]
        VERSIONS[(Versions Table)]
        ANALYSIS[(Analysis Table)]
        CHAT_MSG[(Chat Messages)]
        BIAS_REP[(Bias Reports)]
    end
    
    subgraph "Resume Data"
        RES_ID[Resume ID]
        RES_FILE[File Name]
        RES_TEXT[Raw Text]
        RES_PARSED[Parsed Data]
    end
    
    subgraph "Version Data"
        VER_ID[Version ID]
        VER_NUM[Version Number]
        VER_CONTENT[Content]
        VER_CHANGES[Changes]
    end
    
    subgraph "Analysis Data"
        ANA_SCORE[ATS Score]
        ANA_KEYWORDS[Keywords]
        ANA_INSIGHTS[AI Insights]
        ANA_RECS[Recommendations]
    end
    
    %% Relationships
    RESUMES --> RES_ID
    RESUMES --> RES_FILE
    RESUMES --> RES_TEXT
    RESUMES --> RES_PARSED
    
    VERSIONS --> VER_ID
    VERSIONS --> VER_NUM
    VERSIONS --> VER_CONTENT
    VERSIONS --> VER_CHANGES
    
    ANALYSIS --> ANA_SCORE
    ANALYSIS --> ANA_KEYWORDS
    ANALYSIS --> ANA_INSIGHTS
    ANALYSIS --> ANA_RECS
    
    RES_ID -.->|Foreign Key| VERSIONS
    RES_ID -.->|Foreign Key| ANALYSIS
    RES_ID -.->|Foreign Key| CHAT_MSG
    RES_ID -.->|Foreign Key| BIAS_REP
    
    %% Styling
    classDef table fill:#e8f5e8
    classDef data fill:#e1f5fe
    
    class RESUMES,VERSIONS,ANALYSIS,CHAT_MSG,BIAS_REP table
    class RES_ID,RES_FILE,RES_TEXT,RES_PARSED,VER_ID,VER_NUM,VER_CONTENT,VER_CHANGES,ANA_SCORE,ANA_KEYWORDS,ANA_INSIGHTS,ANA_RECS data
```

---

## 🚀 Deployment Architecture

### MVP Deployment

```mermaid
graph TB
    subgraph "CDN Layer"
        VERCEL[Vercel CDN]
        EDGE[Edge Locations]
    end
    
    subgraph "Frontend Hosting"
        STATIC[Static Files]
        HTML[HTML/CSS/JS]
    end
    
    subgraph "Backend Hosting"
        CLOUDRUN[Google Cloud Run]
        CONTAINER[Docker Container]
        FASTAPI_APP[FastAPI App]
    end
    
    subgraph "AI Infrastructure"
        NGROK_TUNNEL[ngrok Tunnel]
        OLLAMA_SERVER[Ollama Server]
        GPU[GPU Instance]
    end
    
    subgraph "Monitoring"
        SENTRY[Sentry]
        DATADOG[DataDog]
    end
    
    %% Connections
    VERCEL --> EDGE
    EDGE --> STATIC
    STATIC --> HTML
    
    HTML --> CLOUDRUN
    CLOUDRUN --> CONTAINER
    CONTAINER --> FASTAPI_APP
    
    FASTAPI_APP --> NGROK_TUNNEL
    NGROK_TUNNEL --> OLLAMA_SERVER
    OLLAMA_SERVER --> GPU
    
    FASTAPI_APP --> SENTRY
    FASTAPI_APP --> DATADOG
    HTML --> SENTRY
    
    %% Styling
    classDef cdn fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef ai fill:#fff3e0
    classDef monitor fill:#fce4ec
    
    class VERCEL,EDGE cdn
    class CLOUDRUN,CONTAINER,FASTAPI_APP backend
    class NGROK_TUNNEL,OLLAMA_SERVER,GPU ai
    class SENTRY,DATADOG monitor
```

### Full-Scale Deployment

```mermaid
graph TB
    subgraph "Global CDN"
        CF[CloudFlare]
        CACHE[Edge Cache]
    end
    
    subgraph "Load Balancer"
        LB[Load Balancer]
        SSL[SSL/TLS]
    end
    
    subgraph "Frontend Cluster"
        FE1[Frontend Instance 1]
        FE2[Frontend Instance 2]
        FE3[Frontend Instance 3]
    end
    
    subgraph "Backend Cluster"
        BE1[Backend Instance 1]
        BE2[Backend Instance 2]
        BE3[Backend Instance 3]
    end
    
    subgraph "AI Service Cluster"
        AI1[AI Server 1]
        AI2[AI Server 2]
        AI3[AI Server 3]
    end
    
    subgraph "Database Cluster"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
        REPLICA[(Read Replica)]
    end
    
    %% Connections
    CF --> CACHE
    CACHE --> LB
    LB --> SSL
    
    SSL --> FE1
    SSL --> FE2
    SSL --> FE3
    
    FE1 --> BE1
    FE2 --> BE2
    FE3 --> BE3
    
    BE1 --> AI1
    BE2 --> AI2
    BE3 --> AI3
    
    BE1 --> POSTGRES
    BE2 --> POSTGRES
    BE3 --> POSTGRES
    
    POSTGRES --> REPLICA
    BE1 --> REDIS
    BE2 --> REDIS
    BE3 --> REDIS
    
    %% Styling
    classDef cdn fill:#e1f5fe
    classDef frontend fill:#f3e5f5
    classDef backend fill:#fff3e0
    classDef ai fill:#fce4ec
    classDef database fill:#e8f5e8
    
    class CF,CACHE cdn
    class LB,SSL,FE1,FE2,FE3 frontend
    class BE1,BE2,BE3 backend
    class AI1,AI2,AI3 ai
    class POSTGRES,REDIS,REPLICA database
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        HTTPS[HTTPS Only]
        CSP[Content Security Policy]
        XSS[XSS Protection]
    end
    
    subgraph "API Security"
        RATE_LIM[Rate Limiting]
        CORS_POL[CORS Policy]
        INPUT_VAL[Input Validation]
        AUTH[Authentication]
    end
    
    subgraph "Data Security"
        ENCRYPT[Encryption at Rest]
        TRANSIT[Encryption in Transit]
        SANITIZE[Data Sanitization]
    end
    
    subgraph "AI Security"
        PROMPT_VAL[Prompt Validation]
        TIMEOUT[Timeout Protection]
        FALLBACK_SEC[Secure Fallback]
    end
    
    %% Connections
    HTTPS --> RATE_LIM
    CSP --> INPUT_VAL
    XSS --> SANITIZE
    
    RATE_LIM --> ENCRYPT
    CORS_POL --> TRANSIT
    INPUT_VAL --> PROMPT_VAL
    AUTH --> TIMEOUT
    
    %% Styling
    classDef client fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef ai fill:#fff3e0
    
    class HTTPS,CSP,XSS client
    class RATE_LIM,CORS_POL,INPUT_VAL,AUTH api
    class ENCRYPT,TRANSIT,SANITIZE data
    class PROMPT_VAL,TIMEOUT,FALLBACK_SEC ai
```

---

## 📊 Technology Stack

```mermaid
graph TB
    subgraph "Frontend Stack"
        REACT[React 18.2]
        TS[TypeScript 5.2]
        VITE[Vite 5.0]
        TAILWIND[TailwindCSS 3.3]
        ZUSTAND[Zustand 4.4]
        ROUTER[React Router 6.20]
        DEXIE[Dexie.js 3.2]
        RECHARTS[Recharts 2.10]
    end
    
    subgraph "Backend Stack"
        FASTAPI[FastAPI 0.115]
        PYTHON[Python 3.9+]
        PYDANTIC[Pydantic 2.10]
        UVICORN[Uvicorn 0.32]
    end
    
    subgraph "AI Stack"
        OLLAMA[Ollama]
        LLAMA_MODEL[llama3.1:8b]
        GEMMA_MODEL[gemma3:4b]
        TRANSFORMERS[Transformers.js 2.6]
        SENTENCE[sentence-transformers]
    end
    
    subgraph "Document Processing"
        PDFJS[pdfjs-dist 3.11]
        MAMMOTH[mammoth 1.6]
        PYMUPDF[PyMuPDF 1.24]
        DOCX[python-docx 1.1]
    end
    
    subgraph "Development Tools"
        ESLINT[ESLint 8.55]
        PRETTIER[Prettier]
        BLACK[Black]
        PYTEST[Pytest 7.4]
        VITEST[Vitest 1.0]
    end
    
    %% Connections
    REACT --> TS
    REACT --> VITE
    REACT --> TAILWIND
    REACT --> ZUSTAND
    REACT --> ROUTER
    REACT --> DEXIE
    REACT --> RECHARTS
    
    FASTAPI --> PYTHON
    FASTAPI --> PYDANTIC
    FASTAPI --> UVICORN
    
    OLLAMA --> LLAMA_MODEL
    OLLAMA --> GEMMA_MODEL
    REACT --> TRANSFORMERS
    FASTAPI --> SENTENCE
    
    REACT --> PDFJS
    REACT --> MAMMOTH
    FASTAPI --> PYMUPDF
    FASTAPI --> DOCX
    
    TS --> ESLINT
    TS --> PRETTIER
    PYTHON --> BLACK
    PYTHON --> PYTEST
    TS --> VITEST
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef ai fill:#fff3e0
    classDef docs fill:#e8f5e8
    classDef dev fill:#fce4ec
    
    class REACT,TS,VITE,TAILWIND,ZUSTAND,ROUTER,DEXIE,RECHARTS frontend
    class FASTAPI,PYTHON,PYDANTIC,UVICORN backend
    class OLLAMA,LLAMA_MODEL,GEMMA_MODEL,TRANSFORMERS,SENTENCE ai
    class PDFJS,MAMMOTH,PYMUPDF,DOCX docs
    class ESLINT,PRETTIER,BLACK,PYTEST,VITEST dev
```

---

## 📈 Scalability Considerations

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

---

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

---

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
