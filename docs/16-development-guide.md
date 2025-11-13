# Development Guide

Complete guide for developing features in Career+ platform.

## 🛠️ Development Setup

### Prerequisites
- Completed [Installation Guide](./03-installation.md)
- Code editor (VS Code recommended)
- Git configured
- Terminal/command line access

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

---

## 📁 Project Structure

```
career-plus/
├── backend/                 # Python/FastAPI backend
│   ├── app/
│   │   ├── main.py         # App entry point
│   │   ├── api.py          # API routes
│   │   ├── models.py       # Pydantic models
│   │   ├── services/       # Business logic
│   │   └── ai/             # AI integration
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Core libraries
│   │   ├── store/          # State management
│   │   ├── hooks/          # Custom hooks
│   │   └── main.tsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
│
└── docs/                   # Documentation
```

---

## 🔄 Development Workflow

### 1. Create Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

#### Backend Development

```bash
# Navigate to backend
cd backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run backend with hot-reload
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Format code
black app/
flake8 app/
```

#### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Run development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### 3. Test Changes

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your feature branch
4. Fill in PR template
5. Request review

---

## 📝 Coding Standards

### Python (Backend)

#### Style Guide
- Follow PEP 8
- Use Black formatter
- Max line length: 88 characters
- Use type hints

#### Example:
```python
from typing import List, Optional
from pydantic import BaseModel

class ResumeAnalysis(BaseModel):
    ats_score: float
    keywords: List[str]
    recommendations: List[str]

async def analyze_resume(
    resume_text: str,
    job_description: Optional[str] = None
) -> ResumeAnalysis:
    """
    Analyze resume and return ATS score.
    
    Args:
        resume_text: The resume content
        job_description: Optional job description for matching
        
    Returns:
        ResumeAnalysis object with scores and recommendations
    """
    # Implementation
    pass
```

### TypeScript (Frontend)

#### Style Guide
- Use TypeScript strict mode
- Use functional components
- Use hooks for state
- Follow React best practices

#### Example:
```typescript
interface ResumeProps {
  resume: Resume
  onUpdate: (resume: Resume) => void
}

export function ResumeCard({ resume, onUpdate }: ResumeProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const handleSave = async () => {
    try {
      await updateResume(resume.id, changes)
      onUpdate(updatedResume)
    } catch (error) {
      console.error('Failed to update:', error)
    }
  }
  
  return (
    <div className="resume-card">
      {/* Component JSX */}
    </div>
  )
}
```

---

## 🧪 Testing

### Backend Testing

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_ats():
    response = client.post(
        "/api/analyze-ats",
        json={
            "resume_text": "Sample resume text",
            "job_description": "Sample job description"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "ats_score" in data
    assert 0 <= data["ats_score"] <= 100
```

### Frontend Testing

```typescript
// components/ResumeCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ResumeCard } from './ResumeCard'

describe('ResumeCard', () => {
  it('renders resume information', () => {
    const resume = {
      id: '1',
      fileName: 'test.pdf',
      atsScore: 85
    }
    
    render(<ResumeCard resume={resume} onUpdate={() => {}} />)
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
  })
  
  it('calls onUpdate when saved', async () => {
    const onUpdate = jest.fn()
    render(<ResumeCard resume={resume} onUpdate={onUpdate} />)
    
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
    })
  })
})
```

---

## 🐛 Debugging

### Backend Debugging

```python
# Add breakpoints
import pdb; pdb.set_trace()

# Or use logging
import logging
logger = logging.getLogger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.error("Error message")
```

### Frontend Debugging

```typescript
// Use console methods
console.log('Debug:', data)
console.error('Error:', error)
console.table(array)

// Use React DevTools
// Install browser extension

// Use debugger statement
debugger;
```

---

## 📦 Adding Dependencies

### Backend

```bash
# Add package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt

# Or add manually to requirements.txt
echo "package-name>=1.0.0" >> requirements.txt
```

### Frontend

```bash
# Add package
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Update package.json automatically
```

---

## 🚀 Common Tasks

### Add New API Endpoint

1. Define Pydantic model in `models.py`
2. Create service function in `services/`
3. Add route in `api.py`
4. Add tests in `tests/`
5. Update API documentation

### Add New React Component

1. Create component file in `components/`
2. Add TypeScript interface
3. Implement component
4. Add tests
5. Export from index

### Add New Page

1. Create page in `pages/`
2. Add route in `App.tsx`
3. Add navigation link
4. Add tests

---

## 📚 Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Next**: [Testing Strategy](./17-testing-strategy.md)
