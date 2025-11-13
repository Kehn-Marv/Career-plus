# Feature Specifications

Detailed specifications for all Career+ features.

## ✨ Core Features

### 1. Resume Upload & Parsing
**Status**: ✅ Complete

**Supported Formats**:
- PDF (via pdfjs-dist)
- DOCX (via mammoth)
- TXT (direct read)

**Max File Size**: 10MB

**Parsing Capabilities**:
- Contact information extraction
- Section identification
- Date parsing
- Skill extraction
- Experience parsing

---

### 2. ATS Scoring
**Status**: ✅ Complete

**Scoring Factors**:
- Section completeness (30%)
- Keyword matching (40%)
- Formatting quality (20%)
- Length appropriateness (10%)

**Score Range**: 0-100

**Recommendations**: Personalized based on score

---

### 3. AI-Powered Insights
**Status**: ✅ Complete

**Model**: llama3.1:8b

**Generates**:
- Top 3 strengths
- Top 3 gaps
- 5 actionable recommendations
- Overall assessment

**Response Time**: 10-15 seconds

---

### 4. AutoFix Bullet Rewriting
**Status**: ✅ Complete

**Model**: gemma3:4b

**Features**:
- Batch processing (3 bullets at a time)
- Before/after comparison
- Change highlighting
- Accept/skip workflow

**Improvements**:
- Stronger action verbs
- Quantifiable metrics
- Measurable outcomes

---

### 5. Bias Detection
**Status**: ✅ Complete

**Categories**:
- Age bias
- Gender bias
- Race/ethnicity bias
- Disability bias
- Other bias

**Features**:
- Comprehensive scanning
- Smart suggestions
- Category filtering
- One-click fixes

---

### 6. Regional Localization
**Status**: ✅ Complete

**Supported Regions**:
- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇪🇺 European Union
- 🌏 Asia-Pacific

**Provides**:
- Format guidelines
- Terminology mapping
- Cultural notes
- Date format conversion

---

### 7. Template Gallery
**Status**: ✅ Complete

**Templates**: 8+ professional designs

**Features**:
- Live preview
- ATS score per template
- Comparison mode
- One-click export

---

### 8. Version History
**Status**: ✅ Complete

**Features**:
- Automatic versioning
- Timeline view
- Easy restore
- Export any version
- Change tracking

---

### 9. AI Chat Assistant
**Status**: ✅ Complete

**Model**: llama3.1:8b

**Capabilities**:
- Resume advice
- Career guidance
- Question answering
- Contextual help

---

### 10. PDF Export
**Status**: ✅ Complete

**Features**:
- Multiple templates
- High-quality output
- ATS-optimized
- Instant download

---

## 🚧 Planned Features

### Phase 2 (Q1 2026)
- User authentication
- Cloud storage
- Team collaboration
- Job description matching
- Cover letter generation

### Phase 3 (Q2 2026)
- Mobile app (iOS/Android)
- LinkedIn integration
- Interview preparation
- Application tracking

### Phase 4 (Q3-Q4 2026)
- Job matching algorithm
- Career path planning
- Networking tools
- Portfolio builder

---

**Next**: [Troubleshooting](./24-troubleshooting.md)
