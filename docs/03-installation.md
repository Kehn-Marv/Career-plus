# Installation Guide

Complete installation instructions for Career+ platform.

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Broadband connection for AI features

### Software Requirements
- **Python**: 3.9 or higher
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher (comes with Node.js)
- **Git**: 2.30 or higher

### Optional Requirements
- **Ollama**: For local AI processing
- **Docker**: For containerized deployment
- **PostgreSQL**: For production database (future)

---

## 🚀 Installation Methods

### Method 1: Standard Installation (Recommended)

#### Step 1: Install Prerequisites

**Python 3.9+**
```bash
# Check Python version
python --version

# If not installed, download from:
# https://www.python.org/downloads/
```

**Node.js 18+**
```bash
# Check Node.js version
node --version

# If not installed, download from:
# https://nodejs.org/
```

**Git**
```bash
# Check Git version
git --version

# If not installed, download from:
# https://git-scm.com/
```

#### Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/career-plus.git

# Navigate to project directory
cd career-plus
```

#### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env file with your settings
# (Use your preferred text editor)
```

**Backend .env Configuration:**
```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# AI Configuration
AI_GATEWAY_URL=https://your-gateway-url.ngrok-free.app
AI_GATEWAY_ENDPOINT=/api/chat
AI_MODEL_INSIGHTS=llama3.1:8b
AI_MODEL_REWRITER=gemma3:4b

# Ollama Configuration (Fallback)
OLLAMA_BASE_URL=http://localhost:11434

# Google Gemini (Fallback)
GOOGLE_API_KEY=your-api-key-here

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Step 4: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file
```

**Frontend .env Configuration:**
```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# AI Gateway (Optional)
VITE_AI_GATEWAY_URL=https://your-gateway-url.ngrok-free.app

# Environment
VITE_ENV=development
```

#### Step 5: Verify Installation

**Test Backend:**
```bash
# From backend directory
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run backend
uvicorn app.main:app --reload --port 8000

# In another terminal, test API
curl http://localhost:8000/health
```

**Test Frontend:**
```bash
# From frontend directory
cd frontend

# Run frontend
npm run dev

# Open browser to http://localhost:5173
```

---

### Method 2: Docker Installation

#### Prerequisites
- Docker Desktop installed
- Docker Compose installed

#### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/career-plus.git
cd career-plus
```

#### Step 2: Build and Run

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

#### Step 3: Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

#### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

### Method 3: Development Installation

For active development with hot-reload and debugging.

#### Additional Tools

```bash
# Install development tools
npm install -g nodemon
pip install black flake8 pytest-watch
```

#### Backend Development Setup

```bash
cd backend

# Install dev dependencies
pip install -r requirements-dev.txt

# Run with auto-reload
uvicorn app.main:app --reload --port 8000

# Or use nodemon for Python
nodemon --exec python -m uvicorn app.main:app --reload
```

#### Frontend Development Setup

```bash
cd frontend

# Install dev dependencies (already included)
npm install

# Run with hot-reload
npm run dev

# Run tests in watch mode
npm test -- --watch
```

---

## 🔧 Optional Components

### Ollama (Local AI)

For local AI processing without external dependencies.

#### Installation

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download

#### Setup Models

```bash
# Pull required models
ollama pull llama3.1:8b
ollama pull gemma3:4b

# Verify installation
ollama list
```

#### Start Ollama Server

```bash
# Start Ollama service
ollama serve

# Test
curl http://localhost:11434/api/tags
```

---

### PostgreSQL (Production Database)

For production deployment with persistent storage.

#### Installation

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql-15
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

#### Setup Database

```bash
# Create database
createdb careerplus

# Create user
psql -c "CREATE USER careerplus WITH PASSWORD 'your-password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE careerplus TO careerplus;"
```

#### Update Backend Configuration

```env
# Add to backend/.env
DATABASE_URL=postgresql://careerplus:your-password@localhost:5432/careerplus
```

---

## 🧪 Verification & Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ChatInterface.test.tsx

# Run in watch mode
npm test -- --watch
```

### Integration Tests

```bash
# Start both backend and frontend
# Then run integration tests

cd backend
pytest tests/integration/
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Python version mismatch

```bash
# Check Python version
python --version

# Use specific Python version
python3.9 -m venv venv
```

#### Issue: Node modules not found

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Port already in use

```bash
# Find process using port
# Windows
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :8000

# Kill process
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

#### Issue: Virtual environment not activating

```bash
# Windows - use PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate
venv\Scripts\Activate.ps1
```

#### Issue: CORS errors

Check that:
1. Backend is running on port 8000
2. Frontend is running on port 5173
3. CORS_ORIGINS in backend/.env includes frontend URL

#### Issue: AI features not working

1. Check Ollama is running: `ollama list`
2. Verify AI Gateway URL in .env
3. Check backend logs for errors
4. Try Gemini fallback with API key

---

## 🔄 Updating

### Update Backend

```bash
cd backend
git pull origin main
pip install -r requirements.txt --upgrade
```

### Update Frontend

```bash
cd frontend
git pull origin main
npm install
```

### Database Migrations (Future)

```bash
cd backend
alembic upgrade head
```

---

## 🗑️ Uninstallation

### Remove Application

```bash
# Remove project directory
rm -rf career-plus

# Remove virtual environment
rm -rf backend/venv
```

### Remove Dependencies

```bash
# Remove Node modules
cd frontend
rm -rf node_modules

# Remove Python packages
pip uninstall -r requirements.txt -y
```

### Remove Optional Components

```bash
# Uninstall Ollama
# macOS
brew uninstall ollama

# Remove PostgreSQL
brew uninstall postgresql@15
```

---

## 📚 Next Steps

After installation:

1. ✅ Read [Quick Start Guide](./02-quick-start.md)
2. ✅ Explore [Development Guide](./16-development-guide.md)
3. ✅ Check [API Reference](./08-api-reference.md)
4. ✅ Review [Architecture](./04-architecture.md)

---

## 🆘 Getting Help

- 📖 Documentation: [docs/](.)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/career-plus/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/career-plus/discussions)
- 📧 Email: support@careerplus.ai

---

**Installation complete!** 🎉 You're ready to start using Career+.
