# Deployment Guide

Production deployment instructions for Career+ platform.

## 🚀 Deployment Options

### Option 1: Vercel + Cloud Run (Recommended)
- Frontend: Vercel
- Backend: Google Cloud Run
- Best for: MVP and small scale

### Option 2: Netlify + Heroku
- Frontend: Netlify
- Backend: Heroku
- Best for: Quick deployment

### Option 3: Docker + Kubernetes
- Full containerization
- Best for: Large scale

---

## 📦 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository
- Environment variables configured

### Steps

1. **Build for Production**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

3. **Configure Environment Variables**
```
VITE_API_URL=https://your-backend-url.com
VITE_AI_GATEWAY_URL=https://your-ai-gateway.com
```

4. **Custom Domain** (Optional)
- Add domain in Vercel dashboard
- Update DNS records
- Enable HTTPS

---

## 🔧 Backend Deployment (Cloud Run)

### Prerequisites
- Google Cloud account
- gcloud CLI installed
- Docker installed

### Steps

1. **Create Dockerfile**
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

2. **Build and Push**
```bash
# Build image
docker build -t gcr.io/PROJECT_ID/career-plus-backend .

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/career-plus-backend
```

3. **Deploy to Cloud Run**
```bash
gcloud run deploy career-plus-backend \
  --image gcr.io/PROJECT_ID/career-plus-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

4. **Set Environment Variables**
```bash
gcloud run services update career-plus-backend \
  --set-env-vars="AI_GATEWAY_URL=https://...,GOOGLE_API_KEY=..."
```

---

## 🐳 Docker Compose Deployment

### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - AI_GATEWAY_URL=${AI_GATEWAY_URL}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    volumes:
      - ./backend:/app

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=careerplus
      - POSTGRES_USER=careerplus
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy
```bash
docker-compose up -d
```

---

## ☸️ Kubernetes Deployment

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: career-plus-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: career-plus-backend
  template:
    metadata:
      labels:
        app: career-plus-backend
    spec:
      containers:
      - name: backend
        image: gcr.io/PROJECT_ID/career-plus-backend
        ports:
        - containerPort: 8000
        env:
        - name: AI_GATEWAY_URL
          valueFrom:
            secretKeyRef:
              name: career-plus-secrets
              key: ai-gateway-url
```

### Deploy
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

---

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API keys in secrets
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error messages sanitized
- [ ] Logs don't contain sensitive data

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)
```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
})
```

### DataDog (Metrics)
```python
# backend/app/main.py
from ddtrace import tracer

tracer.configure(
    hostname='datadoghq.com',
    port=8126,
)
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: google-github-actions/setup-gcloud@v0
      - run: |
          gcloud run deploy career-plus-backend \
            --image gcr.io/$PROJECT_ID/career-plus-backend
```

---

**Next**: [Metrics & Constraints](./19-metrics-constraints.md)
