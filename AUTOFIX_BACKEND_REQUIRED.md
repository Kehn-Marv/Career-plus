# AutoFix Requires Backend Server

## Issue
The AutoFix button is failing because it requires the **backend server** to be running. The error you're seeing is because the frontend is trying to call the backend API at `http://localhost:8000/api/auto-fix`, but the server is not running.

## Why Backend is Required

The AutoFix feature uses **AI-powered optimization** which runs on the backend:

1. **Content Optimization** - Uses Gemini AI to improve resume content
2. **Grammar Fixes** - Applies grammar and ATS phrasing improvements
3. **Keyword Injection** - Intelligently adds relevant keywords from job description

These operations are too resource-intensive to run in the browser, so they must run on the backend server.

## Solution: Start the Backend Server

### Option 1: Start Backend Manually

Open a new terminal and run:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Use the Start Script (if available)

```bash
cd backend
python start.py
```

### Option 3: Use Docker (if configured)

```bash
docker-compose up backend
```

## Verify Backend is Running

Once started, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

You can also test by visiting: http://localhost:8000/docs

## Backend Requirements

The backend needs:
1. **Python 3.8+** installed
2. **Dependencies** installed: `pip install -r requirements.txt`
3. **Gemini API Key** configured (for AI features)
4. **Environment variables** set in `backend/.env`

### Check Backend .env File

Make sure `backend/.env` has:
```env
GEMINI_API_KEY=your_api_key_here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## What Happens When Backend is Running

When you click "Auto-Fix Resume":

1. **Frontend** → Retrieves analysis data from IndexedDB
2. **Frontend** → Sends data to backend `/api/auto-fix` endpoint
3. **Backend** → Uses Gemini AI to optimize content
4. **Backend** → Applies grammar fixes and keyword injection
5. **Backend** → Returns optimized resume
6. **Frontend** → Generates PDF and saves to IndexedDB
7. **Frontend** → Shows success notification with download button

## Alternative: Fallback Mode (Future Enhancement)

Currently, AutoFix **requires** the backend. In the future, we could add a fallback mode that:
- Uses rule-based optimization (no AI)
- Runs entirely in the browser
- Provides basic fixes without AI enhancement

But for now, the backend must be running for AutoFix to work.

## Troubleshooting

### Error: "Cannot connect to backend server"
- **Cause**: Backend is not running
- **Solution**: Start the backend server (see above)

### Error: "CORS error" or "Access-Control-Allow-Origin"
- **Cause**: Backend CORS settings don't allow frontend origin
- **Solution**: Add `http://localhost:3000` to `CORS_ORIGINS` in backend `.env`

### Error: "API request failed with status 500"
- **Cause**: Backend error (check backend logs)
- **Solution**: Check backend terminal for error details

### Error: "Request timeout"
- **Cause**: AI processing took too long (>2 minutes)
- **Solution**: Try again or check backend logs for issues

### Error: "Gemini API key not configured"
- **Cause**: Missing or invalid Gemini API key
- **Solution**: Set `GEMINI_API_KEY` in backend `.env`

## Quick Start Checklist

- [ ] Backend server is running on port 8000
- [ ] Backend `.env` file has `GEMINI_API_KEY`
- [ ] Backend `.env` file has correct `CORS_ORIGINS`
- [ ] Can access http://localhost:8000/docs
- [ ] Frontend is running on port 3000 or 5173
- [ ] Frontend `.env` has `VITE_API_URL=http://localhost:8000`

## Testing AutoFix

Once backend is running:

1. Navigate to `/analyze`
2. Upload resume and job description
3. Run analysis
4. Click "Auto-Fix Resume" button
5. Watch the 4-step progress:
   - Step 1: Retrieving analysis data (from IndexedDB)
   - Step 2: Optimizing resume content (calls backend AI)
   - Step 3: Generating PDF (in browser)
   - Step 4: Saving results (to IndexedDB)
6. Download the optimized PDF

## Expected Processing Time

- **Step 1**: ~1-2 seconds (local database)
- **Step 2**: ~30-60 seconds (AI processing on backend)
- **Step 3**: ~5-10 seconds (PDF generation)
- **Step 4**: ~1-2 seconds (save to database)

**Total**: ~40-75 seconds

## Backend API Endpoint Details

**Endpoint**: `POST /api/auto-fix`

**Request**:
```json
{
  "resume_json": { ... },
  "ats_issues": [ ... ],
  "recommendations": [ ... ],
  "job_description": "...",
  "options": {
    "includeGrammarFixes": true,
    "includeKeywordOptimization": true,
    "aggressiveness": "moderate",
    "preserveTone": true
  }
}
```

**Response**:
```json
{
  "optimized_resume": { ... },
  "applied_fixes": ["Content optimization", "Grammar fixes", "Keyword injection"],
  "improvement_metrics": {
    "ats_score_improvement": 15,
    "keywords_added": 8,
    "grammar_fixes_applied": 12,
    "content_enhancements": 5
  },
  "processing_time": 45.2
}
```

## Summary

**The AutoFix button requires the backend server to be running.** Start the backend with:

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

Then try clicking the AutoFix button again. It should work!
