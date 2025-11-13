# AI Gateway Architecture

Complete AI integration and fallback system for Career+.

## 📋 Complete Documentation

For the complete AI Gateway architecture, see:
- [AI_GATEWAY_ARCHITECTURE.md](../AI_GATEWAY_ARCHITECTURE.md) - Full system documentation

## 🎯 Overview

The AI Gateway provides a unified interface for all AI operations with automatic fallback logic.

```
Frontend → Backend → AI Gateway → Ollama/Gemini
```

## 🔄 Fallback Strategy

### Primary: AI Gateway (ngrok)
- Remote Ollama server
- Public HTTPS endpoint
- Best for production

### Fallback 1: Local Ollama
- localhost:11434
- Works offline
- Requires local installation

### Fallback 2: Rule-Based
- No AI required
- Always available
- Limited functionality

## 🤖 AI Models Used

### llama3.1:8b
- **Purpose**: AI Insights Generation
- **Response Time**: 10-15 seconds
- **Context Window**: 8K tokens
- **Quality**: High

### gemma3:4b
- **Purpose**: Bullet Rewriting
- **Response Time**: 8-12 seconds
- **Context Window**: 4K tokens
- **Quality**: Good, faster

### all-MiniLM-L6-v2
- **Purpose**: Text Embeddings
- **Response Time**: < 1 second
- **Runs**: Client-side (browser)

## 🔧 Configuration

### Backend .env
```env
# AI Gateway (Primary)
AI_GATEWAY_URL=https://your-gateway.ngrok-free.app
AI_GATEWAY_ENDPOINT=/api/chat

# AI Models
AI_MODEL_INSIGHTS=llama3.1:8b
AI_MODEL_REWRITER=gemma3:4b

# Ollama (Fallback)
OLLAMA_BASE_URL=http://localhost:11434

# Google Gemini (Fallback)
GOOGLE_API_KEY=your-api-key-here
```

## 📊 Performance

| Operation | Model | Time | Tokens |
|-----------|-------|------|--------|
| Insights | llama3.1:8b | 10-15s | ~2K |
| Rewriting | gemma3:4b | 8-12s | ~1K |
| Chat | llama3.1:8b | 5-10s | ~1K |
| Embeddings | MiniLM | <1s | N/A |

## 🛠️ Usage Example

```python
from app.ai.ai_gateway_client import AIGatewayClient

client = AIGatewayClient()

# Generate insights
insights = await client.generate(
    prompt="Analyze this resume...",
    model="llama3.1:8b"
)

# Rewrite bullets
rewritten = await client.generate(
    prompt="Rewrite these bullets...",
    model="gemma3:4b"
)
```

## 🔒 Security

- HTTPS required
- Rate limiting enabled
- No data persistence
- Timeout protection

## 📈 Cost Analysis

### Before (Separate Ollama per deployment)
- $50-100/month per instance
- Multiple deployments = $150-300/month

### After (Shared AI Gateway)
- $50-100/month for one AI server
- Multiple app servers: $10-20/month each
- **Total savings: 40-50%**

---

**Status**: ✅ Complete and Production Ready

For full architecture details, see [AI_GATEWAY_ARCHITECTURE.md](../AI_GATEWAY_ARCHITECTURE.md)
