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
    
    # Call Gemini API with appropriate settings
    response = generate_text(
        prompt=prompt,
        model=GEMINI_MODEL,
        max_tokens=2000,
        temperature=0.7,
        timeout=120
    )
    
    # Parse and validate the JSON response
    optimized_resume = parse_json_response(response)
    validate_resume_structure(optimized_resume)
    
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
    
    # Convert resume to JSON string
    resume_json = json.dumps(resume, indent=2)
    
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
Return ONLY a valid JSON object with this exact structure:
{{
  "summary": "Enhanced professional summary...",
  "experience": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "dates": "Start - End",
      "description": ["Bullet point 1", "Bullet point 2", ...]
    }}
  ],
  "education": [
    {{
      "degree": "Degree Name",
      "institution": "School Name",
      "location": "City, State",
      "dates": "Start - End",
      "details": []
    }}
  ],
  "skills": ["skill1", "skill2", ...],
  "certifications": [
    {{
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date",
      "details": ""
    }}
  ]
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
        # Try to find JSON object in the response
        start_idx = response.find('{')
        end_idx = response.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = response[start_idx:end_idx + 1]
            try:
                parsed = json.loads(json_str)
                return parsed
            except json.JSONDecodeError:
                pass
        
        raise ValueError(f"Failed to parse JSON from AI response: {e}")


def validate_resume_structure(resume: Dict[str, Any]) -> None:
    """
    Validate that the optimized resume has the expected structure
    
    Args:
        resume: Resume data to validate
        
    Raises:
        ValueError: If resume structure is invalid
    """
    # Check for required top-level keys
    if not isinstance(resume, dict):
        raise ValueError("Resume must be a dictionary")
    
    # Validate experience section if present
    if 'experience' in resume:
        if not isinstance(resume['experience'], list):
            raise ValueError("Experience must be a list")
        
        for exp in resume['experience']:
            if not isinstance(exp, dict):
                raise ValueError("Each experience entry must be a dictionary")
            
            # Check for required fields
            required_fields = ['title', 'company']
            for field in required_fields:
                if field not in exp:
                    raise ValueError(f"Experience entry missing required field: {field}")
    
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
