# API Reference

Complete API documentation for Career+ backend services.

## Base URL

```
Development: http://localhost:8000
Production: https://api.careerplus.ai
```

## Authentication

Currently, no authentication is required for MVP. Future versions will use JWT tokens.

```http
Authorization: Bearer <token>
```

## Rate Limiting

All endpoints are rate-limited to **10 requests per minute** per IP address.

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1699999999
```

**Rate Limit Exceeded:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
  "detail": "Rate limit exceeded. Try again in 45 seconds."
}
```

## Endpoints

### 1. Analyze Resume for ATS

Analyze resume text for ATS compatibility and extract structured data.

**Endpoint:** `POST /api/analyze-ats`

**Request:**
```json
{
  "resume_text": "John Doe\nSoftware Engineer\n\nExperience:\n- Built scalable web applications...",
  "job_description": "We are looking for a Senior Software Engineer with 5+ years of experience..."
}
```

**Response:**
```json
{
  "ats_score": 85.5,
  "keyword_matches": [
    {
      "keyword": "Python",
      "found": true,
      "frequency": 3
    },
    {
      "keyword": "React",
      "found": true,
      "frequency": 2
    }
  ],
  "missing_keywords": ["Kubernetes", "Docker"],
  "sections_found": {
    "contact": true,
    "summary": true,
    "experience": true,
    "education": true,
    "skills": true
  },
  "recommendations": [
    "Add 'Kubernetes' to skills section",
    "Include more quantifiable achievements"
  ]
}
```

**Status Codes:**
- `200 OK` - Analysis successful
- `400 Bad Request` - Invalid input
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

### 2. Detect Bias

Analyze text for biased language and suggest alternatives.

**Endpoint:** `POST /api/analyze-bias`

**Request:**
```json
{
  "text": "Looking for a young, energetic salesman to join our dynamic team."
}
```

**Response:**
```json
{
  "biased_phrases": [
    {
      "original": "young",
      "suggestion": "energetic",
      "reason": "Avoid age references that may discriminate",
      "category": "age",
      "severity": "high",
      "position": {
        "start": 15,
        "end": 20
      }
    },
    {
      "original": "salesman",
      "suggestion": "salesperson",
      "reason": "Use gender-neutral job titles",
      "category": "gender",
      "severity": "medium",
      "position": {
        "start": 33,
        "end": 41
      }
    }
  ],
  "bias_score": 15.5,
  "total_issues": 2,
  "categories": {
    "age": 1,
    "gender": 1,
    "race": 0,
    "disability": 0,
    "other": 0
  }
}
```

**Bias Categories:**
- `age` - Age-related bias
- `gender` - Gender-related bias
- `race` - Race/ethnicity-related bias
- `disability` - Disability-related bias
- `other` - Other forms of bias

**Severity Levels:**
- `high` - Strongly biased, should be fixed
- `medium` - Potentially biased, consider fixing
- `low` - Mildly biased, optional fix

---

### 3. Regional Localization

Get region-specific resume formatting advice.

**Endpoint:** `POST /api/localize`

**Request:**
```json
{
  "resume_text": "My CV includes my photo and date of birth...",
  "target_region": "US"
}
```

**Supported Regions:**
- `US` - United States
- `UK` - United Kingdom
- `EU` - European Union
- `APAC` - Asia-Pacific

**Response:**
```json
{
  "recommendations": [
    "Use 'Resume' instead of 'CV' in US applications",
    "Remove photo from resume",
    "Remove date of birth and age information"
  ],
  "format_changes": [
    "Do NOT include photo, age, marital status, or nationality",
    "Use month/day/year date format (e.g., 12/25/2023)",
    "Use 'Resume' not 'CV'",
    "Include phone number with country code (+1)",
    "List education after experience (unless recent graduate)"
  ],
  "terminology_changes": [
    {
      "from": "CV",
      "to": "Resume",
      "reason": "Use 'Resume' in US resumes"
    },
    {
      "from": "Mobile",
      "to": "Cell phone",
      "reason": "US terminology"
    }
  ],
  "target_region": "US",
  "date_format": "MM/DD/YYYY",
  "cultural_notes": [
    "US employers value quantifiable achievements",
    "Keep resume to 1-2 pages maximum",
    "Use action verbs to start bullet points"
  ]
}
```

---

### 4. Generate AI Insights

Generate personalized resume insights using AI.

**Endpoint:** `POST /api/generate-insights`

**Request:**
```json
{
  "resume_text": "John Doe\nSoftware Engineer...",
  "job_description": "Senior Software Engineer position...",
  "user_context": {
    "years_experience": 5,
    "target_role": "Senior Software Engineer",
    "industry": "Technology"
  }
}
```

**Response:**
```json
{
  "strengths": [
    "Strong technical background with 5+ years of experience",
    "Demonstrated leadership in managing cross-functional teams",
    "Proven track record of delivering scalable solutions"
  ],
  "gaps": [
    "Limited cloud infrastructure experience mentioned",
    "No specific metrics for team size or project impact",
    "Missing recent certifications or continuous learning"
  ],
  "recommendations": [
    "Add specific metrics: 'Led team of X engineers'",
    "Highlight cloud platform experience (AWS, Azure, GCP)",
    "Include recent projects with measurable outcomes"
  ],
  "overall_assessment": "Strong candidate with solid technical foundation. Adding quantifiable achievements and cloud experience would significantly strengthen the resume.",
  "confidence_score": 0.87,
  "generated_at": "2025-11-13T10:30:00Z"
}
```

**Timeout:** 30 seconds

---

### 5. Batch Rewrite Bullets

Rewrite resume bullets using AI for improved impact.

**Endpoint:** `POST /api/rewrite-batch`

**Request:**
```json
{
  "bullets": [
    "Responsible for managing team projects",
    "Worked on improving system performance",
    "Helped with customer support issues"
  ],
  "job_description": "Senior Software Engineer role requiring leadership and technical expertise...",
  "tone": "professional",
  "focus": "achievements"
}
```

**Tone Options:**
- `professional` - Formal, business-appropriate
- `confident` - Assertive, achievement-focused
- `technical` - Technical depth, specific terminology

**Focus Options:**
- `achievements` - Emphasize results and impact
- `skills` - Highlight technical skills
- `leadership` - Emphasize leadership and collaboration

**Response:**
```json
{
  "rewritten": [
    {
      "original": "Responsible for managing team projects",
      "improved": "Led cross-functional team of 8 engineers to deliver 12+ projects on time, resulting in 25% increase in team productivity",
      "changes": [
        "Added strong action verb 'Led'",
        "Added specific metrics (8 engineers, 12 projects)",
        "Added measurable outcome (25% increase)"
      ],
      "improvement_score": 8.5
    },
    {
      "original": "Worked on improving system performance",
      "improved": "Optimized system architecture, reducing API response time by 40% and improving throughput by 2x",
      "changes": [
        "Changed weak verb 'Worked on' to 'Optimized'",
        "Added specific metrics (40%, 2x)",
        "Made achievement more concrete"
      ],
      "improvement_score": 9.0
    },
    {
      "original": "Helped with customer support issues",
      "improved": "Resolved 150+ critical customer issues, achieving 95% satisfaction rating and reducing average resolution time by 30%",
      "changes": [
        "Changed passive 'Helped' to active 'Resolved'",
        "Added quantifiable metrics (150+, 95%, 30%)",
        "Emphasized positive outcomes"
      ],
      "improvement_score": 8.8
    }
  ],
  "batch_summary": {
    "total_bullets": 3,
    "average_improvement": 8.77,
    "processing_time_ms": 12500
  }
}
```

**Timeout:** 90 seconds (30s per batch of 3)

---

### 6. Chat with AI Assistant

Interactive chat for resume advice and career guidance.

**Endpoint:** `POST /api/chat`

**Request:**
```json
{
  "message": "How can I make my resume stand out for a senior engineering role?",
  "context": {
    "resume_text": "...",
    "conversation_history": [
      {
        "role": "user",
        "content": "What's my ATS score?"
      },
      {
        "role": "assistant",
        "content": "Your ATS score is 85.5, which is good..."
      }
    ]
  }
}
```

**Response:**
```json
{
  "response": "To make your resume stand out for a senior engineering role, I recommend:\n\n1. **Quantify your impact**: Add specific metrics...\n2. **Highlight leadership**: Emphasize team management...\n3. **Technical depth**: Include architecture decisions...",
  "suggestions": [
    "Add metrics to your experience bullets",
    "Include a technical skills section",
    "Highlight leadership experiences"
  ],
  "confidence": 0.92,
  "sources": ["resume_analysis", "best_practices"]
}
```

**Streaming Response:**

For real-time streaming, use Server-Sent Events (SSE):

```http
GET /api/chat/stream?message=...
Accept: text/event-stream
```

```
data: {"chunk": "To make your resume", "done": false}

data: {"chunk": " stand out for a", "done": false}

data: {"chunk": " senior engineering role...", "done": true}
```

---

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message describing what went wrong",
  "error_code": "INVALID_INPUT",
  "timestamp": "2025-11-13T10:30:00Z"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `AI_SERVICE_UNAVAILABLE` | AI service is down |
| `PROCESSING_TIMEOUT` | Request took too long |
| `INTERNAL_ERROR` | Server error |

---

## Webhooks (Future)

Subscribe to events for async processing.

**Events:**
- `analysis.completed` - Resume analysis finished
- `rewrite.completed` - Batch rewrite finished
- `export.completed` - PDF export ready

**Webhook Payload:**
```json
{
  "event": "analysis.completed",
  "data": {
    "resume_id": "abc123",
    "ats_score": 85.5
  },
  "timestamp": "2025-11-13T10:30:00Z"
}
```

---

## SDK Examples

### Python

```python
import requests

API_URL = "http://localhost:8000"

# Analyze resume
response = requests.post(
    f"{API_URL}/api/analyze-ats",
    json={
        "resume_text": "...",
        "job_description": "..."
    }
)

data = response.json()
print(f"ATS Score: {data['ats_score']}")
```

### JavaScript/TypeScript

```typescript
const API_URL = "http://localhost:8000";

// Analyze resume
const response = await fetch(`${API_URL}/api/analyze-ats`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    resume_text: "...",
    job_description: "...",
  }),
});

const data = await response.json();
console.log(`ATS Score: ${data.ats_score}`);
```

### cURL

```bash
curl -X POST http://localhost:8000/api/analyze-ats \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "...",
    "job_description": "..."
  }'
```

---

## Interactive API Documentation

Visit the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

**Next**: [Architecture Overview](./04-architecture.md)
