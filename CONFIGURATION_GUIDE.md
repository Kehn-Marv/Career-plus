# Career+ Configuration Guide

This guide explains all environment variables required to run Career+ and how to configure them properly.

## Table of Contents

- [Quick Start](#quick-start)
- [Frontend Configuration](#frontend-configuration)
- [Backend Configuration](#backend-configuration)
- [Configuration Validation](#configuration-validation)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:

```env
# REQUIRED: Get your Gemini API key from https://ai.google.dev/
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Frontend Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` and set:

```env
# REQUIRED: Backend API URL
VITE_API_URL=http://localhost:8000

# REQUIRED for AI features: Your Ollama/ngrok URL
VITE_AI_GATEWAY_URL=https://your-ngrok-url.ngrok-free.dev
```

### 3. Start the Application

```bash
# Terminal 1: Start backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
```

## Frontend Configuration

### Required Variables

#### `VITE_API_URL`
- **Description**: URL where the Career+ backend API is running
- **Required**: Yes
- **Default**: `http://localhost:8000`
- **Example**: `http://localhost:8000` (development), `https://api.careerplus.com` (production)
- **Validation**: Must be a valid URL

#### `VITE_AI_GATEWAY_URL`
- **Description**: Ollama AI Gateway URL for AI-powered semantic analysis
- **Required**: Yes (for AI features)
- **Default**: None
- **Example**: `https://your-ngrok-url.ngrok-free.dev`
- **Validation**: Must be a valid URL when AI features are enabled
- **Notes**: 
  - Leave empty to disable AI features and use rule-based analysis only
  - Use ngrok or similar service to expose your local Ollama instance
  - See [AI Gateway Setup](#ai-gateway-setup) for details

### AI Gateway Configuration

#### `VITE_AI_GATEWAY_MODEL`
- **Description**: The Ollama model to use for AI analysis
- **Required**: No
- **Default**: `gemma3:4b`
- **Options**: `gemma3:4b`, `llama2`, `mistral`, etc.
- **Notes**: Must be installed in your Ollama instance

#### `VITE_AI_GATEWAY_TIMEOUT`
- **Description**: Maximum time to wait for AI Gateway responses (milliseconds)
- **Required**: No
- **Default**: `720000` (12 minutes)
- **Notes**: Increase if you experience timeout errors with large resumes

#### `VITE_AI_GATEWAY_QUEUE_DELAY`
- **Description**: Delay between consecutive AI requests (milliseconds)
- **Required**: No
- **Default**: `3000` (3 seconds)
- **Notes**: Increase if you hit rate limits on your AI Gateway

#### `VITE_ENABLE_AI_FEATURES`
- **Description**: Enable or disable AI-powered features
- **Required**: No
- **Default**: `true`
- **Options**: `true`, `false`
- **Notes**: Set to `false` to use rule-based analysis only

#### `VITE_FALLBACK_TO_RULES`
- **Description**: Fallback to rule-based analysis when AI unavailable
- **Required**: No
- **Default**: `true`
- **Options**: `true`, `false`
- **Notes**: If `false`, analysis will fail when AI services are down

### Optional Variables

#### `VITE_HF_SPACE_URL`
- **Description**: Hugging Face Space URL for resume bullet rewriting
- **Required**: No
- **Default**: None
- **Example**: `https://your-username-career-plus-rewriter.hf.space`
- **Notes**: Leave empty if not using Hugging Face Space

#### `VITE_HF_TOKEN`
- **Description**: Hugging Face API token
- **Required**: No
- **Default**: None
- **Notes**: Used as fallback if Hugging Face Space is unavailable

## Backend Configuration

### Required Variables

#### `GEMINI_API_KEY`
- **Description**: Google Gemini API key for AI generation
- **Required**: Yes
- **Default**: None
- **How to get**: Visit https://ai.google.dev/ and create an API key
- **Validation**: 
  - Cannot be empty
  - Cannot be the placeholder value `your_gemini_api_key_here`
  - Must be at least 20 characters long
- **Notes**: This is the most critical configuration for AI features

#### `GEMINI_MODEL`
- **Description**: The Gemini model to use for AI generation
- **Required**: No
- **Default**: `gemini-2.5-flash-lite`
- **Options**: 
  - `gemini-2.5-flash-lite` (recommended: fast and cost-effective)
  - `gemini-1.5-pro` (more capable but slower)
  - `gemini-1.5-flash` (balanced)
- **Notes**: Different models have different pricing and capabilities

### API Configuration

#### `CORS_ORIGINS`
- **Description**: Comma-separated list of allowed CORS origins
- **Required**: No
- **Default**: `http://localhost:3000,http://localhost:5173`
- **Example**: `http://localhost:5173,https://app.careerplus.com`
- **Notes**: Add your frontend URLs here

### Rate Limiting

#### `RATE_LIMIT_ENABLED`
- **Description**: Enable or disable rate limiting
- **Required**: No
- **Default**: `true`
- **Options**: `true`, `false`
- **Notes**: Recommended to keep enabled in production

#### `MAX_REQUESTS_PER_MINUTE`
- **Description**: Maximum requests per minute per IP address
- **Required**: No
- **Default**: `10`
- **Validation**: Must be a positive number
- **Notes**: Adjust based on your API usage patterns and quotas

### Optional Variables

#### `HF_TOKEN`
- **Description**: Hugging Face API token
- **Required**: No
- **Default**: None
- **How to get**: Visit https://huggingface.co/settings/tokens
- **Notes**: Used for embeddings and additional AI features

#### `HF_EMBEDDING_MODEL`
- **Description**: Hugging Face model for text embeddings
- **Required**: No
- **Default**: `sentence-transformers/all-mpnet-base-v2`

#### `HF_GENERATION_MODEL`
- **Description**: Hugging Face model for text generation
- **Required**: No
- **Default**: `mistralai/Mistral-7B-Instruct-v0.2`

## Configuration Validation

Both frontend and backend validate configuration on startup.

### Backend Validation

The backend validates configuration when it starts:

```
✓ Backend Configuration:
   - Gemini Model: gemini-2.5-flash-lite
   - Gemini API Key: ✓ Set
   - HF Token: ✗ Not set
   - Rate Limiting: Enabled
   - Max Requests/Min: 10
   - CORS Origins: http://localhost:3000,http://localhost:5173
```

If validation fails, the backend will exit with an error:

```
❌ Configuration Validation Failed:
   - GEMINI_API_KEY is required but not set

Please check your backend/.env file and ensure all required variables are set.
See backend/.env.example for reference.
```

### Frontend Validation

The frontend validates configuration on startup and logs to the browser console:

```
✓ Frontend Configuration:
   - API URL: http://localhost:8000
   - AI Gateway URL: https://your-ngrok-url.ngrok-free.dev
   - AI Gateway Model: gemma3:4b
   - AI Features: Enabled
   - Fallback to Rules: Yes
   - HF Space URL: ✗ Not set
   - HF Token: ✗ Not set
```

Warnings are logged for optional missing configuration:

```
⚠️  Configuration Warnings:
   - VITE_HF_SPACE_URL is not set. AI rewriting features will be unavailable.
   - VITE_HF_TOKEN is not set. Some AI features may be limited.
```

## AI Gateway Setup

The AI Gateway is an Ollama instance that provides AI-powered analysis capabilities.

### Local Setup with ngrok

1. **Install Ollama**: Visit https://ollama.ai/ and install Ollama

2. **Pull the model**:
   ```bash
   ollama pull gemma3:4b
   ```

3. **Start Ollama** (it usually starts automatically)

4. **Expose with ngrok**:
   ```bash
   ngrok http 11434
   ```

5. **Copy the ngrok URL** (e.g., `https://abc123.ngrok-free.dev`)

6. **Set in frontend/.env**:
   ```env
   VITE_AI_GATEWAY_URL=https://abc123.ngrok-free.dev
   ```

### Remote Setup

If you have Ollama running on a remote server:

1. Ensure Ollama is accessible via HTTP
2. Set the URL in `VITE_AI_GATEWAY_URL`
3. Ensure CORS is properly configured

## Troubleshooting

### Backend won't start

**Error**: `GEMINI_API_KEY is required but not set`

**Solution**: 
1. Check that `backend/.env` exists
2. Ensure `GEMINI_API_KEY` is set to a valid API key
3. Don't use the placeholder value `your_gemini_api_key_here`

### AI features not working

**Symptom**: Analysis shows "Fallback Mode" or AI features unavailable

**Solutions**:

1. **Check AI Gateway URL**:
   - Ensure `VITE_AI_GATEWAY_URL` is set in `frontend/.env`
   - Verify the URL is accessible (try opening it in a browser)
   - Check that Ollama is running

2. **Check Gemini API**:
   - Verify `GEMINI_API_KEY` is set in `backend/.env`
   - Check the backend logs for Gemini API errors
   - Ensure you haven't exceeded your API quota

3. **Check browser console**:
   - Open browser DevTools (F12)
   - Look for configuration validation messages
   - Check for network errors

### CORS errors

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**:
1. Add your frontend URL to `CORS_ORIGINS` in `backend/.env`
2. Restart the backend server
3. Clear browser cache

### Rate limiting errors

**Error**: `429 Too Many Requests`

**Solutions**:
1. Increase `MAX_REQUESTS_PER_MINUTE` in `backend/.env`
2. Increase `VITE_AI_GATEWAY_QUEUE_DELAY` in `frontend/.env`
3. Wait a minute and try again

### Timeout errors

**Error**: `Request timeout` or `AI Gateway timeout`

**Solutions**:
1. Increase `VITE_AI_GATEWAY_TIMEOUT` in `frontend/.env`
2. Check your internet connection
3. Try a smaller resume or job description
4. Check if the AI Gateway is responding slowly

## Environment-Specific Configuration

### Development

```env
# Frontend
VITE_API_URL=http://localhost:8000
VITE_AI_GATEWAY_URL=https://your-ngrok-url.ngrok-free.dev
VITE_ENABLE_AI_FEATURES=true
VITE_FALLBACK_TO_RULES=true

# Backend
GEMINI_API_KEY=your_dev_api_key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_ENABLED=false
```

### Production

```env
# Frontend
VITE_API_URL=https://api.careerplus.com
VITE_AI_GATEWAY_URL=https://ai-gateway.careerplus.com
VITE_ENABLE_AI_FEATURES=true
VITE_FALLBACK_TO_RULES=true

# Backend
GEMINI_API_KEY=your_production_api_key
CORS_ORIGINS=https://app.careerplus.com,https://www.careerplus.com
RATE_LIMIT_ENABLED=true
MAX_REQUESTS_PER_MINUTE=20
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys** regularly
4. **Enable rate limiting** in production
5. **Use HTTPS** for all production URLs
6. **Restrict CORS origins** to only your frontend domains
7. **Monitor API usage** to detect unusual patterns

## Getting Help

If you're still having issues:

1. Check the configuration validation output in console/logs
2. Review the [troubleshooting section](#troubleshooting)
3. Ensure all required environment variables are set
4. Verify API keys are valid and not expired
5. Check that all services (backend, AI Gateway) are running
