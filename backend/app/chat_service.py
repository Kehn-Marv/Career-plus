"""
Chat Service with Guardrails and Enhanced Context
Provides AI-powered resume assistance with comprehensive context awareness
"""

import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from .gemini_client import gemini_client

load_dotenv()

# Gemini model configuration
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash-lite')

# Comprehensive system prompt with guardrails
SYSTEM_PROMPT = """You are a professional resume optimization assistant. Your role is to help users improve their resumes and job applications.

SCOPE: You ONLY provide assistance with:
- Resume content, formatting, and structure
- Job application strategies
- ATS (Applicant Tracking System) optimization
- Keyword matching and optimization
- Interview preparation related to resume content
- Career advice directly related to job applications
- Professional summary and bullet point writing

BOUNDARIES: You MUST politely decline requests about:
- Topics unrelated to resumes or careers
- Personal advice outside of job applications
- Technical support for non-resume software
- General knowledge questions
- Creative writing unrelated to resumes

TONE: Professional, supportive, and actionable. Provide specific, concrete advice.

CONTEXT AWARENESS: You have access to the user's resume analysis AND the target job description. 
When providing recommendations:
- Reference specific requirements from the job description
- Compare resume content against job requirements
- Suggest keywords and phrases from the job description
- Explain how to address gaps between resume and job requirements
- Cite specific qualifications or skills mentioned in the job posting
- When job description is not available, focus on general resume best practices"""


def generate_chat_response(
    message: str,
    context: Dict[str, Any],
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> str:
    """
    Generate AI chat response with guardrails and enhanced context
    
    Args:
        message: User's message
        context: Analysis context including scores, gaps, strengths, etc.
        conversation_history: Previous messages in the conversation
        
    Returns:
        AI-generated response text
        
    Raises:
        Exception: If AI service fails or times out
    """
    try:
        # Build comprehensive context prompt
        context_prompt = build_enhanced_context(context)
        
        # Format conversation history
        history_prompt = format_conversation_history(conversation_history or [])
        
        # Construct full prompt with guardrails
        full_prompt = f"""{SYSTEM_PROMPT}

ANALYSIS CONTEXT:
{context_prompt}

CONVERSATION HISTORY:
{history_prompt}

USER MESSAGE:
{message}

ASSISTANT RESPONSE:"""
        
        # Call Gemini API with chat-specific configuration
        response = gemini_client.generate(
            prompt=full_prompt,
            model=GEMINI_MODEL,
            max_tokens=800,  # Longer responses for chat
            temperature=0.7,
            timeout=90
        )
        
        return response
        
    except Exception as e:
        # User-friendly fallback error messages
        error_msg = str(e).lower()
        
        if 'timeout' in error_msg:
            return ("I apologize, but I'm taking longer than expected to respond. "
                   "This might be due to high demand. Please try asking a simpler question, "
                   "or try again in a moment.")
        elif 'connection' in error_msg or 'unavailable' in error_msg:
            return ("I apologize, but I'm having trouble connecting to the AI service right now. "
                   "Please try again in a moment. If the issue persists, check your internet connection.")
        else:
            return ("I apologize, but I encountered an error while processing your request. "
                   "Please try rephrasing your question or try again shortly.")


def build_enhanced_context(context: Dict[str, Any]) -> str:
    """
    Build comprehensive context prompt from analysis data
    
    Extracts and formats all relevant analysis information including:
    - Job information (title, company, description)
    - Match scores (overall, keyword, semantic, ATS)
    - Identified gaps and strengths
    - Missing keywords
    - Critical ATS issues
    - Resume summary
    
    Args:
        context: Dictionary containing analysis data
        
    Returns:
        Formatted context string for AI prompt
    """
    parts = []
    
    # Job information
    if context.get('job_title'):
        parts.append(f"Target Job: {context['job_title']}")
    if context.get('job_company'):
        parts.append(f"Company: {context['job_company']}")
    
    # Job description (truncated if too long)
    if context.get('job_description'):
        job_desc = str(context['job_description']).strip()
        # Truncate to 1500 characters to avoid token limits
        if len(job_desc) > 1500:
            job_desc = job_desc[:1500] + "..."
        parts.append(f"\nJob Description:\n{job_desc}\n")
    elif context:  # Only add notice if context has other data
        # Add notice when job description is missing but other context exists
        parts.append("\nNote: No job description available. Recommendations are based on resume content and general best practices.\n")
    
    # Match scores
    if context.get('scores'):
        scores = context['scores']
        score_parts = []
        if isinstance(scores, dict):
            if 'total' in scores:
                score_parts.append(f"Overall: {scores['total']}%")
            if 'keyword' in scores:
                score_parts.append(f"Keyword: {scores['keyword']}%")
            if 'semantic' in scores:
                score_parts.append(f"Semantic: {scores['semantic']}%")
            if 'ats' in scores:
                score_parts.append(f"ATS: {scores['ats']}%")
            if score_parts:
                parts.append(f"Match Scores - {', '.join(score_parts)}")
    
    # Key gaps (top 5)
    if context.get('gaps'):
        gaps = context['gaps']
        if isinstance(gaps, list) and gaps:
            gap_list = gaps[:5]
            parts.append(f"Key Gaps: {', '.join(str(g) for g in gap_list)}")
    
    # Strengths (top 5)
    if context.get('strengths'):
        strengths = context['strengths']
        if isinstance(strengths, list) and strengths:
            strength_list = strengths[:5]
            parts.append(f"Strengths: {', '.join(str(s) for s in strength_list)}")
    
    # Missing keywords (top 10)
    if context.get('missing_keywords'):
        keywords = context['missing_keywords']
        if isinstance(keywords, list) and keywords:
            keyword_list = keywords[:10]
            parts.append(f"Missing Keywords: {', '.join(str(k) for k in keyword_list)}")
    
    # Critical ATS issues (top 3)
    if context.get('ats_issues'):
        issues = context['ats_issues']
        if isinstance(issues, list):
            critical = []
            for issue in issues:
                if isinstance(issue, dict) and issue.get('severity') == 'critical':
                    msg = issue.get('message') or issue.get('description', '')
                    if msg:
                        critical.append(msg)
                if len(critical) >= 3:
                    break
            if critical:
                parts.append(f"Critical ATS Issues: {'; '.join(critical)}")
    
    # Resume summary (truncated if too long)
    if context.get('resume_summary'):
        summary = str(context['resume_summary'])
        if len(summary) > 200:
            summary = summary[:200] + "..."
        parts.append(f"Resume Summary: {summary}")
    
    # Recommendations (top 3)
    if context.get('recommendations'):
        recommendations = context['recommendations']
        if isinstance(recommendations, list):
            rec_list = []
            for rec in recommendations[:3]:
                if isinstance(rec, dict):
                    rec_type = rec.get('type', '')
                    explanation = rec.get('explanation', '')
                    if rec_type:
                        rec_list.append(f"{rec_type}: {explanation}" if explanation else rec_type)
            if rec_list:
                parts.append(f"Top Recommendations: {'; '.join(rec_list)}")
    
    return "\n".join(parts) if parts else "No analysis context available"


def format_conversation_history(history: List[Dict[str, str]]) -> str:
    """
    Format last 5 messages for conversation context
    
    Args:
        history: List of message dictionaries with 'role' and 'content' keys
        
    Returns:
        Formatted conversation history string
    """
    if not history:
        return "No previous conversation"
    
    formatted = []
    # Take only last 5 messages for context
    recent_history = history[-5:]
    
    for msg in recent_history:
        if not isinstance(msg, dict):
            continue
            
        role = msg.get('role', '')
        content = msg.get('content', '')
        
        if not content:
            continue
        
        # Truncate very long messages
        if len(content) > 500:
            content = content[:500] + "..."
        
        # Format role name
        role_name = "User" if role == 'user' else "Assistant"
        formatted.append(f"{role_name}: {content}")
    
    return "\n".join(formatted) if formatted else "No previous conversation"
