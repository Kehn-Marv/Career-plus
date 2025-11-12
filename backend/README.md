# Career+ Backend API

FastAPI backend for Career+ resume analysis and optimization platform.

## Features

- **Bias Detection** - Identify and suggest alternatives for biased language
- **Localization** - Region-specific resume formatting advice (US, UK, EU, APAC)
- **Batch Rewriting** - AI-powered resume bullet improvements (placeholder for Task 11)
- **Rate Limiting** - Prevent API abuse (10 requests/minute per IP)

## Setup

### Prerequisites

- Python 3.9+
- pip

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings.

### Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### POST /api/analyze-bias

Analyze text for biased language.

**Request:**
```json
{
  "text": "Looking for a young, energetic salesman..."
}
```

**Response:**
```json
{
  "biased_phrases": [
    {
      "original": "young",
      "suggestion": "energetic",
      "reason": "Avoid age references",
      "category": "age"
    },
    {
      "original": "salesman",
      "suggestion": "salesperson",
      "reason": "Use gender-neutral job titles",
      "category": "gender"
    }
  ],
  "bias_score": 15.5
}
```

### POST /api/localize

Get localization advice for target region.

**Request:**
```json
{
  "resume_text": "My CV includes...",
  "target_region": "US"
}
```

**Response:**
```json
{
  "recommendations": [
    "Use 'Resume' instead of 'CV' in US applications"
  ],
  "format_changes": [
    "Do NOT include photo, age, marital status",
    "Use month/day/year date format"
  ],
  "terminology_changes": [
    {
      "from": "CV",
      "to": "Resume",
      "reason": "Use 'Resume' in US resumes"
    }
  ]
}
```

### POST /api/rewrite-batch

Batch rewrite resume bullets (placeholder for Task 11).

**Request:**
```json
{
  "bullets": [
    "Responsible for managing team projects",
    "Worked on improving system performance"
  ],
  "job_description": "Senior Software Engineer role...",
  "tone": "professional"
}
```

**Response:**
```json
{
  "rewritten": [
    {
      "original": "Responsible for managing team projects",
      "improved": "Led cross-functional team projects...",
      "changes": ["Added strong action verb", "Added metrics"]
    }
  ]
}
```

## Rate Limiting

- **10 requests per minute** per IP address
- Returns `429 Too Many Requests` when exceeded
- `Retry-After` header indicates wait time

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── api.py               # API routes
│   ├── models.py            # Pydantic models
│   ├── bias_detection.py    # Bias detection logic
│   ├── localization.py      # Localization advice
│   └── rate_limiter.py      # Rate limiting
├── tests/
│   └── test_api.py
├── requirements.txt
├── .env.example
└── README.md
```

## Development

### Adding New Endpoints

1. Define request/response models in `models.py`
2. Implement logic in separate module
3. Add route in `api.py`
4. Add tests in `tests/`

### Rate Limiting

Adjust rate limits in `api.py`:

```python
@rate_limit(max_requests=20, window_seconds=60)
async def my_endpoint(request: Request):
    ...
```

## Deployment

See main project README for deployment instructions.

## License

MIT
