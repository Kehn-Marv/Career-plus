# Quick Start Guide

Get Career+ up and running in 5 minutes!

## ⚡ Prerequisites

Before you begin, make sure you have:

- ✅ **Python 3.9+** - [Download](https://www.python.org/downloads/)
- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **Git** - [Download](https://git-scm.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/career-plus.git
cd career-plus
```

### 2. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### 3. Frontend Setup (2 minutes)

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 4. Start the Application (1 minute)

**Open two terminal windows:**

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

## 🎯 First Steps

### 1. Upload a Resume

1. Click **"Upload Resume"** on the homepage
2. Drag & drop or browse for your resume (PDF, DOCX, or TXT)
3. Wait 5-10 seconds for analysis

### 2. Review Your Score

- **ATS Score**: How well your resume performs with Applicant Tracking Systems
- **Keyword Match**: Percentage of important keywords found
- **Bias Score**: Potential bias issues detected
- **Sections**: Resume sections identified

### 3. Try Key Features

#### 🔧 AutoFix
- Click **"AutoFix"** button
- Review AI-improved bullets
- Accept or skip suggestions
- See your score improve!

#### 🎯 Bias Detection
- Click **"Check for Bias"**
- Review detected issues
- Apply suggested fixes
- Make your resume more inclusive

#### 🌍 Regional Localization
- Click a region button (US, UK, EU, APAC)
- Review region-specific advice
- Adapt your resume for target market

#### 💬 AI Chat
- Click **"Chat"** button
- Ask questions about your resume
- Get personalized career advice

## 🛠️ Configuration (Optional)

### Backend Environment Variables

Edit `backend/.env`:

```env
# AI Gateway (optional - uses local Ollama by default)
AI_GATEWAY_URL=https://your-gateway-url.ngrok-free.app
AI_GATEWAY_ENDPOINT=/api/chat

# AI Models
AI_MODEL_INSIGHTS=llama3.1:8b
AI_MODEL_REWRITER=gemma3:4b

# Ollama (fallback)
OLLAMA_BASE_URL=http://localhost:11434

# Google Gemini (fallback)
GOOGLE_API_KEY=your-api-key-here
```

### Frontend Environment Variables

Edit `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# AI Gateway (optional)
VITE_AI_GATEWAY_URL=https://your-gateway-url.ngrok-free.app
```

## 🧪 Verify Installation

### Test Backend

```bash
# Check API health
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy"}
```

### Test Frontend

1. Open http://localhost:5173
2. You should see the Career+ landing page
3. Try uploading a sample resume

## 🐛 Troubleshooting

### Backend won't start

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Make sure virtual environment is activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Frontend won't start

**Problem**: `Error: Cannot find module`

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

**Problem**: `Address already in use`

**Solution**:
```bash
# Backend - use different port
uvicorn app.main:app --reload --port 8001

# Frontend - use different port
npm run dev -- --port 5174
```

### AI features not working

**Problem**: AI insights or AutoFix failing

**Solution**:
1. Check if Ollama is installed and running
2. Verify AI Gateway URL in `.env`
3. Check backend logs for errors
4. Try using Gemini fallback (add API key to `.env`)

## 📚 Next Steps

Now that you're up and running:

1. 📖 Read the [Project Overview](./01-project-overview.md)
2. 🏗️ Explore the [Architecture](./04-architecture.md)
3. 📡 Check out the [API Reference](./08-api-reference.md)
4. 👨‍💻 See the [Development Guide](./16-development-guide.md)

## 💡 Tips

- **Save time**: Keep both terminals running during development
- **Hot reload**: Frontend auto-reloads on file changes
- **API docs**: Use http://localhost:8000/docs to test API endpoints
- **DevTools**: Use browser DevTools to debug frontend issues
- **Logs**: Check terminal output for errors and warnings

## 🆘 Need Help?

- 📖 **Documentation**: [docs/](.)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/career-plus/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/career-plus/discussions)
- 📧 **Email**: support@careerplus.ai

---

**Ready to dive deeper?** Check out the [Installation Guide](./03-installation.md) for advanced setup options.
