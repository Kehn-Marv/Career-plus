# Template Alias Fix - Frontend/Backend Template Name Mismatch

## Problem
The AutoFix workflow was failing at PDF generation with:
```
ValueError: Template 'modern-professional' not found. Available templates: professional, modern, minimal
```

## Root Cause
The frontend and backend use different template naming conventions:

### Frontend Template IDs:
- `'modern-professional'` ✅
- `'classic-executive'` ✅
- `'minimal-tech'` ✅

### Backend Template IDs:
- `'professional'` ❌
- `'modern'` ❌
- `'minimal'` ❌

When the frontend requested `'modern-professional'`, the backend couldn't find it because it only knows about `'modern'`.

## Solution
Added template aliases in the backend's `get_template()` method to map frontend template IDs to backend template IDs.

### Template Alias Mapping:
```python
template_aliases = {
    'modern-professional': 'modern',
    'classic-executive': 'professional',
    'minimal-tech': 'minimal'
}
```

## Code Changes

### File: `backend/app/template_engine.py`

**Before:**
```python
def get_template(self, template_id: str) -> Dict[str, Any]:
    if template_id not in self.templates:
        available = ', '.join(self.templates.keys())
        raise ValueError(
            f"Template '{template_id}' not found. "
            f"Available templates: {available}"
        )
    return self.templates[template_id]
```

**After:**
```python
def get_template(self, template_id: str) -> Dict[str, Any]:
    # Handle template aliases for frontend compatibility
    template_aliases = {
        'modern-professional': 'modern',
        'classic-executive': 'professional',
        'minimal-tech': 'minimal'
    }
    
    # Resolve alias if exists
    resolved_id = template_aliases.get(template_id, template_id)
    
    if resolved_id not in self.templates:
        available = ', '.join(self.templates.keys())
        raise ValueError(
            f"Template '{template_id}' not found. "
            f"Available templates: {available}"
        )
    return self.templates[resolved_id]
```

## Why This Happened

The frontend and backend were developed with different naming conventions:

**Frontend Naming** (descriptive):
- Uses hyphenated names that describe the template style
- Example: `'modern-professional'` clearly indicates a modern, professional style
- Defined in: `frontend/src/lib/templates/base-templates.ts`

**Backend Naming** (simple):
- Uses simple, single-word names
- Example: `'modern'` is shorter and matches the HTML filename
- Defined in: `backend/app/template_engine.py`

## Testing

After this fix, the AutoFix workflow should complete successfully:

1. ✅ Step 1: Retrieving analysis data
2. ✅ Step 2: Optimizing resume content (backend AI)
3. ✅ Step 3: Generating PDF (now works with correct template!)
4. ✅ Step 4: Saving results

## Expected Backend Logs

**Before Fix:**
```
[PDF Generation] Using template: modern-professional
[PDF Generation] ValueError: Template 'modern-professional' not found
INFO: 127.0.0.1:60048 - "POST /api/generate-pdf HTTP/1.1" 400 Bad Request
```

**After Fix:**
```
[PDF Generation] Using template: modern-professional
[PDF Generation] Resume data keys: ['contact', 'summary', 'experience', 'education', 'skills']
[PDF Generation] Generated PDF (45678 bytes)
INFO: 127.0.0.1:60048 - "POST /api/generate-pdf HTTP/1.1" 200 OK
```

## Template Mapping Reference

| Frontend ID | Backend ID | Template File | Description |
|------------|-----------|---------------|-------------|
| `modern-professional` | `modern` | `modern.html` | Clean, modern design with color accents |
| `classic-executive` | `professional` | `professional.html` | Traditional professional layout |
| `minimal-tech` | `minimal` | `minimal.html` | Ultra-clean minimalist design |

## Alternative Solutions Considered

### Option 1: Rename Backend Templates (Not Chosen)
Rename backend template files to match frontend:
- `modern.html` → `modern-professional.html`
- `professional.html` → `classic-executive.html`
- `minimal.html` → `minimal-tech.html`

**Pros**: Perfect alignment between frontend and backend
**Cons**: Breaking change, requires updating all references

### Option 2: Rename Frontend Templates (Not Chosen)
Change frontend to use backend names:
- `'modern-professional'` → `'modern'`
- `'classic-executive'` → `'professional'`
- `'minimal-tech'` → `'minimal'`

**Pros**: Simpler names
**Cons**: Less descriptive, requires updating frontend code

### Option 3: Template Aliases (CHOSEN) ✅
Add alias mapping in backend to support both naming conventions.

**Pros**: 
- No breaking changes
- Supports both naming conventions
- Easy to maintain
- Can add more aliases in the future

**Cons**: 
- Slight indirection in code

## Future Improvements

### 1. Centralized Template Registry
Create a shared configuration file that both frontend and backend use:

```typescript
// shared/template-config.ts
export const TEMPLATE_REGISTRY = {
  'modern-professional': {
    frontendId: 'modern-professional',
    backendId: 'modern',
    name: 'Modern Professional',
    file: 'modern.html'
  },
  // ...
}
```

### 2. Template Validation
Add validation to ensure frontend and backend templates are in sync:

```python
# backend/scripts/validate_templates.py
def validate_templates():
    frontend_templates = load_frontend_templates()
    backend_templates = load_backend_templates()
    
    for frontend_id in frontend_templates:
        if not has_backend_mapping(frontend_id):
            raise ValueError(f"Frontend template {frontend_id} has no backend mapping")
```

### 3. Dynamic Template Discovery
Have the frontend query the backend for available templates:

```typescript
// GET /api/templates
const templates = await fetch('/api/templates').then(r => r.json())
// Returns: [{ id: 'modern', name: 'Modern', aliases: ['modern-professional'] }]
```

## Related Files

### Modified:
- `backend/app/template_engine.py` - Added template alias mapping

### Related (Not Modified):
- `frontend/src/lib/templates/base-templates.ts` - Frontend template definitions
- `frontend/src/lib/templates/template-engine.ts` - Frontend template engine
- `backend/app/templates/modern.html` - Modern template HTML
- `backend/app/templates/professional.html` - Professional template HTML
- `backend/app/templates/minimal.html` - Minimal template HTML

## Summary

Fixed the template name mismatch by adding alias mapping in the backend. The backend now accepts frontend template IDs (`'modern-professional'`, `'classic-executive'`, `'minimal-tech'`) and maps them to the corresponding backend template IDs (`'modern'`, `'professional'`, `'minimal'`).

The AutoFix workflow should now complete successfully and generate PDFs!
