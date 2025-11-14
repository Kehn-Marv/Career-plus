"""
Resume Content Optimizer
Uses Gemini AI to optimize resume content based on ATS issues and recommendations
"""

import json
from typing import List, Dict, Any
from .gemini_client import generate_text, GEMINI_MODEL
from .cache_manager import cache_manager, generate_cache_key


async def optimize_resume_content(
    resume: Dict[str, Any],
    issues: List[Dict[str, Any]],
    recommendations: List[Dict[str, Any]],
    job_description: str
) -> Dict[str, Any]:
    """
    Use Gemini AI to optimize resume content
    
    Args:
        resume: Original resume data as dictionary
        issues: List of ATS issues identified
        recommendations: List of smart recommendations
        job_description: Target job description
        
    Returns:
        Optimized resume data as dictionary
        
    Raises:
        Exception: If AI generation fails or response is invalid
    """
    # Build the optimization prompt
    prompt = build_optimization_prompt(resume, issues, recommendations, job_description)
    
    # Call Gemini API with appropriate settings and JSON mode
    response = generate_text(
        prompt=prompt,
        model=GEMINI_MODEL,
        max_tokens=2000,
        temperature=0.7,
        timeout=120,
        response_mime_type='application/json'  # Force JSON output
    )
    
    # Parse and validate the JSON response
    optimized_resume = parse_json_response(response)
    validate_resume_structure(optimized_resume, resume)
    
    # Merge back any missing fields from original resume
    optimized_resume = merge_missing_fields(optimized_resume, resume)
    
    return optimized_resume


def build_optimization_prompt(
    resume: Dict[str, Any],
    issues: List[Dict[str, Any]],
    recommendations: List[Dict[str, Any]],
    job_description: str
) -> str:
    """
    Build comprehensive prompt for Gemini AI (with caching)
    
    Args:
        resume: Original resume data
        issues: List of ATS issues
        recommendations: List of smart recommendations
        job_description: Target job description
        
    Returns:
        Formatted prompt string
    """
    # Generate cache key for prompt
    cache_key = f"opt_prompt:{generate_cache_key(resume, issues, recommendations, job_description[:100])}"
    
    # Try to get from cache
    cached_prompt = cache_manager.get_prompt_cache().get(cache_key)
    if cached_prompt is not None:
        return cached_prompt
    
    # Format issues for prompt
    issues_text = format_issues_for_prompt(issues)
    
    # Format recommendations for prompt
    recommendations_text = format_recommendations_for_prompt(recommendations)
    
    # Remove rawText field if present (it contains binary PDF data that breaks JSON)
    resume_for_prompt = {k: v for k, v in resume.items() if k != 'rawText'}
    
    # Convert resume to JSON string
    resume_json = json.dumps(resume_for_prompt, indent=2)
    
    # Truncate job description if too long
    job_desc_truncated = job_description[:500] if len(job_description) > 500 else job_description
    
    # Build the comprehensive prompt
    prompt = f"""You are a professional resume optimizer with expertise in ATS systems and career coaching.

Your task is to optimize the following resume by applying all identified improvements while preserving the candidate's authentic voice and factual accuracy.

ORIGINAL RESUME (JSON):
{resume_json}

JOB DESCRIPTION:
{job_desc_truncated}

IDENTIFIED ISSUES:
{issues_text}

RECOMMENDATIONS:
{recommendations_text}

INSTRUCTIONS:
1. Apply ALL recommendations and fix ALL issues
2. Maintain the candidate's original tone and personality
3. Keep all factual information accurate (dates, companies, titles)
4. Enhance impact with strong action verbs and quantifiable metrics
5. Optimize for ATS compatibility (simple formatting, clear sections, relevant keywords)
6. Ensure natural language flow - no keyword stuffing

OUTPUT FORMAT:
Return ONLY a valid JSON object that PRESERVES ALL FIELDS from the original resume and enhances the content.

CRITICAL: You MUST include ALL fields from the original resume, including:
- All contact information (name, email, phone, location, linkedin, portfolio, etc.)
- All metadata fields (fileName, fileType, fileSize, etc.) - BUT EXCLUDE rawText
- All sections (summary, experience, education, skills, certifications, projects, etc.)
- Any custom fields or sections present in the original

Only enhance the CONTENT of these fields - do not remove or omit any fields.
DO NOT include the rawText field in your response.

Example structure (adapt to match the original resume's structure):
{{
  "fileName": "original_filename.pdf",
  "fileType": "application/pdf",
  "fileSize": 12345,
  "name": "Candidate Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, State",
  "linkedin": "linkedin.com/in/profile",
  "portfolio": "portfolio.com",
  "summary": "Enhanced professional summary...",
  "experience": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "dates": "Start - End",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "description": ["Enhanced bullet 1", "Enhanced bullet 2", ...],
      "bullets": ["Enhanced bullet 1", "Enhanced bullet 2", ...]
    }}
  ],
  "education": [
    {{
      "degree": "Degree Name",
      "institution": "School Name",
      "location": "City, State",
      "dates": "Start - End",
      "graduationDate": "YYYY-MM",
      "gpa": "3.8",
      "honors": ["Honor 1", "Honor 2"],
      "details": []
    }}
  ],
  "skills": ["skill1", "skill2", ...],
  "certifications": [...],
  "projects": [...],
  ...any other fields from original resume...
}}

Begin optimization now:"""
    
    # Cache the prompt
    cache_manager.get_prompt_cache().set(cache_key, prompt)
    
    return prompt


def format_issues_for_prompt(issues: List[Dict[str, Any]]) -> str:
    """
    Format ATS issues for inclusion in prompt
    
    Args:
        issues: List of ATS issues
        
    Returns:
        Formatted string of issues
    """
    if not issues:
        return "No critical issues identified."
    
    formatted_issues = []
    for idx, issue in enumerate(issues, 1):
        severity = issue.get('severity', 'info').upper()
        title = issue.get('title', 'Unknown issue')
        description = issue.get('description', '')
        suggestion = issue.get('suggestion', '')
        
        issue_text = f"{idx}. [{severity}] {title}"
        if description:
            issue_text += f"\n   Description: {description}"
        if suggestion:
            issue_text += f"\n   Suggestion: {suggestion}"
        
        formatted_issues.append(issue_text)
    
    return "\n\n".join(formatted_issues)


def format_recommendations_for_prompt(recommendations: List[Dict[str, Any]]) -> str:
    """
    Format smart recommendations for inclusion in prompt
    
    Args:
        recommendations: List of smart recommendations
        
    Returns:
        Formatted string of recommendations
    """
    if not recommendations:
        return "No specific recommendations provided."
    
    # Group recommendations by priority if available
    high_priority = []
    medium_priority = []
    low_priority = []
    
    for rec in recommendations:
        priority = rec.get('priority', 'medium').lower()
        rec_type = rec.get('type', 'general')
        suggested_text = rec.get('suggestedText', rec.get('suggested_text', ''))
        explanation = rec.get('explanation', '')
        
        rec_text = f"[{rec_type.upper()}] {suggested_text}"
        if explanation:
            rec_text += f"\n   Reason: {explanation}"
        
        if priority == 'high':
            high_priority.append(rec_text)
        elif priority == 'low':
            low_priority.append(rec_text)
        else:
            medium_priority.append(rec_text)
    
    # Build formatted output
    formatted_parts = []
    
    if high_priority:
        formatted_parts.append("HIGH PRIORITY:")
        formatted_parts.extend([f"  {i+1}. {rec}" for i, rec in enumerate(high_priority)])
    
    if medium_priority:
        formatted_parts.append("\nMEDIUM PRIORITY:")
        formatted_parts.extend([f"  {i+1}. {rec}" for i, rec in enumerate(medium_priority)])
    
    if low_priority:
        formatted_parts.append("\nLOW PRIORITY:")
        formatted_parts.extend([f"  {i+1}. {rec}" for i, rec in enumerate(low_priority)])
    
    return "\n".join(formatted_parts) if formatted_parts else "No specific recommendations provided."


def parse_json_response(response: str) -> Dict[str, Any]:
    """
    Parse and extract JSON from AI response
    
    Args:
        response: Raw response from AI
        
    Returns:
        Parsed JSON as dictionary
        
    Raises:
        ValueError: If JSON cannot be parsed
    """
    # Try to find JSON in the response
    # Sometimes AI wraps JSON in markdown code blocks
    response = response.strip()
    
    # Log the raw response for debugging
    print(f"[JSON Parser] Raw AI response (first 500 chars): {response[:500]}")
    
    # Remove markdown code blocks if present
    if response.startswith("```json"):
        response = response[7:]
    elif response.startswith("```"):
        response = response[3:]
    
    if response.endswith("```"):
        response = response[:-3]
    
    response = response.strip()
    
    # Try to parse JSON
    try:
        parsed = json.loads(response)
        return parsed
    except json.JSONDecodeError as e:
        print(f"[JSON Parser] Initial parse failed: {e}")
        
        # Try to find JSON object in the response
        start_idx = response.find('{')
        end_idx = response.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = response[start_idx:end_idx + 1]
            print(f"[JSON Parser] Extracted JSON substring (first 500 chars): {json_str[:500]}")
            try:
                parsed = json.loads(json_str)
                return parsed
            except json.JSONDecodeError as e2:
                print(f"[JSON Parser] Substring parse also failed: {e2}")
                
                # Try to fix common JSON issues
                # 1. Fix unterminated strings by adding closing quotes
                # 2. Remove trailing commas
                # 3. Escape unescaped quotes
                try:
                    import re
                    # Remove trailing commas before closing braces/brackets
                    fixed_json = re.sub(r',(\s*[}\]])', r'\1', json_str)
                    parsed = json.loads(fixed_json)
                    print("[JSON Parser] Successfully parsed after fixing trailing commas")
                    return parsed
                except json.JSONDecodeError:
                    pass
        
        # If all parsing attempts fail, log the full response and raise
        print(f"[JSON Parser] All parsing attempts failed. Full response:\n{response}")
        raise ValueError(f"Failed to parse JSON from AI response: {e}")


def merge_missing_fields(optimized: Dict[str, Any], original: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge any missing fields from original resume into optimized resume
    
    This ensures that if the AI accidentally omits fields, they are preserved.
    
    Args:
        optimized: Optimized resume data
        original: Original resume data
        
    Returns:
        Optimized resume with all original fields preserved
    """
    result = optimized.copy()
    
    # Add any missing top-level fields from original
    for key, value in original.items():
        if key not in result:
            print(f"Restoring missing field: {key}")
            result[key] = value
    
    # Special handling for experience - ensure all fields are preserved
    if 'experience' in original and 'experience' in result:
        if isinstance(original['experience'], list) and isinstance(result['experience'], list):
            # Match experience entries by title and company
            for i, orig_exp in enumerate(original['experience']):
                if i < len(result['experience']):
                    opt_exp = result['experience'][i]
                    # Merge missing fields from original experience entry
                    for key, value in orig_exp.items():
                        if key not in opt_exp:
                            opt_exp[key] = value
    
    # Special handling for education - ensure all fields are preserved
    if 'education' in original and 'education' in result:
        if isinstance(original['education'], list) and isinstance(result['education'], list):
            for i, orig_edu in enumerate(original['education']):
                if i < len(result['education']):
                    opt_edu = result['education'][i]
                    # Merge missing fields from original education entry
                    for key, value in orig_edu.items():
                        if key not in opt_edu:
                            opt_edu[key] = value
    
    return result


def validate_resume_structure(resume: Dict[str, Any], original: Dict[str, Any] = None) -> None:
    """
    Validate that the optimized resume has the expected structure and preserves all original fields
    
    Args:
        resume: Resume data to validate
        original: Original resume data to compare against (optional)
        
    Raises:
        ValueError: If resume structure is invalid or fields are missing
    """
    # Check for required top-level keys
    if not isinstance(resume, dict):
        raise ValueError("Resume must be a dictionary")
    
    # If original is provided, check that all original fields are preserved
    if original is not None:
        original_keys = set(original.keys())
        resume_keys = set(resume.keys())
        missing_keys = original_keys - resume_keys
        
        if missing_keys:
            print(f"WARNING: Optimized resume is missing fields: {missing_keys}")
            # Don't raise error, just warn - some fields might be intentionally restructured
    
    # Validate experience section if present
    if 'experience' in resume:
        if not isinstance(resume['experience'], list):
            raise ValueError("Experience must be a list")
        
        for i, exp in enumerate(resume['experience']):
            if not isinstance(exp, dict):
                raise ValueError(f"Experience entry {i} must be a dictionary")
            
            # Check for required fields
            required_fields = ['title', 'company']
            for field in required_fields:
                if field not in exp or not exp[field]:
                    raise ValueError(f"Experience entry {i} missing or has empty required field: {field}")
    
    # Validate education section if present
    if 'education' in resume:
        if not isinstance(resume['education'], list):
            raise ValueError("Education must be a list")
    
    # Validate skills section if present
    if 'skills' in resume:
        if not isinstance(resume['skills'], list):
            raise ValueError("Skills must be a list")
    
    # Validate summary if present
    if 'summary' in resume:
        if not isinstance(resume['summary'], str):
            raise ValueError("Summary must be a string")
