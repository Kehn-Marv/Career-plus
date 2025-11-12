# Career+ Frontend

React + TypeScript + Vite frontend for Career+ AI-powered career co-pilot.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Database**: IndexedDB (via Dexie.js)
- **UI Components**: shadcn/ui (to be added)
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

### Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_URL=http://localhost:8000
VITE_HF_SPACE_URL=<your-hf-space-url>
```

## Project Structure

```
src/
├── components/       # React components
│   ├── layout/      # Header, Footer, Sidebar
│   ├── upload/      # File upload components
│   ├── analysis/    # Analysis dashboard components
│   ├── chat/        # Chat interface components
│   ├── templates/   # Resume template components
│   └── ui/          # shadcn/ui components
├── lib/             # Core libraries
│   ├── db/          # IndexedDB schema and operations
│   ├── ai/          # AI integration (embeddings, scoring)
│   ├── parsers/     # Document parsers
│   ├── validators/  # File and content validation
│   └── utils/       # Utility functions
├── store/           # Zustand state stores
├── hooks/           # Custom React hooks
├── pages/           # Page components
└── main.tsx         # App entry point
```

## Development

### Code Style

- ESLint configured for TypeScript and React
- Prettier recommended for formatting
- Follow React best practices and hooks rules

### Path Aliases

Use `@/` prefix for imports:

```typescript
import { cn } from '@/lib/utils/cn'
import Header from '@/components/layout/Header'
```

## Building

```bash
npm run build
```

Output will be in `dist/` directory.

## License

MIT - See LICENSE file in root directory
