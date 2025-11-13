# Testing Strategy

Comprehensive testing approach for Career+ platform.

## 🎯 Testing Philosophy

- **Test Early**: Write tests as you develop
- **Test Often**: Run tests frequently
- **Test Thoroughly**: Cover critical paths
- **Test Realistically**: Use real-world scenarios

## 📊 Testing Pyramid

```
        /\
       /  \
      / E2E \
     /--------\
    /Integration\
   /--------------\
  /   Unit Tests   \
 /------------------\
```

- **70% Unit Tests**: Fast, isolated, specific
- **20% Integration Tests**: Component interactions
- **10% E2E Tests**: Full user workflows

---

## 🧪 Unit Testing

### Backend Unit Tests

```python
# tests/test_ats_analyzer.py
import pytest
from app.services.ats_analyzer import ATSAnalyzer

def test_ats_score_calculation():
    analyzer = ATSAnalyzer()
    result = analyzer.analyze("Sample resume with skills")
    
    assert 0 <= result['ats_score'] <= 100
    assert 'sections_found' in result
    assert 'recommendations' in result

def test_keyword_matching():
    analyzer = ATSAnalyzer()
    resume = "Python developer with React experience"
    job_desc = "Looking for Python and React developer"
    
    result = analyzer.analyze(resume, job_desc)
    
    assert len(result['keyword_matches']) > 0
    assert 'Python' in [m['keyword'] for m in result['keyword_matches']]
```

### Frontend Unit Tests

```typescript
// lib/parsers/pdfParser.test.ts
import { parsePDF } from './pdfParser'

describe('PDF Parser', () => {
  it('extracts text from PDF', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const text = await parsePDF(file)
    
    expect(text).toBeTruthy()
    expect(typeof text).toBe('string')
  })
  
  it('handles invalid PDF', async () => {
    const file = new File(['invalid'], 'test.pdf', { type: 'application/pdf' })
    
    await expect(parsePDF(file)).rejects.toThrow()
  })
})
```

---

## 🔗 Integration Testing

### API Integration Tests

```python
# tests/integration/test_api_flow.py
def test_full_analysis_flow(client):
    # Upload resume
    response = client.post(
        "/api/analyze-ats",
        json={"resume_text": "Sample resume"}
    )
    assert response.status_code == 200
    
    # Get insights
    response = client.post(
        "/api/generate-insights",
        json={"resume_text": "Sample resume"}
    )
    assert response.status_code == 200
    
    # Run AutoFix
    response = client.post(
        "/api/rewrite-batch",
        json={"bullets": ["Sample bullet"]}
    )
    assert response.status_code == 200
```

### Component Integration Tests

```typescript
// components/Analyze.integration.test.tsx
describe('Analyze Page Integration', () => {
  it('completes full analysis workflow', async () => {
    render(<Analyze />)
    
    // Upload file
    const file = new File(['content'], 'resume.pdf')
    const input = screen.getByLabelText('Upload Resume')
    fireEvent.change(input, { target: { files: [file] } })
    
    // Wait for analysis
    await waitFor(() => {
      expect(screen.getByText(/ATS Score/i)).toBeInTheDocument()
    })
    
    // Check results displayed
    expect(screen.getByText(/85/)).toBeInTheDocument()
  })
})
```

---

## 🌐 End-to-End Testing

### E2E Test Setup

```typescript
// e2e/resume-optimization.spec.ts
import { test, expect } from '@playwright/test'

test('complete resume optimization flow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173')
  
  // Upload resume
  await page.click('text=Upload Resume')
  await page.setInputFiles('input[type="file"]', 'test-resume.pdf')
  
  // Wait for analysis
  await page.waitForSelector('text=ATS Score')
  
  // Run AutoFix
  await page.click('text=AutoFix')
  await page.waitForSelector('text=Before')
  await page.click('text=Accept')
  
  // Verify improvement
  const score = await page.textContent('[data-testid="ats-score"]')
  expect(parseInt(score)).toBeGreaterThan(70)
})
```

---

## 📈 Test Coverage

### Coverage Goals
- **Overall**: > 80%
- **Critical paths**: > 95%
- **UI components**: > 70%
- **Business logic**: > 90%

### Generate Coverage Reports

```bash
# Backend
pytest --cov=app --cov-report=html

# Frontend
npm test -- --coverage
```

---

## 🚀 Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: pip install -r requirements.txt
      - run: pytest --cov=app
      
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
```

---

**Next**: [Deployment Guide](./18-deployment.md)
