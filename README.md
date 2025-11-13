<div align="center">

<img src="./screenshot/logo.png" alt="Career+ Logo" width="200"/>

# Career+

### AI-Powered Career Co-Pilot for Resume Optimization

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18.2+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.2+-3178C6.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code Style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 What is Career+?

Career+ is an intelligent resume optimization platform that combines **AI-powered analysis**, **ATS optimization**, **bias detection**, and **regional localization** to help job seekers create resumes that stand out. Built with privacy-first principles, Career+ processes everything locally with no data storage on servers.

### Why Career+?

- 🤖 **AI-Powered Insights** - Get personalized recommendations from advanced language models
- 📊 **ATS Optimization** - Ensure your resume passes Applicant Tracking Systems
- 🎯 **Bias Detection** - Remove unconscious bias from your resume language
- 🌍 **Multi-Region Support** - Adapt your resume for US, UK, EU, and APAC markets
- 🔒 **Privacy-First** - All processing happens locally, no data stored on servers
- ♿ **Accessible** - WCAG 2.1 AA compliant for all users
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile

---

## ✨ Features

### 🔍 Smart Resume Analysis
- **ATS Scoring**: Get a detailed score showing how well your resume performs with Applicant Tracking Systems
- **Keyword Matching**: Identify missing keywords from job descriptions
- **Section Detection**: Ensure all critical resume sections are present
- **Skill Gap Analysis**: Discover skills you should highlight or acquire

### 🤖 AI-Powered Enhancement
- **AutoFix Bullet Rewriting**: AI rewrites your resume bullets for maximum impact
- **Batch Processing**: Improve multiple bullets simultaneously
- **Before/After Comparison**: See exactly what changed and why
- **Accept/Skip Workflow**: Full control over AI suggestions

### 🎨 Bias Detection & Removal
- **Comprehensive Scanning**: Detects age, gender, race, and disability bias
- **Smart Suggestions**: Provides neutral alternatives for biased language
- **Category Filtering**: Focus on specific types of bias
- **One-Click Fixes**: Apply suggestions instantly

### 🌍 Regional Localization
- **Multi-Region Support**: US, UK, EU, and APAC formatting
- **Cultural Adaptation**: Region-specific terminology and conventions
- **Format Guidelines**: Date formats, section ordering, and more
- **Terminology Mapping**: Automatic term conversion (CV → Resume, etc.)

### 📄 Template Gallery
- **Professional Templates**: ATS-optimized resume designs
- **Live Preview**: See your resume in different formats
- **Comparison Mode**: Compare templates side-by-side
- **One-Click Export**: Generate PDF instantly

### 🕐 Version History
- **Automatic Versioning**: Every change is saved automatically
- **Timeline View**: Visual history of all changes
- **Easy Restore**: Roll back to any previous version
- **Export Any Version**: Download any historical version

### 💬 AI Chat Assistant
- **Contextual Help**: Ask questions about your resume
- **Career Advice**: Get personalized recommendations
- **Real-time Feedback**: Instant answers to your questions
- **Multi-turn Conversations**: Natural dialogue flow

---

## 🎬 Demo

> **Live Demo**: [Coming Soon]

### Screenshots

<div align="center">
<img src="./screenshot/demo-1.png" alt="Resume Analysis Dashboard" width="800"/>
<p><em>AI-powered resume analysis with ATS scoring and insights</em></p>
</div>

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/career-plus.git
cd career-plus
```

#### 2. Backend Setup

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

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# (Optional: Add your AI Gateway URL)
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

#### 4. Start the Application

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

#### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) directory:

### Getting Started
- [📖 Project Overview](./docs/01-project-overview.md) - Comprehensive project introduction
- [⚡ Quick Start Guide](./docs/02-quick-start.md) - Get up and running quickly
- [🔧 Installation Guide](./docs/03-installation.md) - Detailed setup instructions

### Architecture & Design
- [🏗️ System Architecture](./docs/04-architecture.md) - Platform architecture overview
- [📐 Architecture Layers](./docs/05-architecture-layers.md) - Detailed layer breakdown
- [🤖 AI Gateway Architecture](./docs/06-ai-gateway.md) - AI integration system
- [💾 Data Models](./docs/07-data-models.md) - Database schemas and AI models

### API & Development
- [📡 API Reference](./docs/08-api-reference.md) - Complete API documentation
- [🔐 API Authentication](./docs/09-api-authentication.md) - Security and auth
- [👨‍💻 Development Guide](./docs/16-development-guide.md) - Development workflow
- [🧪 Testing Strategy](./docs/17-testing-strategy.md) - Testing guidelines

### User Experience
- [🎨 Design System](./docs/13-design-system.md) - UI/UX guidelines
- [♿ Accessibility](./docs/14-accessibility.md) - WCAG 2.1 AA compliance
- [🌍 Localization](./docs/15-localization.md) - Multi-region support
- [👤 User Flows](./docs/10-user-flows.md) - User journey mappings
- [📱 UI Wireframes](./docs/12-ui-wireframes.md) - Screen designs

### Deployment & Operations
- [🚀 Deployment Guide](./docs/18-deployment.md) - Production deployment
- [📊 Metrics & Constraints](./docs/19-metrics-constraints.md) - Performance metrics
- [📈 Monitoring](./docs/20-monitoring.md) - System monitoring

### Product & Strategy
- [🗺️ Launch Roadmap](./docs/21-launch-roadmap.md) - Product roadmap
- [📢 Go-to-Market Strategy](./docs/22-gtm-strategy.md) - GTM plan
- [✨ Feature Specifications](./docs/23-feature-specs.md) - Feature details

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: IndexedDB (Dexie.js)
- **Routing**: React Router v6
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer
- **AI**: Transformers.js

### Backend
- **Framework**: FastAPI (Python)
- **AI Models**: 
  - Ollama (llama3.1:8b for insights)
  - Ollama (gemma3:4b for rewriting)
  - Google Gemini (fallback)
- **Document Parsing**: PyMuPDF, python-docx, pdfminer.six
- **Embeddings**: sentence-transformers
- **API Docs**: OpenAPI/Swagger

### Infrastructure
- **AI Gateway**: ngrok tunnel to local Ollama
- **Rate Limiting**: 10 requests/minute per IP
- **CORS**: Configured for local development

---

## 📁 Project Structure

```
career-plus/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── api.py          # API routes
│   │   ├── models.py       # Pydantic models
│   │   ├── services/       # Business logic
│   │   └── ai/             # AI integration
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Core libraries
│   │   ├── store/          # Zustand stores
│   │   └── hooks/          # Custom hooks
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── .env.example        # Environment template
│
├── docs/                   # Documentation
│   ├── 01-project-overview.md
│   ├── 04-architecture.md
│   ├── 08-api-reference.md
│   └── ...
│
├── screenshot/             # Screenshots and assets
│   └── logo.png
│
└── README.md              # This file
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_api.py
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist/` directory to Vercel, Netlify, or any static hosting service.

### Backend Deployment (Docker)

```bash
cd backend

# Build Docker image
docker build -t career-plus-backend .

# Run container
docker run -p 8000:8000 career-plus-backend
```

For detailed deployment instructions, see [Deployment Guide](./docs/18-deployment.md).

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/26-contributing.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8, use Black formatter
- **TypeScript**: Follow ESLint rules, use Prettier
- **Commits**: Use conventional commits format

---

## 📊 Performance

- **Frontend Load Time**: < 3s
- **API Response Time**: < 500ms
- **AI Insights Generation**: < 15s
- **Bullet Rewriting**: < 30s (batch of 3)
- **ATS Analysis**: < 2s

---

## 🔒 Security

- **Rate Limiting**: 10 requests/minute per IP
- **Input Validation**: All inputs validated and sanitized
- **CORS**: Configured for security
- **No Data Storage**: Privacy-first approach (MVP)
- **HTTPS**: Required in production

Report security vulnerabilities to: security@careerplus.ai

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ollama** - Local AI model hosting
- **FastAPI** - Modern Python web framework
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Transformers.js** - Client-side AI
- **All Contributors** - Thank you!

---

## 📞 Support

- **Documentation**: [docs/](./docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/career-plus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/career-plus/discussions)
- **Email**: support@careerplus.ai

---

## 🗺️ Roadmap

### ✅ Completed (v0.1.0)
- Resume parsing (PDF, DOCX, TXT)
- ATS scoring and analysis
- AI-powered insights
- AutoFix bullet rewriting
- Bias detection
- Regional localization
- Template gallery
- Version history
- AI chat assistant
- Accessibility compliance

### 🚧 In Progress (v0.2.0)
- Cloud deployment
- User authentication
- Team collaboration
- Advanced analytics

### 📋 Planned (v0.3.0+)
- Mobile app (iOS/Android)
- LinkedIn integration
- Cover letter generation
- Interview preparation
- Job matching algorithm
- Premium features

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/career-plus?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/career-plus?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/yourusername/career-plus?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/career-plus)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/career-plus)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/career-plus)

---

<div align="center">

**Made with ❤️ by the Career+ Team**

[Website](https://careerplus.ai) • [Twitter](https://twitter.com/careerplusai) • [LinkedIn](https://linkedin.com/company/careerplus)

</div>
