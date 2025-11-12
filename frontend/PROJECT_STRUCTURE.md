# Career+ Frontend - Project Structure

## Overview

This document outlines the complete folder structure and purpose of each directory.

## Directory Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── layout/       # Layout components (Header, Footer, Sidebar)
│   │   ├── upload/       # File upload UI (Task 5)
│   │   ├── analysis/     # Analysis dashboard (Task 12-14)
│   │   ├── chat/         # Chat interface (Task 19)
│   │   ├── templates/    # Resume templates (Task 16)
│   │   └── ui/           # shadcn/ui base components
│   │
│   ├── lib/              # Core libraries and utilities
│   │   ├── db/          # IndexedDB (Task 2)
│   │   │   ├── schema.ts        # Dexie schema definitions
│   │   │   ├── operations.ts   # CRUD operations
│   │   │   └── migrations.ts   # Schema versioning
│   │   │
│   │   ├── ai/          # AI integration (Task 9-11)
│   │   │   ├── embeddings.ts   # Transformers.js wrapper
│   │   │   ├── scoring.ts      # ATS algorithm
│   │   │   └── api-client.ts   # Backend API calls
│   │   │
│   │   ├── parsers/     # Document parsing (Task 6-8)
│   │   │   ├── pdf-parser.ts        # PDF.js integration
│   │   │   ├── docx-parser.ts       # mammoth.js integration
│   │   │   └── text-extractor.ts    # Common extraction logic
│   │   │
│   │   ├── validators/  # Validation (Task 5)
│   │   │   ├── file-validator.ts    # File type, size checks
│   │   │   └── content-validator.ts # Guardrails, NSFW detection
│   │   │
│   │   └── utils/       # Utility functions
│   │       ├── cn.ts            # className merger
│   │       ├── export.ts        # PDF generation (Task 17)
│   │       └── formatting.ts    # Text utilities
│   │
│   ├── store/           # Zustand state management (Task 3)
│   │   ├── analysis-store.ts    # Current analysis state
│   │   ├── history-store.ts     # Past analyses
│   │   └── chat-store.ts        # Chat messages
│   │
│   ├── hooks/           # Custom React hooks
│   │   ├── useAnalysis.ts       # Analysis operations
│   │   ├── useIndexedDB.ts      # DB operations
│   │   └── useFileUpload.ts     # Upload handling
│   │
│   ├── pages/           # Page components
│   │   ├── Home.tsx            # Landing page
│   │   ├── Analyze.tsx         # Main analysis page
│   │   └── History.tsx         # Past analyses
│   │
│   ├── App.tsx          # Root component with routing
│   ├── main.tsx         # App entry point
│   ├── index.css        # Global styles (Tailwind)
│   └── vite-env.d.ts    # TypeScript environment types
│
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── .eslintrc.cjs        # ESLint configuration
├── .env                 # Environment variables (local)
├── .env.example         # Environment variables template
└── README.md            # Project documentation
```

## Component Organization

### Layout Components
- **Header**: Navigation, logo, links
- **Footer**: Credits, links, copyright
- **Sidebar**: Analysis history navigation

### Feature Components
Each feature area has its own directory:
- `upload/`: File upload and validation UI
- `analysis/`: Score cards, radar charts, recommendations
- `chat/`: AI chat interface and history
- `templates/`: Resume template gallery and preview

### UI Components
Base components from shadcn/ui (Button, Card, Dialog, etc.)

## State Management

Using Zustand for lightweight, performant state:
- **analysis-store**: Current resume, JD, and analysis results
- **history-store**: List of past analyses
- **chat-store**: Chat messages and sessions

All stores sync with IndexedDB for persistence.

## Data Flow

```
User Action
    ↓
React Component
    ↓
Zustand Store (state update)
    ↓
IndexedDB (persistence)
    ↓
Backend API (if needed)
    ↓
Store Update
    ↓
Component Re-render
```

## Task Implementation Order

1. ✅ **Task 1**: Project structure (COMPLETED)
2. **Task 2**: IndexedDB schema and operations
3. **Task 3**: Zustand stores
4. **Task 4**: Backend API enhancements
5. **Task 5**: File upload and validation
6. **Task 6-8**: Document parsing
7. **Task 9-11**: AI integration
8. **Task 12-14**: Analysis features
9. **Task 15-18**: Enhancement features
10. **Task 19-24**: User experience
11. **Task 25-26**: Deployment and docs

## Notes

- Path aliases configured: `@/` maps to `src/`
- All components use TypeScript for type safety
- Tailwind CSS for styling with custom theme
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA) built-in from start
