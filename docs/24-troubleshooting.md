# Troubleshooting

Common issues and solutions for Career+ platform.

## 🔧 Installation Issues

### Python Version Error
**Problem**: `Python 3.9+ required`

**Solution**:
```bash
# Check version
python --version

# Install Python 3.9+
# Download from python.org
```

### Node Modules Error
**Problem**: `Cannot find module`

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Virtual Environment Issues
**Problem**: Cannot activate venv

**Solution**:
```bash
# Windows PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate
venv\Scripts\Activate.ps1
```

---

## 🚀 Runtime Issues

### Port Already in Use
**Problem**: `Address already in use`

**Solution**:
```bash
# Find process
# Windows
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :8000

# Kill process
kill -9 <PID>
```

### CORS Errors
**Problem**: CORS policy blocking requests

**Solution**:
1. Check backend is running on port 8000
2. Check frontend is running on port 5173
3. Verify CORS_ORIGINS in backend/.env

### AI Features Not Working
**Problem**: AI insights/AutoFix failing

**Solution**:
1. Check Ollama is running: `ollama list`
2. Verify AI_GATEWAY_URL in .env
3. Check backend logs
4. Try Gemini fallback (add API key)

---

## 📁 File Upload Issues

### File Too Large
**Problem**: File upload fails

**Solution**: Reduce file size to under 10MB

### Unsupported Format
**Problem**: File format not supported

**Solution**: Convert to PDF, DOCX, or TXT

### Parsing Fails
**Problem**: Cannot extract text

**Solution**:
1. Ensure file is not corrupted
2. Try different format
3. Check file has actual text (not just images)

---

## 💾 Database Issues

### IndexedDB Quota Exceeded
**Problem**: Storage quota exceeded

**Solution**:
```typescript
// Clear old data
await db.resumes.where('lastModified')
  .below(Date.now() - 90 * 24 * 60 * 60 * 1000)
  .delete()
```

### Data Not Persisting
**Problem**: Data lost on refresh

**Solution**:
1. Check browser supports IndexedDB
2. Check not in incognito mode
3. Clear browser cache and retry

---

## 🐛 Common Errors

### "Network Error"
**Cause**: Backend not running

**Solution**: Start backend server

### "Timeout Error"
**Cause**: AI request taking too long

**Solution**: Wait or retry

### "Rate Limit Exceeded"
**Cause**: Too many requests

**Solution**: Wait 60 seconds

---

## 📞 Getting Help

- 📖 Documentation: [docs/](.)
- 🐛 GitHub Issues
- 💬 Discussions
- 📧 support@careerplus.ai

---

**Next**: [FAQ](./25-faq.md)
