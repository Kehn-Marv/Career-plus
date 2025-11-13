# Auto-Fix Resume Infrastructure

This directory contains the backend infrastructure for the Intelligent Auto-Fix Resume feature.

## Overview

The auto-fix system uses AI-powered optimization to automatically improve resumes based on ATS analysis and smart recommendations. It consists of several specialized modules that work together to provide comprehensive resume enhancement.

## Architecture

```
Auto-Fix System
├── resume_optimizer.py      # Content optimization using Gemini AI
├── grammar_fixer.py          # Grammar and ATS phrasing improvements
├── keyword_injector.py       # Intelligent keyword integration
├── template_engine.py        # HTML template rendering for PDFs
└── templates/                # Resume layout templates
    ├── professional.html     # Professional template
    ├── modern.html           # Modern template
    ├── minimal.html          # Minimal template
    └── css/                  # Template stylesheets
        ├── professional.css
        ├── modern.css
        └── minimal.css
```

## Modules

### 1. Resume Optimizer (`resume_optimizer.py`)

**Purpose**: Uses Gemini AI to optimize resume content based on identified issues and recommendations.

**Key Functions**:
- `optimize_resume_content()`: Main optimization function
- `build_optimization_prompt()`: Creates comprehensive AI prompts
- `format_issues_for_prompt()`: Formats ATS issues for AI processing
- `format_recommendations_for_prompt()`: Formats recommendations for AI processing

**Features**:
- Applies all ATS fixes and recommendations
- Maintains candidate's authentic voice
- Preserves factual accuracy
- Enhances impact with action verbs
- Optimizes for ATS compatibility

### 2. Grammar Fixer (`grammar_fixer.py`)

**Purpose**: Fixes grammar errors and improves ATS-friendly phrasing.

**Key Functions**:
- `fix_grammar_and_ats()`: Main grammar fixing function
- `build_grammar_prompt()`: Creates specialized grammar prompts
- `improve_ats_phrasing()`: Enhances individual text blocks

**Features**:
- Fixes spelling, punctuation, verb tense
- Converts passive to active voice
- Replaces weak verbs with power verbs
- Ensures consistency in formatting
- Uses lower temperature (0.3) for consistent results

### 3. Keyword Injector (`keyword_injector.py`)

**Purpose**: Intelligently injects missing keywords into resume content.

**Key Functions**:
- `inject_keywords_intelligently()`: Main keyword injection function
- `extract_missing_keywords()`: Extracts keywords from recommendations
- `determine_keyword_placements()`: Determines optimal section for each keyword
- `build_keyword_injection_prompt()`: Creates keyword integration prompts
- `validate_keyword_integration()`: Validates keywords were integrated naturally
- `get_keyword_statistics()`: Analyzes keyword usage in resume
- `prioritize_keywords()`: Ranks keywords by relevance to job description

**Features**:
- Natural language integration using Gemini AI
- Avoids keyword stuffing (validates max 5 occurrences per keyword)
- Prioritizes industry-relevant keywords based on job description
- Smart placement algorithm:
  - Technical skills → Skills section
  - Soft skills → Summary or Experience
  - Action-oriented keywords → Experience section
  - Industry terms → Summary or Experience
- Contextual appropriateness validation
- Maintains natural language flow throughout

### 4. Template Engine (`template_engine.py`)

**Purpose**: Manages resume templates and renders them to HTML for PDF generation.

**Key Functions**:
- `get_template()`: Retrieves template by ID
- `render()`: Renders resume data to HTML
- `get_css()`: Gets CSS for a template
- `list_templates()`: Lists available templates
- `generate_pdf()`: Generates PDF from resume data using WeasyPrint
- `generate_pdf_to_file()`: Generates PDF and saves to file

**Features**:
- Jinja2-based templating
- Multiple professional layouts
- ATS-compatible formatting (no tables, proper text extraction)
- WeasyPrint integration with optimized settings
- Responsive design
- Direct PDF generation from resume data

## Templates

### Professional Template
- Traditional, corporate-friendly design
- Clear section hierarchy
- ATS-optimized structure
- Suitable for: Finance, Legal, Corporate roles

### Modern Template
- Contemporary design with accent colors
- Clean, visually appealing layout
- Gradient header
- Suitable for: Tech, Creative, Startup roles

### Minimal Template
- Simple, text-focused design
- Serif typography
- Maximum readability
- Suitable for: Academic, Research, Traditional roles

## Usage

### Basic Usage

```python
from app.resume_optimizer import optimize_resume_content
from app.grammar_fixer import fix_grammar_and_ats
from app.keyword_injector import inject_keywords_intelligently
from app.template_engine import template_engine

# Step 1: Optimize content
optimized = await optimize_resume_content(
    resume=resume_data,
    issues=ats_issues,
    recommendations=smart_recommendations,
    job_description=job_desc
)

# Step 2: Fix grammar
grammar_fixed = await fix_grammar_and_ats(optimized)

# Step 3: Inject keywords
final_resume = await inject_keywords_intelligently(
    resume=grammar_fixed,
    recommendations=smart_recommendations,
    job_description=job_desc
)

# Step 4: Generate PDF (Method 1: Using template engine)
pdf_bytes = template_engine.generate_pdf('professional', final_resume)

# Or Method 2: Manual rendering
html = template_engine.render('professional', final_resume)
css = template_engine.get_css('professional')

from weasyprint import HTML, CSS
pdf_bytes = HTML(string=html).write_pdf(stylesheets=[CSS(string=css)])
```

### Template Rendering

```python
from app.template_engine import template_engine

# List available templates
templates = template_engine.list_templates()
print(templates)  # {'professional': 'Professional', 'modern': 'Modern', ...}

# Render a template to HTML
html = template_engine.render('modern', resume_data)

# Get template CSS
css = template_engine.get_css('modern')

# Generate PDF directly
pdf_bytes = template_engine.generate_pdf('modern', resume_data)

# Or save PDF to file
from pathlib import Path
output_path = template_engine.generate_pdf_to_file(
    'modern', 
    resume_data, 
    Path('output/resume.pdf')
)
```

## Configuration

Add these environment variables to your `.env` file:

```env
# WeasyPrint Configuration
WEASYPRINT_CACHE_DIR=./cache/weasyprint
TEMPLATE_DIR=./app/templates
MAX_PDF_SIZE_MB=10
PDF_GENERATION_TIMEOUT=30
```

## Dependencies

### Python Packages
- `weasyprint>=60.0` - PDF generation
- `jinja2>=3.1.2` - Template rendering
- `google-genai>=1.0.0` - AI optimization

### System Dependencies
- Pango - Text layout engine
- Cairo - 2D graphics library
- GObject - Object system

See `WEASYPRINT_SETUP.md` for detailed installation instructions.

## Error Handling

All modules include comprehensive error handling:

```python
try:
    optimized = await optimize_resume_content(...)
except ValueError as e:
    # Handle JSON parsing errors
    print(f"Failed to parse AI response: {e}")
except Exception as e:
    # Handle API errors
    print(f"Optimization failed: {e}")
```

## Testing

Test individual modules:

```bash
# Test template engine
python -c "from app.template_engine import template_engine; print(template_engine.list_templates())"

# Test module imports
python -c "from app.resume_optimizer import optimize_resume_content; print('Success')"

# Test WeasyPrint
python -c "from weasyprint import HTML; HTML(string='<h1>Test</h1>').write_pdf(); print('Success')"
```

## Performance Considerations

1. **AI Calls**: Each optimization step makes an API call to Gemini
   - Content optimization: ~5-10 seconds
   - Grammar fixing: ~3-5 seconds
   - Keyword injection: ~3-5 seconds

2. **PDF Generation**: WeasyPrint rendering
   - Simple resume: ~1-2 seconds
   - Complex resume: ~3-5 seconds

3. **Total Time**: Typical end-to-end optimization takes 15-30 seconds

## Best Practices

1. **Prompt Engineering**: Keep prompts clear and specific
2. **Temperature Settings**: Use lower temperature (0.3) for grammar, higher (0.7) for content
3. **Error Recovery**: Implement retry logic for API failures
4. **Validation**: Always validate AI responses before using them
5. **Caching**: Cache template rendering results when possible

## Future Enhancements

- [ ] Multi-language support
- [ ] Custom template upload
- [ ] A/B testing of optimization strategies
- [ ] Batch processing for multiple resumes
- [ ] Real-time preview during optimization

## Troubleshooting

### Common Issues

**Issue**: "Failed to parse AI response as JSON"
- **Cause**: AI returned invalid JSON
- **Solution**: Check prompt formatting, add retry logic

**Issue**: "cannot load library 'libgobject-2.0-0'"
- **Cause**: WeasyPrint dependencies not installed
- **Solution**: See `WEASYPRINT_SETUP.md`

**Issue**: "Gemini API authentication failed"
- **Cause**: Invalid or missing API key
- **Solution**: Check `GEMINI_API_KEY` in `.env`

## Support

For issues or questions:
1. Check `WEASYPRINT_SETUP.md` for installation help
2. Review error messages and logs
3. Verify environment variables are set correctly
4. Test individual modules in isolation
