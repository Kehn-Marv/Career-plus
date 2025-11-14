# PDF Generation Fix - Data Format Mismatch

## Problem
The AutoFix workflow was failing at the PDF generation step with a 400 Bad Request error:
```
[PDF Generation] Using template: modern-professional
INFO: 127.0.0.1:50060 - "POST /api/generate-pdf HTTP/1.1" 400 Bad Request
```

## Root Cause
The frontend's `OptimizedResumeData` format didn't match what the backend Jinja2 templates expected.

### Frontend Format (Sent):
```typescript
{
  name: "John Doe",
  email: "john@example.com",  // ❌ Top-level
  phone: "555-1234",           // ❌ Top-level
  location: "New York, NY",    // ❌ Top-level
  experience: [{
    title: "Software Engineer",
    company: "Tech Corp",
    startDate: "Jan 2020",     // ❌ Separate fields
    endDate: "Dec 2022",       // ❌ Separate fields
    current: false,
    description: ["bullet 1"]  // ❌ Called 'description'
  }]
}
```

### Backend Template Expected:
```python
{
  "name": "John Doe",
  "contact": {                 // ✅ Nested object
    "email": "john@example.com",
    "phone": "555-1234",
    "location": "New York, NY"
  },
  "experience": [{
    "title": "Software Engineer",
    "company": "Tech Corp",
    "dates": "Jan 2020 - Dec 2022",  // ✅ Single formatted string
    "bullets": ["bullet 1"]           // ✅ Called 'bullets'
  }]
}
```

## Solution
Added a data transformation method in `PDFGenerator` class to convert the frontend format to the backend template format before sending the API request.

### Changes Made:

#### 1. Added `transformResumeForBackend` Method
Transforms the resume data structure:
- Moves contact fields into a nested `contact` object
- Combines `startDate`, `endDate`, and `current` into a single `dates` string
- Renames `description` to `bullets`
- Properly formats education data

#### 2. Added `formatDates` Helper Method
Formats date ranges for display:
- Handles current positions: "Jan 2020 - Present"
- Handles past positions: "Jan 2020 - Dec 2022"
- Handles missing dates gracefully

#### 3. Updated `buildPDFRequest` Method
Now calls `transformResumeForBackend` before sending data to the API.

## Code Changes

### File: `frontend/src/lib/autofix/pdf-generator.ts`

```typescript
private transformResumeForBackend(resume: OptimizedResumeData): any {
  return {
    name: resume.name,
    contact: {
      email: resume.email,
      phone: resume.phone,
      location: resume.location,
      linkedin: resume.linkedin,
      portfolio: resume.portfolio
    },
    summary: resume.summary,
    experience: resume.experience.map(exp => ({
      title: exp.title,
      company: exp.company,
      location: exp.location,
      dates: this.formatDates(exp.startDate, exp.endDate, exp.current),
      bullets: exp.description
    })),
    education: resume.education.map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location,
      graduationDate: edu.graduationDate,
      gpa: edu.gpa,
      honors: edu.honors
    })),
    skills: resume.skills
  }
}

private formatDates(startDate?: string, endDate?: string, current?: boolean): string {
  if (!startDate) return ''
  
  const start = startDate
  const end = current ? 'Present' : (endDate || 'Present')
  
  return `${start} - ${end}`
}
```

## Backend Template Format Reference

### Professional Template (`backend/app/templates/professional.html`)

**Contact Section:**
```html
{% if resume.contact %}
<div class="contact-info">
    {% if resume.contact.email %}
    <span class="contact-item">{{ resume.contact.email }}</span>
    {% endif %}
    {% if resume.contact.phone %}
    <span class="contact-item">{{ resume.contact.phone }}</span>
    {% endif %}
</div>
{% endif %}
```

**Experience Section:**
```html
{% for job in resume.experience %}
<div class="experience-item">
    <h3 class="job-title">{{ job.title }}</h3>
    <span class="job-dates">{{ job.dates }}</span>
    <span class="company-name">{{ job.company }}</span>
    <ul class="job-bullets">
        {% for bullet in job.bullets %}
        <li>{{ bullet }}</li>
        {% endfor %}
    </ul>
</div>
{% endfor %}
```

## Testing

After this fix, the PDF generation should work correctly:

1. Click "Auto-Fix Resume"
2. Step 1: ✅ Retrieving analysis data
3. Step 2: ✅ Optimizing resume content (backend AI)
4. Step 3: ✅ Generating PDF (now works!)
5. Step 4: ✅ Saving results
6. Success notification with download button

## Expected Backend Logs

**Before Fix:**
```
[PDF Generation] Using template: modern-professional
INFO: 127.0.0.1:50060 - "POST /api/generate-pdf HTTP/1.1" 400 Bad Request
```

**After Fix:**
```
[PDF Generation] Using template: modern-professional
[PDF Generation] Generated PDF (45678 bytes)
INFO: 127.0.0.1:50060 - "POST /api/generate-pdf HTTP/1.1" 200 OK
```

## Why This Happened

The frontend and backend were developed separately with different data structures:
- **Frontend**: Uses TypeScript interfaces optimized for React components
- **Backend**: Uses Jinja2 templates optimized for HTML rendering

The AutoFix orchestrator bridges these two systems, so it needs to transform the data format.

## Future Improvements

### Option 1: Standardize Data Format
Create a shared schema that both frontend and backend use:
```typescript
// shared/resume-schema.ts
export interface ResumeData {
  name: string
  contact: ContactInfo
  experience: Experience[]
  // ...
}
```

### Option 2: Backend Accepts Multiple Formats
Update backend templates to handle both formats:
```html
{% if resume.contact %}
  {{ resume.contact.email }}
{% elif resume.email %}
  {{ resume.email }}
{% endif %}
```

### Option 3: Use JSON Schema Validation
Add validation to catch format mismatches early:
```python
from pydantic import BaseModel

class ResumeContact(BaseModel):
    email: Optional[str]
    phone: Optional[str]
    location: Optional[str]

class ResumeData(BaseModel):
    name: str
    contact: ResumeContact
    experience: List[Experience]
```

## Related Files

- `frontend/src/lib/autofix/pdf-generator.ts` - PDF generation client (MODIFIED)
- `frontend/src/lib/autofix/content-optimizer.ts` - Content optimization client
- `backend/app/api.py` - PDF generation endpoint
- `backend/app/template_engine.py` - Template rendering engine
- `backend/app/templates/professional.html` - Professional template
- `backend/app/templates/modern.html` - Modern template
- `backend/app/templates/minimal.html` - Minimal template

## Summary

The PDF generation was failing because the frontend was sending resume data in a different format than the backend templates expected. I added a transformation layer in the `PDFGenerator` class to convert the data to the correct format before sending it to the backend API. The AutoFix workflow should now complete successfully!
