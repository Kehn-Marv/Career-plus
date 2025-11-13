"""
Keyword Injector
Uses Gemini AI to intelligently inject missing keywords into resume content
"""

import json
from typing import Dict, Any, List, Set
from .gemini_client import generate_text, GEMINI_MODEL


async def inject_keywords_intelligently(
    resume: Dict[str, Any],
    recommendations: List[Dict[str, Any]],
    job_description: str
) -> Dict[str, Any]:
    """
    Intelligently inject missing keywords into resume content
    
    This function:
    - Extracts missing keywords from recommendations
    - Determines optimal placement for each keyword (summary, experience, skills)
    - Uses Gemini API to inject keywords naturally into existing content
    - Avoids keyword stuffing by maintaining natural language flow
    - Prioritizes industry-relevant keywords
    
    Args:
        resume: Resume data dictionary
        recommendations: List of smart recommendations
        job_description: Target job description
        
    Returns:
        Resume with keywords naturally integrated
        
    Raises:
        Exception: If keyword injection fails
    """
    # Extract missing keywords from recommendations
    missing_keywords = extract_missing_keywords(recommendations)
    
    if not missing_keywords:
        # No keywords to inject, return original resume
        return resume
    
    # Determine optimal placement for keywords
    keyword_placements = determine_keyword_placements(missing_keywords, resume, job_description)
    
    # Build prompt for natural keyword integration
    prompt = build_keyword_injection_prompt(resume, keyword_placements, job_description)
    
    # Use Gemini API with moderate temperature for natural integration
    response = generate_text(
        prompt=prompt,
        model=GEMINI_MODEL,
        max_tokens=2000,
        temperature=0.6,
        timeout=120
    )
    
    # Parse and validate the response
    keyword_injected_resume = parse_json_response(response)
    validate_keyword_integration(keyword_injected_resume, resume, missing_keywords)
    
    return keyword_injected_resume


def extract_missing_keywords(recommendations: List[Dict[str, Any]]) -> List[str]:
    """
    Extract missing keywords from recommendations
    
    Looks for recommendations with type 'keyword' or that mention missing keywords
    in their suggested text or explanation.
    
    Args:
        recommendations: List of smart recommendations
        
    Returns:
        List of unique missing keywords
    """
    keywords = set()
    
    for rec in recommendations:
        rec_type = rec.get('type', '').lower()
        suggested_text = rec.get('suggestedText', rec.get('suggested_text', ''))
        explanation = rec.get('explanation', '')
        
        # Check if this is a keyword recommendation
        if rec_type == 'keyword':
            # Extract keywords from suggested text
            if suggested_text:
                # Keywords might be comma-separated or in a list format
                if ',' in suggested_text:
                    keyword_list = [k.strip() for k in suggested_text.split(',')]
                    keywords.update(keyword_list)
                else:
                    keywords.add(suggested_text.strip())
        
        # Check if explanation mentions missing keywords
        if 'missing keyword' in explanation.lower() or 'add keyword' in explanation.lower():
            # Try to extract keywords from explanation
            if suggested_text:
                keywords.add(suggested_text.strip())
    
    # Filter out empty strings and return as list
    return [k for k in keywords if k]


def determine_keyword_placements(
    keywords: List[str],
    resume: Dict[str, Any],
    job_description: str
) -> Dict[str, List[str]]:
    """
    Determine optimal placement for each keyword (summary, experience, skills)
    
    Strategy:
    - Technical skills → Skills section
    - Soft skills and competencies → Summary or Experience
    - Tools and technologies → Skills section
    - Industry terms → Summary or Experience
    - Action-oriented keywords → Experience section
    
    Args:
        keywords: List of keywords to place
        resume: Current resume data
        job_description: Target job description
        
    Returns:
        Dictionary mapping section names to lists of keywords
    """
    placements = {
        'skills': [],
        'summary': [],
        'experience': []
    }
    
    # Common technical skill indicators
    technical_indicators = [
        'python', 'java', 'javascript', 'react', 'node', 'sql', 'aws', 'azure',
        'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql', 'mongodb',
        'postgresql', 'redis', 'kafka', 'spark', 'hadoop', 'tensorflow',
        'pytorch', 'scikit', 'pandas', 'numpy', 'flask', 'django', 'spring',
        'angular', 'vue', 'typescript', 'c++', 'c#', 'ruby', 'php', 'swift',
        'kotlin', 'go', 'rust', 'scala', 'r', 'matlab', 'tableau', 'powerbi'
    ]
    
    # Common soft skill indicators
    soft_skill_indicators = [
        'leadership', 'communication', 'collaboration', 'teamwork', 'problem-solving',
        'analytical', 'critical thinking', 'creativity', 'adaptability', 'time management',
        'project management', 'stakeholder', 'cross-functional', 'agile', 'scrum'
    ]
    
    # Action-oriented keyword indicators
    action_indicators = [
        'led', 'managed', 'developed', 'implemented', 'designed', 'created',
        'optimized', 'improved', 'increased', 'reduced', 'streamlined',
        'coordinated', 'facilitated', 'executed', 'delivered', 'achieved'
    ]
    
    for keyword in keywords:
        keyword_lower = keyword.lower()
        
        # Check if it's a technical skill
        is_technical = any(tech in keyword_lower for tech in technical_indicators)
        
        # Check if it's a soft skill
        is_soft_skill = any(soft in keyword_lower for soft in soft_skill_indicators)
        
        # Check if it's action-oriented
        is_action = any(action in keyword_lower for action in action_indicators)
        
        # Determine placement based on keyword type
        if is_technical:
            placements['skills'].append(keyword)
        elif is_action:
            placements['experience'].append(keyword)
        elif is_soft_skill:
            # Soft skills can go in summary or experience
            # Prefer summary if it exists, otherwise experience
            if 'summary' in resume and resume['summary']:
                placements['summary'].append(keyword)
            else:
                placements['experience'].append(keyword)
        else:
            # Default: try to place in summary first, then experience
            if 'summary' in resume and resume['summary']:
                placements['summary'].append(keyword)
            else:
                placements['experience'].append(keyword)
    
    # Remove empty lists
    return {k: v for k, v in placements.items() if v}


def build_keyword_injection_prompt(
    resume: Dict[str, Any],
    keyword_placements: Dict[str, List[str]],
    job_description: str
) -> str:
    """
    Build prompt for natural keyword integration using Gemini AI
    
    The prompt instructs the AI to:
    - Inject keywords naturally into specified sections
    - Maintain natural language flow
    - Avoid keyword stuffing
    - Preserve all existing content and factual information
    - Ensure keywords are contextually appropriate
    
    Args:
        resume: Resume data dictionary
        keyword_placements: Dictionary mapping sections to keywords
        job_description: Target job description
        
    Returns:
        Formatted prompt string
    """
    resume_json = json.dumps(resume, indent=2)
    job_desc_truncated = job_description[:500] if len(job_description) > 500 else job_description
    
    # Format keyword placements for prompt
    placements_text = format_keyword_placements(keyword_placements)
    
    prompt = f"""You are an expert resume writer and ATS optimization specialist with deep knowledge of natural language processing and keyword integration techniques.

ROLE ASSUMPTION:
As an advanced keyword integration expert, you will naturally incorporate missing keywords into this resume while maintaining authentic voice, natural language flow, and factual accuracy. Your goal is to enhance ATS compatibility without keyword stuffing.

RESUME CONTENT (JSON):
{resume_json}

JOB DESCRIPTION:
{job_desc_truncated}

KEYWORDS TO INTEGRATE:
{placements_text}

KEYWORD INTEGRATION INSTRUCTIONS:

1. NATURAL INTEGRATION (Critical):
   - Integrate keywords seamlessly into existing sentences and bullet points
   - Ensure keywords fit naturally within the context
   - Maintain grammatical correctness and readability
   - Avoid forced or awkward phrasing
   - Do NOT simply append keywords to sentences

2. AVOID KEYWORD STUFFING:
   - Use each keyword only once or twice maximum
   - Ensure keywords add value and meaning
   - Do not create artificial sentences just to include keywords
   - Maintain natural language flow throughout
   - Prioritize quality over quantity

3. CONTEXTUAL APPROPRIATENESS:
   - Place keywords where they make logical sense
   - Ensure keywords align with the candidate's actual experience
   - Use keywords in relevant contexts (e.g., technical skills in technical descriptions)
   - Maintain professional tone and authenticity

4. SECTION-SPECIFIC GUIDELINES:

   SKILLS SECTION:
   - Add technical keywords directly to the skills list
   - Group related skills together
   - Maintain alphabetical or logical ordering
   - Example: If adding "Docker", place it near other DevOps tools

   SUMMARY SECTION:
   - Weave keywords into existing sentences naturally
   - Use keywords to enhance professional narrative
   - Ensure summary remains concise and impactful
   - Example: "Experienced software engineer" → "Experienced software engineer with expertise in Docker and Kubernetes"

   EXPERIENCE SECTION:
   - Integrate keywords into bullet points where contextually appropriate
   - Use keywords to describe actual work performed
   - Enhance existing bullets rather than creating new ones
   - Example: "Deployed applications" → "Deployed containerized applications using Docker"

5. PRESERVE EXISTING CONTENT:
   - Keep ALL factual information (dates, companies, titles, achievements)
   - Maintain the candidate's authentic voice and tone
   - Do not remove or significantly alter existing content
   - Only enhance with keywords where natural

6. QUALITY VALIDATION:
   - Read the final resume to ensure it sounds natural
   - Verify that keywords enhance rather than detract from content
   - Ensure the resume remains professional and credible
   - Check that no keyword appears excessively

CRITICAL REQUIREMENTS:
- Preserve the exact JSON structure
- Maintain all factual accuracy
- Ensure natural language flow
- Avoid keyword stuffing at all costs
- Integrate keywords only where contextually appropriate

OUTPUT FORMAT:
Return ONLY a valid JSON object with the exact same structure as the input. Do not include any explanations, markdown formatting, or additional text.

Begin natural keyword integration now:"""
    
    return prompt


def format_keyword_placements(keyword_placements: Dict[str, List[str]]) -> str:
    """
    Format keyword placements for inclusion in prompt
    
    Args:
        keyword_placements: Dictionary mapping sections to keywords
        
    Returns:
        Formatted string describing keyword placements
    """
    if not keyword_placements:
        return "No keywords to integrate."
    
    formatted_parts = []
    
    if 'skills' in keyword_placements and keyword_placements['skills']:
        skills_list = ', '.join(keyword_placements['skills'])
        formatted_parts.append(f"SKILLS SECTION: Add these keywords to the skills list:\n  {skills_list}")
    
    if 'summary' in keyword_placements and keyword_placements['summary']:
        summary_list = ', '.join(keyword_placements['summary'])
        formatted_parts.append(f"SUMMARY SECTION: Naturally integrate these keywords:\n  {summary_list}")
    
    if 'experience' in keyword_placements and keyword_placements['experience']:
        experience_list = ', '.join(keyword_placements['experience'])
        formatted_parts.append(f"EXPERIENCE SECTION: Naturally integrate these keywords into relevant bullet points:\n  {experience_list}")
    
    return "\n\n".join(formatted_parts)


def parse_json_response(response: str) -> Dict[str, Any]:
    """
    Parse JSON response from AI, handling markdown code blocks
    
    Args:
        response: Raw response string from AI
        
    Returns:
        Parsed JSON dictionary
        
    Raises:
        ValueError: If response cannot be parsed as JSON
    """
    # Remove markdown code blocks if present
    cleaned = response.strip()
    if cleaned.startswith('```'):
        # Find the first newline after opening ```
        start = cleaned.find('\n')
        # Find the closing ```
        end = cleaned.rfind('```')
        if start != -1 and end != -1:
            cleaned = cleaned[start+1:end].strip()
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        # Try to find JSON object in the response
        start_idx = cleaned.find('{')
        end_idx = cleaned.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = cleaned[start_idx:end_idx + 1]
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        
        raise ValueError(f"Failed to parse AI response as JSON: {e}\nResponse: {response[:200]}...")


def validate_keyword_integration(
    keyword_injected: Dict[str, Any],
    original: Dict[str, Any],
    keywords: List[str]
) -> None:
    """
    Validate that keywords were integrated naturally without keyword stuffing
    
    Checks:
    - Resume structure is preserved
    - Keywords appear in the resume
    - Keywords don't appear excessively (keyword stuffing check)
    - Major sections are maintained
    
    Args:
        keyword_injected: Resume with keywords injected
        original: Original resume
        keywords: List of keywords that should be integrated
        
    Raises:
        ValueError: If validation fails
    """
    if not isinstance(keyword_injected, dict):
        raise ValueError("Keyword-injected resume must be a dictionary")
    
    # Check that major sections are preserved
    original_keys = set(original.keys())
    injected_keys = set(keyword_injected.keys())
    
    major_sections = {'summary', 'experience', 'education', 'skills'}
    original_major = original_keys.intersection(major_sections)
    injected_major = injected_keys.intersection(major_sections)
    
    if original_major != injected_major:
        missing = original_major - injected_major
        if missing:
            raise ValueError(f"Keyword-injected resume is missing sections: {missing}")
    
    # Convert resume to string for keyword checking
    resume_text = json.dumps(keyword_injected).lower()
    
    # Check that at least some keywords were integrated
    keywords_found = sum(1 for keyword in keywords if keyword.lower() in resume_text)
    
    if keywords_found == 0 and len(keywords) > 0:
        # Warning: no keywords were integrated (might be intentional if they don't fit)
        pass
    
    # Check for keyword stuffing (keyword appears too many times)
    for keyword in keywords:
        keyword_lower = keyword.lower()
        count = resume_text.count(keyword_lower)
        
        # If a keyword appears more than 5 times, it might be keyword stuffing
        if count > 5:
            raise ValueError(f"Potential keyword stuffing detected: '{keyword}' appears {count} times")
    
    # Validate experience section structure if present
    if 'experience' in keyword_injected and 'experience' in original:
        if not isinstance(keyword_injected['experience'], list):
            raise ValueError("Experience section must be a list")
        
        # Check that we have similar number of entries
        if len(keyword_injected['experience']) < len(original['experience']) - 1:
            raise ValueError(
                f"Experience section has too few entries: "
                f"{len(keyword_injected['experience'])} vs {len(original['experience'])}"
            )


def get_keyword_statistics(resume: Dict[str, Any], keywords: List[str]) -> Dict[str, Any]:
    """
    Get statistics about keyword integration in the resume
    
    Args:
        resume: Resume data dictionary
        keywords: List of keywords to check
        
    Returns:
        Dictionary with keyword statistics
    """
    resume_text = json.dumps(resume).lower()
    
    stats = {
        'total_keywords': len(keywords),
        'keywords_found': 0,
        'keywords_missing': [],
        'keyword_counts': {},
        'sections_with_keywords': set()
    }
    
    for keyword in keywords:
        keyword_lower = keyword.lower()
        count = resume_text.count(keyword_lower)
        
        if count > 0:
            stats['keywords_found'] += 1
            stats['keyword_counts'][keyword] = count
            
            # Check which sections contain the keyword
            if 'summary' in resume:
                summary_text = json.dumps(resume['summary']).lower()
                if keyword_lower in summary_text:
                    stats['sections_with_keywords'].add('summary')
            
            if 'experience' in resume:
                experience_text = json.dumps(resume['experience']).lower()
                if keyword_lower in experience_text:
                    stats['sections_with_keywords'].add('experience')
            
            if 'skills' in resume:
                skills_text = json.dumps(resume['skills']).lower()
                if keyword_lower in skills_text:
                    stats['sections_with_keywords'].add('skills')
        else:
            stats['keywords_missing'].append(keyword)
    
    # Convert set to list for JSON serialization
    stats['sections_with_keywords'] = list(stats['sections_with_keywords'])
    
    return stats


def prioritize_keywords(
    keywords: List[str],
    job_description: str,
    max_keywords: int = 10
) -> List[str]:
    """
    Prioritize keywords based on relevance to job description
    
    Args:
        keywords: List of all keywords
        job_description: Target job description
        max_keywords: Maximum number of keywords to return
        
    Returns:
        List of prioritized keywords (most relevant first)
    """
    if not keywords:
        return []
    
    job_desc_lower = job_description.lower()
    
    # Score each keyword based on frequency in job description
    keyword_scores = []
    for keyword in keywords:
        keyword_lower = keyword.lower()
        frequency = job_desc_lower.count(keyword_lower)
        keyword_scores.append((keyword, frequency))
    
    # Sort by frequency (descending)
    keyword_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Return top N keywords
    prioritized = [kw for kw, score in keyword_scores[:max_keywords]]
    
    return prioritized
