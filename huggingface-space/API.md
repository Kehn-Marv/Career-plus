# Career+ Resume Rewriter API

This Hugging Face Space provides both a Gradio UI and REST API endpoints for resume bullet point rewriting.

## Base URL

```
https://your-space-name.hf.space
```

## Endpoints

### 1. Health Check

**GET** `/`

Check if the service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "Career+ Resume Rewriter",
  "version": "1.0.0",
  "model": "mistralai/Mistral-7B-Instruct-v0.2"
}
```

### 2. Rewrite Single Bullet

**POST** `/api/rewrite`

Rewrite a single resume bullet point.

**Request Body:**
```json
{
  "bullet": "Managed team projects and improved processes",
  "job_description": "Senior Software Engineer position requiring 5+ years experience...",
  "tone": "professional",
  "temperature": 0.7
}
```

**Parameters:**
- `bullet` (required): Resume bullet point to rewrite (10-500 chars)
- `job_description` (required): Target job description (50-5000 chars)
- `tone` (optional): Writing tone - "professional", "dynamic", "technical", or "leadership" (default: "professional")
- `temperature` (optional): Generation creativity 0.3-1.0 (default: 0.7)

**Response:**
```json
{
  "original": "Managed team projects and improved processes",
  "rewritten": "Led cross-functional team initiatives, implementing process improvements that increased efficiency by 25% and reduced project delivery time by 2 weeks",
  "success": true
}
```

### 3. Rewrite Multiple Bullets (Batch)

**POST** `/api/rewrite-batch`

Rewrite multiple resume bullet points in a single request.

**Request Body:**
```json
{
  "bullets": [
    "Managed team projects",
    "Worked on system improvements",
    "Responsible for code reviews"
  ],
  "job_description": "Senior Software Engineer position requiring 5+ years experience...",
  "tone": "professional",
  "temperature": 0.7
}
```

**Parameters:**
- `bullets` (required): Array of resume bullets (1-10 items)
- `job_description` (required): Target job description (50-5000 chars)
- `tone` (optional): Writing tone (default: "professional")
- `temperature` (optional): Generation creativity 0.3-1.0 (default: 0.7)

**Response:**
```json
{
  "results": [
    {
      "original": "Managed team projects",
      "rewritten": "Led cross-functional team of 5 engineers, delivering 12 projects on time with 98% stakeholder satisfaction",
      "success": true
    },
    {
      "original": "Worked on system improvements",
      "rewritten": "Architected and implemented system optimizations that reduced latency by 40% and improved throughput by 3x",
      "success": true
    },
    {
      "original": "Responsible for code reviews",
      "rewritten": "Conducted comprehensive code reviews for 200+ pull requests, mentoring junior developers and maintaining 95% code quality standards",
      "success": true
    }
  ],
  "total": 3,
  "success_count": 3
}
```

## Usage Examples

### cURL

```bash
# Single bullet rewrite
curl -X POST "https://your-space-name.hf.space/api/rewrite" \
  -H "Content-Type: application/json" \
  -d '{
    "bullet": "Managed team projects",
    "job_description": "Senior Software Engineer position...",
    "tone": "professional",
    "temperature": 0.7
  }'

# Batch rewrite
curl -X POST "https://your-space-name.hf.space/api/rewrite-batch" \
  -H "Content-Type: application/json" \
  -d '{
    "bullets": ["Managed team projects", "Worked on improvements"],
    "job_description": "Senior Software Engineer position...",
    "tone": "professional"
  }'
```

### JavaScript/TypeScript

```typescript
// Single bullet rewrite
const response = await fetch('https://your-space-name.hf.space/api/rewrite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bullet: 'Managed team projects',
    job_description: 'Senior Software Engineer position...',
    tone: 'professional',
    temperature: 0.7
  })
});

const result = await response.json();
console.log(result.rewritten);

// Batch rewrite
const batchResponse = await fetch('https://your-space-name.hf.space/api/rewrite-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bullets: [
      'Managed team projects',
      'Worked on system improvements'
    ],
    job_description: 'Senior Software Engineer position...',
    tone: 'professional'
  })
});

const batchResult = await batchResponse.json();
batchResult.results.forEach(r => {
  console.log(`Original: ${r.original}`);
  console.log(`Rewritten: ${r.rewritten}\n`);
});
```

### Python

```python
import requests

# Single bullet rewrite
response = requests.post(
    'https://your-space-name.hf.space/api/rewrite',
    json={
        'bullet': 'Managed team projects',
        'job_description': 'Senior Software Engineer position...',
        'tone': 'professional',
        'temperature': 0.7
    }
)

result = response.json()
print(result['rewritten'])

# Batch rewrite
batch_response = requests.post(
    'https://your-space-name.hf.space/api/rewrite-batch',
    json={
        'bullets': [
            'Managed team projects',
            'Worked on system improvements'
        ],
        'job_description': 'Senior Software Engineer position...',
        'tone': 'professional'
    }
)

batch_result = batch_response.json()
for item in batch_result['results']:
    print(f"Original: {item['original']}")
    print(f"Rewritten: {item['rewritten']}\n")
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK`: Request successful
- `422 Unprocessable Entity`: Invalid request parameters
- `500 Internal Server Error`: Server error during processing

Error response format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

## Rate Limits

- The Space supports 2 concurrent requests
- Processing time: 10-30 seconds per bullet point
- Batch requests are processed sequentially

## Notes

- **Cold Start**: First request may take 30-60 seconds as the model loads
- **Privacy**: Data is processed in real-time and not stored
- **Model**: Uses Mistral-7B-Instruct-v0.2 with 4-bit quantization
- **GPU**: Runs on Hugging Face T4 GPU (16GB)

## Interactive Documentation

Once deployed, visit:
- Gradio UI: `https://your-space-name.hf.space/`
- API Docs: `https://your-space-name.hf.space/docs`
- OpenAPI Schema: `https://your-space-name.hf.space/openapi.json`
