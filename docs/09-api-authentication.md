# API Authentication

Authentication and security documentation for Career+ API.

## 🔐 Authentication Overview

### Current Status (MVP)
- **No authentication required**
- Rate limiting by IP address
- Suitable for development and testing

### Future Implementation
- OAuth 2.0 for social login
- JWT tokens for session management
- API keys for programmatic access

---

## 🚀 Future Authentication Flow

### 1. User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

### 2. User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### 3. OAuth Login

```http
GET /api/auth/google
GET /api/auth/github
```

### 4. Token Refresh

```http
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

### 5. Authenticated Requests

```http
GET /api/resumes
Authorization: Bearer {access_token}
```

---

## 🔑 API Keys (Future)

### Generate API Key

```http
POST /api/keys
Authorization: Bearer {access_token}

{
  "name": "My Integration",
  "scopes": ["read:resumes", "write:resumes"]
}
```

### Use API Key

```http
GET /api/resumes
X-API-Key: sk_live_abc123...
```

---

## 🛡️ Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Security
- Access tokens expire in 1 hour
- Refresh tokens expire in 30 days
- Tokens stored securely (httpOnly cookies)
- HTTPS required in production

### Rate Limiting
- 10 requests per minute (unauthenticated)
- 100 requests per minute (authenticated)
- 1000 requests per minute (premium)

---

**Next**: [User Flows](./10-user-flows.md)
