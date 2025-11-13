# Backend Configuration Reference

This document provides a comprehensive reference for all backend configuration options.

## Environment Variables

All configuration is managed through environment variables defined in the `.env` file.

### Required Configuration

#### GEMINI_API_KEY
- **Type:** String
- **Required:** Yes
- **Description:** Google Gemini API key for AI-powered features
- **How to get:** Visit https://ai.google.dev/ and create an API key
- **Example:** `GEMINI_API_KEY=AIzaSyD...`
- **Validation:** Must be at least 20 characters long

#### GEMINI_MODEL
- **Type:** String
- **Required:** Yes
- **Default:** `gemini-2.5-flash-lite`
- **Description:** The Gemini model to use for AI generation
- **Options:**
  - `gemini-2.5-flash-lite` - Fast and cost-effective (recommended)
  - `gemini-1.5-pro` - More capable, higher cost
  - `gemini-1.5-flash` - Balanced performance
- **Example:** `GEMINI_MODEL=gemini-2.5-flash-lite`

### API Configuration

#### CORS_ORIGINS
- **Type:** String (comma-separated list)
- **Required:** No
- **Default:** `http://localhost:3000,http://localhost:5173`
- **Description:** Allowed origins for CORS (Cross-Origin Resource Sharing)
- **Example:** `CORS_ORIGINS=http://localhost:3000,https://myapp.com`
- **Note:** Add your frontend URLs here

### Rate Limiting

#### RATE_LIMIT_ENABLED
- **Type:** Boolean
- **Required:** No
- **Default:** `true`
- **Description:** Enable or disable rate limiting
- **Options:** `true`, `false`
- **Example:** `RATE_LIMIT_ENABLED=true`
- **Note:** Recommended to keep enabled in production

#### MAX_REQUESTS_PER_MINUTE
- **Type:** Integer
- **Required:** No
- **Default:** `10`
- **Description:** Maximum API requests allowed per minute per IP
- **Example:** `MAX_REQUESTS_PER_MINUTE=10`
- **Validation:** Must be a positive number
- **Note:** Adjust based on your API quotas and usage patterns

### PDF Generation Configuration

#### WEASYPRINT_CACHE_DIR
- **Type:** String (path)
- **Required:** No
- **Default:** `./cache/weasyprint`
- **Description:** Directory for caching WeasyPrint resources
- **Example:** `WEASYPRINT_CACHE_DIR=./cache/weasyprint`
- **Note:** Directory is created automatically if it doesn't exist

#### TEMPLATE_DIR
- **Type:** String (path)
- **Required:** No
- **Default:** `./app/templates`
- **Description:** Directory containing resume templates
- **Example:** `TEMPLATE_DIR=./app/templates`
- **Validation:** Warning if directory doesn't exist

#### MAX_PDF_SIZE_MB
- **Type:** Integer
- **Required:** No
- **Default:** `10`
- **Description:** Maximum allowed size for generated PDF files (in megabytes)
- **Example:** `MAX_PDF_SIZE_MB=10`
- **Validation:** Must be a positive number
- **Note:** Prevents generation of excessively large files

#### PDF_GENERATION_TIMEOUT
- **Type:** Integer
- **Required:** No
- **Default:** `30`
- **Description:** Maximum time allowed for PDF generation (in seconds)
- **Example:** `PDF_GENERATION_TIMEOUT=30`
- **Validation:** Must be a positive number
- **Note:** Prevents long-running PDF generation processes

### Optional Configuration

#### HF_TOKEN
- **Type:** String
- **Required:** No
- **Default:** None
- **Description:** Hugging Face API token for embeddings and additional AI features
- **How to get:** Visit https://huggingface.co/settings/tokens
- **Example:** `HF_TOKEN=hf_...`
- **Note:** Only needed if using Hugging Face features

#### HF_EMBEDDING_MODEL
- **Type:** String
- **Required:** No
- **Default:** `sentence-transformers/all-mpnet-base-v2`
- **Description:** Hugging Face model for text embeddings
- **Example:** `HF_EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2`

#### HF_GENERATION_MODEL
- **Type:** String
- **Required:** No
- **Default:** `mistralai/Mistral-7B-Instruct-v0.2`
- **Description:** Hugging Face model for text generation
- **Example:** `HF_GENERATION_MODEL=mistralai/Mistral-7B-Instruct-v0.2`

## Configuration Validation

The backend validates all configuration on startup. If validation fails, the application will not start.

### Validation Rules

1. **GEMINI_API_KEY** must be set and valid (not placeholder value)
2. **GEMINI_MODEL** cannot be empty
3. **MAX_REQUESTS_PER_MINUTE** must be positive
4. **MAX_PDF_SIZE_MB** must be positive
5. **PDF_GENERATION_TIMEOUT** must be positive

### Warnings

The following conditions generate warnings but don't prevent startup:

1. **CORS_ORIGINS** not set (uses default)
2. **HF_TOKEN** not set (Hugging Face features unavailable)
3. **TEMPLATE_DIR** doesn't exist (PDF generation may fail)

## Configuration Examples

### Development Environment

```env
# Development configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_ENABLED=false
MAX_REQUESTS_PER_MINUTE=100
WEASYPRINT_CACHE_DIR=./cache/weasyprint
TEMPLATE_DIR=./app/templates
MAX_PDF_SIZE_MB=10
PDF_GENERATION_TIMEOUT=30
```

### Production Environment

```env
# Production configuration
GEMINI_API_KEY=your_production_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
CORS_ORIGINS=https://yourapp.com,https://www.yourapp.com
RATE_LIMIT_ENABLED=true
MAX_REQUESTS_PER_MINUTE=10
WEASYPRINT_CACHE_DIR=/var/cache/weasyprint
TEMPLATE_DIR=/app/templates
MAX_PDF_SIZE_MB=10
PDF_GENERATION_TIMEOUT=30
HF_TOKEN=your_hf_token
```

### Docker Environment

```env
# Docker configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
CORS_ORIGINS=http://frontend:3000
RATE_LIMIT_ENABLED=true
MAX_REQUESTS_PER_MINUTE=10
WEASYPRINT_CACHE_DIR=/app/cache/weasyprint
TEMPLATE_DIR=/app/templates
MAX_PDF_SIZE_MB=10
PDF_GENERATION_TIMEOUT=30
```

## Accessing Configuration in Code

### Using the Config Object

```python
from app.config import get_config

config = get_config()

# Access configuration values
api_key = config.gemini_api_key
model = config.gemini_model
cache_dir = config.weasyprint_cache_dir
```

### Validating Configuration

```python
from app.config import validate_config

# Validate on startup (in main.py)
validate_config()
```

### Configuration Summary

The configuration summary is automatically printed on startup:

```
✓ Backend Configuration:
   - Gemini Model: gemini-2.5-flash-lite
   - Gemini API Key: ✓ Set
   - HF Token: ✗ Not set
   - Rate Limiting: Enabled
   - Max Requests/Min: 10
   - CORS Origins: http://localhost:3000,http://localhost:5173

✓ PDF Generation Configuration:
   - Template Directory: ./app/templates
   - Cache Directory: ./cache/weasyprint
   - Max PDF Size: 10MB
   - Generation Timeout: 30s
```

## Troubleshooting

### Configuration Not Loading

**Problem:** Environment variables not being read

**Solutions:**
1. Ensure `.env` file exists in the backend directory
2. Check file is named exactly `.env` (not `.env.txt`)
3. Restart the backend server after changing `.env`
4. Verify no syntax errors in `.env` file

### Validation Errors

**Problem:** "GEMINI_API_KEY is required but not set"

**Solutions:**
1. Copy `.env.example` to `.env`
2. Set a valid Gemini API key
3. Ensure no extra spaces around the `=` sign

**Problem:** "Template directory does not exist"

**Solutions:**
1. Verify `TEMPLATE_DIR` path is correct
2. Ensure templates are in the correct location
3. Check file permissions

### Cache Directory Issues

**Problem:** "Could not create cache directory"

**Solutions:**
1. Check write permissions for the parent directory
2. Manually create the directory: `mkdir -p cache/weasyprint`
3. Use an absolute path in `WEASYPRINT_CACHE_DIR`

## Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use different configs for different environments** - dev, staging, production
3. **Keep API keys secure** - Use secrets management in production
4. **Monitor rate limits** - Adjust based on actual usage
5. **Test configuration changes** - Validate before deploying
6. **Document custom settings** - Add comments in `.env` file
7. **Use absolute paths in production** - Avoid relative paths for reliability

## Security Considerations

1. **API Keys:** Never expose in logs or error messages
2. **CORS Origins:** Only allow trusted domains in production
3. **Rate Limiting:** Always enable in production
4. **File Paths:** Validate and sanitize user-provided paths
5. **Timeouts:** Set reasonable limits to prevent resource exhaustion

## Related Documentation

- [Installation Guide](./INSTALLATION.md) - Complete installation instructions
- [WeasyPrint Setup](./WEASYPRINT_SETUP.md) - PDF generation setup
- [API Documentation](../docs/08-api-reference.md) - API endpoints and usage
- [Environment Variables](./.env.example) - Example configuration file

