"""
AI-Powered Insights and Recommendations Generator
Uses Gemini API for generating personalized insights and recommendations.

Service Coordination Strategy:
- Gemini API: Used for insights, recommendations, and career advice generation
- AI Gateway (Ollama): Used by frontend for semantic analysis and format analysis
- This separation ensures optimal use of each service's strengths
"""

import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from .gemini_client import generate_text, check_ai_available, GEMINI_MODEL

load_dotenv()

# Check AI availability on startup
AI_AVAILABLE = check_ai_available()

if AI_AVAILABLE:
    print("✓ AI service available for insights generation")
else:
    print("⚠ AI service not available, using rule-based fallback")


def generate_ai_insights(
    resume_text: str,
    job_description: str,
    keyword_analysis: Dict[str, Any],
    scores: Dict[str, float]
) -> Dict[str, Any]:
    """
    Generate personalized insights using AI
    
    Args:
        resume_text: Full resume text
        job_description: Full job description text
        keyword_analysis: Keyword matching results
        scores: Calculated scores (semantic, keyword, format, ats)
    
    Returns:
        Dictionary with strengths, gaps, and recommendations
    """
    
    try:
        # Generate strengths
        strengths = generate_strengths(resume_text, job_description, keyword_analysis, scores)
        
        # Generate gaps
        gaps = generate_gaps(resume_text, job_description, keyword_analysis, scores)
        
        # Generate specific recommendations
        recommendations = generate_recommendations(resume_text, job_description, keyword_analysis, scores, gaps)
        
        return {
            "strengths": strengths,
            "gaps": gaps,
            "recommendations": recommendations
        }
        
    except Exception as e:
        print(f"AI insights generation failed: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to rule-based
        return generate_rule_based_insights(resume_text, job_description, keyword_analysis, scores)


def call_ai(prompt: str, max_tokens: int = 500) -> str:
    """Call AI service for text generation"""
    return generate_text(
        prompt=prompt,
        model=GEMINI_MODEL,
        max_tokens=max_tokens,
        temperature=0.7,
        timeout=90
    )


def generate_strengths(resume_text: str, job_description: str, keyword_analysis: Dict, scores: Dict) -> List[str]:
    """Generate personalized strengths using Ollama AI"""
    
    try:
        matched_keywords = keyword_analysis.get('matched_keywords', [])[:10]
        matched_kw_str = ', '.join([kw.get('keyword', '') if isinstance(kw, dict) else str(kw) for kw in matched_keywords[:5]])
    except Exception as e:
        print(f"Error parsing matched keywords: {e}")
        matched_keywords = []
        matched_kw_str = ''
    
    # Try AI first
    if AI_AVAILABLE:
        try:
            prompt = f"""Analyze candidate strengths for this job.

Job Requirements:
{job_description[:400]}

Resume:
{resume_text[:500]}

Matched Skills: {matched_kw_str}
Score: {scores.get('keyword', 0)}/100

List 3-4 specific strengths. Use - for bullets."""

            response = call_ai(prompt, max_tokens=200)
            
            # Parse response into list
            strengths = []
            for line in response.split('\n'):
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    strength = line.lstrip('-•* ').strip()
                    if strength and len(strength) > 15:
                        strengths.append(strength)
            
            if strengths:
                return strengths[:5]
                
        except Exception as e:
            print(f"AI strengths generation failed: {e}")
    
    # Fallback to rule-based
    strengths = []
    
    if len(matched_keywords) >= 5:
        top_skills = [kw.get('keyword', '') if isinstance(kw, dict) else str(kw) for kw in matched_keywords[:3]]
        strengths.append(f"Strong match in key areas: {', '.join(top_skills)}")
    
    keyword_score = scores.get('keyword', 0)
    if keyword_score > 70:
        strengths.append(f"Excellent keyword alignment ({keyword_score}% match with job requirements)")
    elif keyword_score > 50:
        strengths.append(f"Good keyword coverage ({keyword_score}% match with job requirements)")
    
    format_score = scores.get('format', 0)
    if format_score > 80:
        strengths.append("Well-structured, ATS-optimized resume format")
    
    return strengths[:5] if strengths else ["Relevant experience for the role"]


def generate_gaps(resume_text: str, job_description: str, keyword_analysis: Dict, scores: Dict) -> List[str]:
    """Generate personalized gaps using Ollama AI"""
    
    try:
        missing_keywords = keyword_analysis.get('missing_keywords', [])[:15]
        missing_kw_str = ', '.join([kw.get('keyword', '') if isinstance(kw, dict) else str(kw) for kw in missing_keywords[:8]])
    except Exception as e:
        print(f"Error parsing missing keywords: {e}")
        missing_keywords = []
        missing_kw_str = ''
    
    # Try AI first
    if AI_AVAILABLE:
        try:
            prompt = f"""Identify gaps in this resume for the job.

Job Requirements:
{job_description[:400]}

Resume:
{resume_text[:500]}

Missing: {missing_kw_str}
Score: {scores.get('keyword', 0)}/100

List 3-4 specific gaps. Use - for bullets."""

            response = call_ai(prompt, max_tokens=200)
            
            # Parse response
            gaps = []
            for line in response.split('\n'):
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    gap = line.lstrip('-•* ').strip()
                    if gap and len(gap) > 15:
                        gaps.append(gap)
            
            if gaps:
                return gaps[:5]
                
        except Exception as e:
            print(f"AI gaps generation failed: {e}")
    
    # Fallback to rule-based
    gaps = []
    
    if missing_keywords:
        top_missing = [kw.get('keyword', '') if isinstance(kw, dict) else str(kw) for kw in missing_keywords[:5]]
        meaningful_missing = [kw for kw in top_missing if len(kw) > 3 and kw not in ['with', 'and', 'the', 'for', 'from', 'that', 'this', 'work', 'using', 'experience']]
        if meaningful_missing:
            gaps.append(f"Missing key skills: {', '.join(meaningful_missing)}")
    
    keyword_score = scores.get('keyword', 0)
    if keyword_score < 50:
        gaps.append("Resume lacks many keywords from the job description")
    
    return gaps[:5] if gaps else ["Consider tailoring resume more specifically to this job description"]


def generate_recommendations(
    resume_text: str, 
    job_description: str, 
    keyword_analysis: Dict, 
    scores: Dict,
    gaps: List[str]
) -> List[Dict[str, Any]]:
    """Generate specific, actionable recommendations using Ollama AI"""
    
    # Try AI first
    if AI_AVAILABLE:
        try:
            gaps_str = '\n'.join([f"- {gap}" for gap in gaps[:3]])
            
            prompt = f"""Provide actionable recommendations to improve this resume.

Job:
{job_description[:350]}

Gaps:
{gaps_str}

Give 3-4 specific recommendations. Use numbered list (1., 2., 3.)."""

            response = call_ai(prompt, max_tokens=250)
            
            # Parse response
            recommendations = []
            lines = response.split('\n')
            
            for i, line in enumerate(lines):
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                    rec_text = line.lstrip('0123456789.-•* ').strip()
                    
                    if rec_text and len(rec_text) > 20:
                        priority = 'high' if i < 2 else 'medium' if i < 4 else 'low'
                        
                        recommendations.append({
                            "id": f"ai-rec-{i+1}",
                            "type": "content",
                            "priority": priority,
                            "suggestedText": rec_text[:250],
                            "explanation": "AI-generated personalized recommendation",
                            "impact": 15 if priority == 'high' else 10 if priority == 'medium' else 5,
                            "applied": False
                        })
            
            if recommendations:
                return recommendations[:5]
                
        except Exception as e:
            print(f"AI recommendations generation failed: {e}")
    
    # Fallback to rule-based
    recommendations = []
    rec_id = 1
    
    try:
        missing_keywords = keyword_analysis.get('missing_keywords', [])[:10]
    except Exception as e:
        print(f"Error getting missing keywords: {e}")
        missing_keywords = []
    
    # Recommendation 1: Add missing keywords (filtered)
    if missing_keywords:
        try:
            top_missing = [kw.get('keyword', '') if isinstance(kw, dict) else str(kw) for kw in missing_keywords[:10]]
            meaningful_missing = [kw for kw in top_missing if len(kw) > 3 and kw not in ['with', 'and', 'the', 'for', 'from', 'that', 'this', 'work', 'using', 'experience', 'including', 'turing', 'memory']]
        except Exception as e:
            print(f"Error extracting keywords for recommendations: {e}")
            meaningful_missing = []
        
        if meaningful_missing:
            recommendations.append({
                "id": f"rec-{rec_id}",
                "type": "keyword",
                "priority": "high",
                "suggestedText": f"Add these important keywords to your resume: {', '.join(meaningful_missing[:5])}",
                "explanation": "These keywords appear frequently in the job description but are missing from your resume.",
                "impact": 20,
                "applied": False
            })
            rec_id += 1
    
    # Recommendation 2: Improve semantic alignment
    semantic_score = scores.get('semantic', 0)
    if semantic_score < 70:
        recommendations.append({
            "id": f"rec-{rec_id}",
            "type": "content",
            "priority": "high",
            "suggestedText": "Rephrase your experience using terminology from the job description",
            "explanation": "Your resume uses different language than the job posting. Mirror the job description's phrasing to improve relevance.",
            "impact": 15,
            "applied": False
        })
        rec_id += 1
    
    # Recommendation 3: Add quantifiable achievements (context-aware)
    has_numbers = any(char.isdigit() for char in resume_text[:1000])
    if not has_numbers or resume_text.count('%') < 2:
        # Detect role type from job description
        is_technical = any(word in job_description.lower() for word in ['developer', 'engineer', 'programmer', 'software', 'technical'])
        is_management = any(word in job_description.lower() for word in ['manager', 'lead', 'director', 'supervisor'])
        
        if is_technical:
            example = "e.g., 'Reduced API response time by 40%', 'Improved code coverage to 85%', 'Optimized database queries reducing load time by 50%'"
        elif is_management:
            example = "e.g., 'Led team of 8 engineers', 'Increased team velocity by 35%', 'Reduced sprint cycle time by 2 days'"
        else:
            example = "e.g., 'Improved process efficiency by 30%', 'Reduced costs by $50K annually', 'Managed portfolio of 15+ projects'"
        
        recommendations.append({
            "id": f"rec-{rec_id}",
            "type": "content",
            "priority": "medium",
            "suggestedText": f"Add quantifiable metrics to your achievements {example}",
            "explanation": "Numbers and metrics make your accomplishments more concrete and measurable.",
            "impact": 12,
            "applied": False
        })
        rec_id += 1
    
    # Recommendation 4: Format improvements
    format_score = scores.get('format', 0)
    if format_score < 80:
        recommendations.append({
            "id": f"rec-{rec_id}",
            "type": "format",
            "priority": "medium",
            "suggestedText": "Improve resume formatting for better ATS compatibility",
            "explanation": "Use standard section headers (Experience, Education, Skills), avoid tables/columns, and use simple formatting.",
            "impact": 10,
            "applied": False
        })
        rec_id += 1
    
    # Recommendation 5: Tailor experience descriptions
    if len(missing_keywords) > 5:
        recommendations.append({
            "id": f"rec-{rec_id}",
            "type": "content",
            "priority": "medium",
            "suggestedText": "Tailor your experience bullet points to highlight skills mentioned in the job description",
            "explanation": "Review each bullet point and add relevant keywords where they naturally fit your actual experience.",
            "impact": 15,
            "applied": False
        })
        rec_id += 1
    
    return recommendations[:5]


def generate_rule_based_insights(
    resume_text: str,
    job_description: str,
    keyword_analysis: Dict,
    scores: Dict
) -> Dict[str, Any]:
    """Fallback rule-based insights when AI is not available"""
    
    matched_keywords = keyword_analysis.get('matched_keywords', [])
    missing_keywords = keyword_analysis.get('missing_keywords', [])
    
    strengths = []
    gaps = []
    
    # Analyze strengths
    if len(matched_keywords) > 10:
        strengths.append(f"Strong keyword match with {len(matched_keywords)} relevant skills")
    
    if scores.get('format', 0) > 80:
        strengths.append("Well-formatted, ATS-friendly resume")
    
    # Analyze gaps
    if missing_keywords:
        top_missing = [kw.get('keyword', '') for kw in missing_keywords[:5]]
        gaps.append(f"Missing key skills: {', '.join(top_missing)}")
    
    if scores.get('semantic', 0) < 60:
        gaps.append("Resume language doesn't closely match job description terminology")
    
    return {
        "strengths": strengths[:5],
        "gaps": gaps[:5],
        "recommendations": []
    }
