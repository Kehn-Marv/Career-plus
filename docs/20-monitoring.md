# Monitoring & Logging

System monitoring and observability for Career+ platform.

## 📊 Monitoring Stack

### Tools
- **Sentry**: Error tracking
- **DataDog**: Metrics and APM
- **LogRocket**: Session replay
- **Google Analytics**: User analytics

---

## 🔍 Error Tracking (Sentry)

### Frontend Setup
```typescript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENV,
  tracesSampleRate: 1.0,
})
```

### Backend Setup
```python
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT"),
    traces_sample_rate=1.0,
)
```

---

## 📈 Metrics (DataDog)

### Key Metrics
- API response times
- Error rates
- User activity
- AI model performance
- Database queries

### Custom Metrics
```python
from datadog import statsd

statsd.increment('resume.uploaded')
statsd.histogram('api.response_time', response_time)
statsd.gauge('active_users', user_count)
```

---

## 📝 Logging

### Log Levels
- **DEBUG**: Detailed information
- **INFO**: General information
- **WARNING**: Warning messages
- **ERROR**: Error messages
- **CRITICAL**: Critical issues

### Backend Logging
```python
import logging

logger = logging.getLogger(__name__)

logger.info("Resume uploaded", extra={"user_id": user_id})
logger.error("AI service failed", exc_info=True)
```

### Frontend Logging
```typescript
console.log('[INFO]', 'User action')
console.error('[ERROR]', error)
```

---

## 🚨 Alerts

### Alert Rules
- Error rate > 5%
- Response time > 5s (P95)
- Uptime < 99.9%
- AI service failures > 20%

### Notification Channels
- Email
- Slack
- PagerDuty

---

**Next**: [Launch Roadmap](./21-launch-roadmap.md)
