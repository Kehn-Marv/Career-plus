"""
Grammar and ATS Phrasing Fixer
Uses Gemini AI to fix grammar errors and improve ATS-friendly phrasing
"""

import json
from typing import Dict, Any, List
from .gemini_client import generate_text, GEMINI_MODEL
from .cache_manager import cache_manager, generate_cache_key


async def fix_grammar_and_ats(resume: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply grammar corrections and ATS-optimized phrasing
    
    This function uses Gemini AI with a specialized prompt to:
    - Fix all grammar errors (spelling, punctuation, verb tense, subject-verb agreement)
    - Replace weak verbs with power verbs
    - Convert passive voice to active voice
    - Ensure consistent verb tense throughout resume
    - Improve parallel structure in bullet points
    
    Args:
        resume: Resume data dictionary
        
    Returns:
        Grammar-corrected resume dictionary with improved ATS phrasing
        
    Raises:
        Exception: If grammar fixing fails
    """
    prompt = build_grammar_prompt(resume)
    
    # Use lower temperature (0.3) for consistent grammar fixes
    response = generate_text(
        prompt=prompt,
        model=GEMINI_MODEL,
        max_tokens=2000,
        temperature=0.3,
        timeout=120,
        response_mime_type='application/json'  # Force JSON output
    )
    
    corrected_resume = parse_json_response(response)
    validate_corrected_resume(corrected_resume, resume)
    
    # Merge back any missing fields from original resume
    corrected_resume = merge_missing_fields(corrected_resume, resume)
    
    return corrected_resume


def build_grammar_prompt(resume: Dict[str, Any]) -> str:
    """
    Build specialized grammar optimization prompt with expert role assumption (with caching)
    
    This prompt instructs the AI to:
    - Assume the role of an advanced grammar and ATS phrasing expert
    - Fix all grammar errors comprehensively
    - Replace weak verbs with power verbs
    - Convert passive voice to active voice
    - Ensure consistent verb tense throughout
    - Improve parallel structure in bullet points
    
    Args:
        resume: Resume data dictionary
        
    Returns:
        Formatted prompt string with expert role assumption
    """
    # Generate cache key for prompt
    cache_key = f"grammar_prompt:{generate_cache_key(resume)}"
    
    # Try to get from cache
    cached_prompt = cache_manager.get_prompt_cache().get(cache_key)
    if cached_prompt is not None:
        return cached_prompt
    
    # Remove rawText field if present (it contains binary PDF data)
    resume_for_prompt = {k: v for k, v in resume.items() if k != 'rawText'}
    
    resume_json = json.dumps(resume_for_prompt, indent=2)
    
    prompt = f"""You are an expert grammar checker and ATS optimization specialist with advanced expertise comparable to Grammarly and DeepL in quality. You have deep knowledge of professional resume writing, applicant tracking systems, and linguistic best practices.

ROLE ASSUMPTION:
As an advanced grammar and ATS phrasing expert, you will apply your expertise to transform this resume into a grammatically perfect, ATS-optimized document while preserving the candidate's authentic voice and all factual information.

RESUME CONTENT (JSON):
{resume_json}

COMPREHENSIVE GRAMMAR AND ATS OPTIMIZATION INSTRUCTIONS:

1. GRAMMAR CORRECTIONS (Fix ALL errors):
   - Spelling errors and typos
   - Punctuation mistakes (commas, periods, semicolons, apostrophes)
   - Verb tense consistency (use past tense for previous roles, present for current)
   - Subject-verb agreement
   - Pronoun usage and clarity
   - Sentence fragments and run-ons

2. WEAK VERB REPLACEMENT (Power Verbs):
   Replace weak, passive verbs with strong action verbs:
   - "did" → "executed", "accomplished", "performed"
   - "helped" → "facilitated", "assisted", "supported"
   - "worked on" → "developed", "engineered", "built"
   - "was responsible for" → "managed", "led", "directed"
   - "made" → "created", "established", "generated"
   - "got" → "achieved", "obtained", "secured"
   - "used" → "utilized", "leveraged", "employed"
   - "looked at" → "analyzed", "evaluated", "assessed"
   - "talked to" → "communicated with", "collaborated with", "consulted"
   - "dealt with" → "resolved", "addressed", "handled"

3. PASSIVE TO ACTIVE VOICE CONVERSION:
   Transform all passive constructions to active voice:
   - "Was given responsibility" → "Managed"
   - "Were developed by me" → "Developed"
   - "Was tasked with" → "Led", "Executed"
   - Ensure the candidate is the subject performing the action

4. VERB TENSE CONSISTENCY:
   - Past roles: Use consistent past tense throughout
   - Current role: Use consistent present tense
   - Ensure all bullets within a role use the same tense
   - Maintain chronological consistency

5. PARALLEL STRUCTURE IN BULLET POINTS:
   - Start all bullets with strong action verbs
   - Use consistent grammatical structure within each role
   - Match verb forms (all past tense or all present tense per role)
   - Ensure similar sentence patterns for readability

6. ATS-FRIENDLY PHRASING:
   - Use industry-standard terminology
   - Avoid jargon that ATS systems might not recognize
   - Use clear, concise language
   - Maintain professional tone throughout

7. CLARITY AND CONCISENESS:
   - Remove redundant words and phrases
   - Eliminate filler words ("very", "really", "just")
   - Ensure each bullet point is impactful and specific
   - Maintain natural language flow

CRITICAL REQUIREMENTS:
- Preserve ALL factual information (dates, companies, titles, achievements, numbers)
- Maintain the candidate's authentic voice and personality
- Keep the EXACT same JSON structure as input with ALL fields
- Preserve ALL fields including: name, email, phone, location, linkedin, portfolio, fileName, fileType, fileSize, and any other metadata
- DO NOT include the rawText field in your response (it will be restored automatically)
- Do not add or remove content - only improve grammar and phrasing
- Do not omit any fields or sections from the original resume
- Ensure professional tone throughout

OUTPUT FORMAT:
Return ONLY a valid JSON object with the EXACT same structure and ALL fields as the input resume (except rawText). 
Every field present in the input must be present in the output.
Do not include any explanations, markdown formatting, or additional text.

Begin grammar and ATS optimization now:"""
    
    # Cache the prompt
    cache_manager.get_prompt_cache().set(cache_key, prompt)
    
    return prompt


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
    # Log raw response for debugging
    print(f"[Grammar Fixer] Raw response (first 300 chars): {response[:300]}")
    
    # Remove markdown code blocks if present
    cleaned = response.strip()
    
    # Handle ```json prefix
    if cleaned.startswith('```json'):
        cleaned = cleaned[7:]  # Remove ```json
    elif cleaned.startswith('```'):
        cleaned = cleaned[3:]  # Remove ```
    
    # Remove trailing ```
    if cleaned.endswith('```'):
        cleaned = cleaned[:-3]
    
    cleaned = cleaned.strip()
    
    print(f"[Grammar Fixer] Cleaned response (first 300 chars): {cleaned[:300]}")
    
    # Try to parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"[Grammar Fixer] JSON parse failed: {e}")
        
        # Try to extract JSON object
        start_idx = cleaned.find('{')
        end_idx = cleaned.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = cleaned[start_idx:end_idx + 1]
            print(f"[Grammar Fixer] Trying extracted JSON (first 300 chars): {json_str[:300]}")
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e2:
                print(f"[Grammar Fixer] Extracted JSON also failed: {e2}")
        
        raise ValueError(f"Failed to parse AI response as JSON: {e}\nResponse: {response[:200]}...")


def merge_missing_fields(corrected: Dict[str, Any], original: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge any missing fields from original resume into corrected resume
    
    This ensures that if the AI accidentally omits fields, they are preserved.
    
    Args:
        corrected: Corrected resume data
        original: Original resume data
        
    Returns:
        Corrected resume with all original fields preserved
    """
    result = corrected.copy()
    
    # Add any missing top-level fields from original
    for key, value in original.items():
        if key not in result:
            print(f"[Grammar Fixer] Restoring missing field: {key}")
            result[key] = value
    
    # Special handling for experience - ensure all fields are preserved
    if 'experience' in original and 'experience' in result:
        if isinstance(original['experience'], list) and isinstance(result['experience'], list):
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


def validate_corrected_resume(corrected: Dict[str, Any], original: Dict[str, Any]) -> None:
    """
    Validate that the corrected resume maintains the same structure as original
    
    Args:
        corrected: Corrected resume dictionary
        original: Original resume dictionary
        
    Raises:
        ValueError: If structure validation fails
    """
    if not isinstance(corrected, dict):
        raise ValueError("Corrected resume must be a dictionary")
    
    # Check that major sections are preserved
    original_keys = set(original.keys())
    corrected_keys = set(corrected.keys())
    
    # Allow for minor key differences but ensure major sections exist
    major_sections = {'summary', 'experience', 'education', 'skills'}
    original_major = original_keys.intersection(major_sections)
    corrected_major = corrected_keys.intersection(major_sections)
    
    if original_major != corrected_major:
        missing = original_major - corrected_major
        if missing:
            raise ValueError(f"Corrected resume is missing sections: {missing}")
    
    # Validate experience section structure if present
    if 'experience' in corrected and 'experience' in original:
        if not isinstance(corrected['experience'], list):
            raise ValueError("Experience section must be a list")
        
        # Check that we have similar number of entries (allow for minor differences)
        if len(corrected['experience']) < len(original['experience']) - 1:
            raise ValueError(f"Experience section has too few entries: {len(corrected['experience'])} vs {len(original['experience'])}")


def improve_ats_phrasing(text: str) -> str:
    """
    Improve ATS phrasing for a single text block by replacing weak verbs with power verbs
    and converting passive voice to active voice
    
    This function implements rule-based improvements for:
    - Weak verb replacement with power verbs
    - Passive voice to active voice conversion
    - Consistent verb tense
    - Parallel structure
    
    Args:
        text: Text to improve
        
    Returns:
        Improved text with ATS-friendly phrasing
    """
    # Comprehensive weak verb to power verb replacements
    weak_to_power_verbs = {
        # Basic weak verbs
        'did': 'executed',
        'helped': 'facilitated',
        'worked on': 'developed',
        'was responsible for': 'managed',
        'made': 'created',
        'got': 'achieved',
        'used': 'utilized',
        'looked at': 'analyzed',
        'talked to': 'communicated with',
        'dealt with': 'resolved',
        
        # Additional weak verbs
        'handled': 'managed',
        'tried': 'initiated',
        'went': 'attended',
        'gave': 'delivered',
        'took': 'assumed',
        'put': 'implemented',
        'kept': 'maintained',
        'saw': 'identified',
        'found': 'discovered',
        'showed': 'demonstrated',
        
        # Passive constructions
        'was given': 'received',
        'was tasked with': 'led',
        'were developed': 'developed',
        'was created': 'created',
        'was managed': 'managed',
        'were implemented': 'implemented',
        'was assigned': 'assumed',
        'were completed': 'completed',
    }
    
    improved = text
    
    # Apply replacements (case-insensitive)
    for weak, strong in weak_to_power_verbs.items():
        # Replace at start of sentence (capitalized)
        improved = improved.replace(weak.capitalize(), strong.capitalize())
        # Replace in middle of sentence (lowercase)
        improved = improved.replace(f" {weak} ", f" {strong} ")
        improved = improved.replace(f" {weak}.", f" {strong}.")
        improved = improved.replace(f" {weak},", f" {strong},")
    
    return improved


def get_power_verb_suggestions() -> List[Dict[str, Any]]:
    """
    Get a comprehensive list of power verbs categorized by function
    
    Returns:
        List of power verb categories with examples
    """
    return [
        {
            'category': 'Leadership',
            'verbs': ['led', 'directed', 'managed', 'supervised', 'coordinated', 'orchestrated', 'spearheaded', 'championed']
        },
        {
            'category': 'Achievement',
            'verbs': ['achieved', 'accomplished', 'attained', 'delivered', 'exceeded', 'surpassed', 'completed', 'secured']
        },
        {
            'category': 'Creation',
            'verbs': ['created', 'developed', 'designed', 'built', 'established', 'launched', 'pioneered', 'engineered']
        },
        {
            'category': 'Improvement',
            'verbs': ['improved', 'enhanced', 'optimized', 'streamlined', 'upgraded', 'modernized', 'transformed', 'revitalized']
        },
        {
            'category': 'Analysis',
            'verbs': ['analyzed', 'evaluated', 'assessed', 'investigated', 'researched', 'examined', 'audited', 'diagnosed']
        },
        {
            'category': 'Communication',
            'verbs': ['communicated', 'presented', 'articulated', 'conveyed', 'negotiated', 'collaborated', 'consulted', 'facilitated']
        },
        {
            'category': 'Technical',
            'verbs': ['implemented', 'deployed', 'configured', 'integrated', 'automated', 'programmed', 'architected', 'engineered']
        },
        {
            'category': 'Problem-Solving',
            'verbs': ['resolved', 'troubleshot', 'debugged', 'fixed', 'addressed', 'mitigated', 'rectified', 'remediated']
        }
    ]



def convert_passive_to_active(text: str) -> str:
    """
    Convert passive voice constructions to active voice
    
    This function identifies common passive voice patterns and converts them
    to active voice for better ATS compatibility and impact.
    
    Args:
        text: Text containing passive voice constructions
        
    Returns:
        Text with passive voice converted to active voice
    """
    passive_patterns = {
        # "was/were + past participle" patterns
        'was developed by': 'developed',
        'were developed by': 'developed',
        'was created by': 'created',
        'were created by': 'created',
        'was implemented by': 'implemented',
        'were implemented by': 'implemented',
        'was managed by': 'managed',
        'were managed by': 'managed',
        'was led by': 'led',
        'were led by': 'led',
        
        # "was/were + verb" patterns (common in resumes)
        'was responsible for': 'managed',
        'were responsible for': 'managed',
        'was tasked with': 'led',
        'were tasked with': 'led',
        'was assigned to': 'handled',
        'were assigned to': 'handled',
        'was given': 'received',
        'were given': 'received',
        'was selected to': 'selected to',
        'were selected to': 'selected to',
        'was chosen to': 'chosen to',
        'were chosen to': 'chosen to',
    }
    
    converted = text
    for passive, active in passive_patterns.items():
        converted = converted.replace(passive, active)
        converted = converted.replace(passive.capitalize(), active.capitalize())
    
    return converted


def ensure_consistent_verb_tense(experience_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ensure consistent verb tense throughout resume experience items
    
    Rules:
    - Past roles (not current): Use past tense
    - Current role: Use present tense
    - All bullets within a role should use the same tense
    
    Args:
        experience_items: List of experience dictionaries
        
    Returns:
        Experience items with consistent verb tense
    """
    if not experience_items:
        return experience_items
    
    # Common present to past tense conversions for resume action verbs
    present_to_past = {
        'manage': 'managed',
        'lead': 'led',
        'develop': 'developed',
        'create': 'created',
        'implement': 'implemented',
        'design': 'designed',
        'build': 'built',
        'execute': 'executed',
        'coordinate': 'coordinated',
        'facilitate': 'facilitated',
        'analyze': 'analyzed',
        'optimize': 'optimized',
        'improve': 'improved',
        'enhance': 'enhanced',
        'streamline': 'streamlined',
        'collaborate': 'collaborated',
        'communicate': 'communicated',
        'present': 'presented',
        'deliver': 'delivered',
        'achieve': 'achieved',
        'resolve': 'resolved',
        'troubleshoot': 'troubleshot',
    }
    
    corrected_items = []
    
    for idx, item in enumerate(experience_items):
        corrected_item = item.copy()
        
        # Determine if this is a current role (typically the first one)
        # Check if dates contain "Present", "Current", or similar
        dates = item.get('dates', '')
        is_current = any(keyword in dates for keyword in ['Present', 'Current', 'present', 'current', 'Now', 'now'])
        
        # Process description bullets
        if 'description' in item and isinstance(item['description'], list):
            corrected_bullets = []
            
            for bullet in item['description']:
                corrected_bullet = bullet
                
                # If not current role, convert present tense to past tense
                if not is_current:
                    for present, past in present_to_past.items():
                        # Replace at start of bullet (capitalized)
                        if corrected_bullet.startswith(present.capitalize()):
                            corrected_bullet = corrected_bullet.replace(
                                present.capitalize(), 
                                past.capitalize(), 
                                1
                            )
                        # Replace at start of bullet (lowercase)
                        elif corrected_bullet.startswith(present):
                            corrected_bullet = corrected_bullet.replace(present, past, 1)
                
                corrected_bullets.append(corrected_bullet)
            
            corrected_item['description'] = corrected_bullets
        
        corrected_items.append(corrected_item)
    
    return corrected_items


def improve_parallel_structure(bullets: List[str]) -> List[str]:
    """
    Improve parallel structure in bullet points
    
    Ensures all bullets:
    - Start with strong action verbs
    - Use consistent grammatical structure
    - Follow similar patterns for readability
    
    Args:
        bullets: List of bullet point strings
        
    Returns:
        Bullets with improved parallel structure
    """
    if not bullets:
        return bullets
    
    improved_bullets = []
    
    for bullet in bullets:
        improved = bullet.strip()
        
        # Ensure bullet starts with a capital letter
        if improved and not improved[0].isupper():
            improved = improved[0].upper() + improved[1:]
        
        # Remove ending period if present (for consistency)
        if improved.endswith('.'):
            improved = improved[:-1]
        
        # Ensure bullet doesn't start with articles or weak words
        weak_starts = ['the ', 'a ', 'an ', 'this ', 'that ']
        for weak in weak_starts:
            if improved.lower().startswith(weak):
                # Try to restructure to start with action verb
                improved = improved[len(weak):]
                if improved:
                    improved = improved[0].upper() + improved[1:]
        
        improved_bullets.append(improved)
    
    return improved_bullets


def apply_ats_phrasing_improvements(resume: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply comprehensive ATS phrasing improvements to resume
    
    This function applies all ATS phrasing improvement techniques:
    - Replace weak verbs with power verbs
    - Convert passive voice to active voice
    - Ensure consistent verb tense throughout resume
    - Improve parallel structure in bullet points
    
    Args:
        resume: Resume data dictionary
        
    Returns:
        Resume with improved ATS phrasing
    """
    improved_resume = resume.copy()
    
    # Improve summary if present
    if 'summary' in improved_resume and isinstance(improved_resume['summary'], str):
        summary = improved_resume['summary']
        summary = improve_ats_phrasing(summary)
        summary = convert_passive_to_active(summary)
        improved_resume['summary'] = summary
    
    # Improve experience section
    if 'experience' in improved_resume and isinstance(improved_resume['experience'], list):
        experience_items = improved_resume['experience']
        
        # Ensure consistent verb tense
        experience_items = ensure_consistent_verb_tense(experience_items)
        
        # Improve each experience item
        for item in experience_items:
            if 'description' in item and isinstance(item['description'], list):
                bullets = item['description']
                
                # Apply ATS phrasing improvements to each bullet
                improved_bullets = []
                for bullet in bullets:
                    improved_bullet = improve_ats_phrasing(bullet)
                    improved_bullet = convert_passive_to_active(improved_bullet)
                    improved_bullets.append(improved_bullet)
                
                # Improve parallel structure
                improved_bullets = improve_parallel_structure(improved_bullets)
                
                item['description'] = improved_bullets
        
        improved_resume['experience'] = experience_items
    
    # Improve education section descriptions if present
    if 'education' in improved_resume and isinstance(improved_resume['education'], list):
        for edu_item in improved_resume['education']:
            if 'details' in edu_item and isinstance(edu_item['details'], list):
                improved_details = []
                for detail in edu_item['details']:
                    improved_detail = improve_ats_phrasing(detail)
                    improved_detail = convert_passive_to_active(improved_detail)
                    improved_details.append(improved_detail)
                
                improved_details = improve_parallel_structure(improved_details)
                edu_item['details'] = improved_details
    
    return improved_resume
