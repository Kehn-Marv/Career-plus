"""
Batch Rewriter Service
AI-powered batch rewriting of resume bullets using AI Gateway
"""

import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from .gemini_client import generate_text, check_ai_available, GEMINI_MODEL

load_dotenv()


class BulletRewrite:
    """Represents a rewritten bullet point"""
    
    def __init__(
        self,
        original: str,
        rewritten: str,
        changes: List[str],
        confidence: float = 0.8
    ):
        self.original = original
        self.rewritten = rewritten
        self.changes = changes
        self.confidence = confidence
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "original": self.original,
            "improved": self.rewritten,
            "changes": self.changes,
            "confidence": self.confidence
        }


def rewrite_bullets_batch(
    bullets: List[str],
    job_description: str,
    tone: str = "professional"
) -> List[BulletRewrite]:
    """
    Rewrite multiple resume bullets using Ollama
    
    Args:
        bullets: List of original bullet points
        job_description: Job description for context
        tone: Desired tone (professional, dynamic, technical)
    
    Returns:
        List of BulletRewrite objects
    """
    results = []
    
    # Process bullets in batches of 3 for better quality
    batch_size = 3
    for i in range(0, len(bullets), batch_size):
        batch = bullets[i:i + batch_size]
        
        try:
            rewritten_batch = rewrite_bullet_batch(batch, job_description, tone)
            results.extend(rewritten_batch)
        except Exception as e:
            print(f"Error rewriting batch {i//batch_size + 1}: {e}")
            # Add original bullets as fallback
            for bullet in batch:
                results.append(BulletRewrite(
                    original=bullet,
                    rewritten=bullet,
                    changes=["Error: Could not rewrite"],
                    confidence=0.0
                ))
    
    return results


def rewrite_bullet_batch(
    bullets: List[str],
    job_description: str,
    tone: str
) -> List[BulletRewrite]:
    """Rewrite a small batch of bullets"""
    
    # Create prompt
    bullets_text = "\n".join([f"{i+1}. {bullet}" for i, bullet in enumerate(bullets)])
    
    prompt = f"""Rewrite these resume bullet points to be more impactful and {tone}.

Job Context:
{job_description[:350]}

Original Bullets:
{bullets_text}

Instructions:
- Start with strong action verbs (Led, Managed, Developed, Implemented, etc.)
- Add quantifiable metrics where possible (%, $, numbers)
- Keep the same meaning but make it more compelling
- Be concise and specific
- Match the job requirements

Rewrite each bullet on a new line, numbered 1., 2., 3., etc."""

    try:
        response = call_ai_rewriter(prompt, max_tokens=300)
        
        # Parse response
        rewritten_bullets = parse_rewritten_bullets(response, bullets)
        
        # Create BulletRewrite objects
        results = []
        for i, (original, rewritten) in enumerate(zip(bullets, rewritten_bullets)):
            changes = identify_changes(original, rewritten)
            results.append(BulletRewrite(
                original=original,
                rewritten=rewritten,
                changes=changes,
                confidence=0.85
            ))
        
        return results
        
    except Exception as e:
        print(f"Error in rewrite_bullet_batch: {e}")
        raise


def call_ai_rewriter(prompt: str, max_tokens: int = 300) -> str:
    """Call AI service for bullet rewriting"""
    return generate_text(
        prompt=prompt,
        model=GEMINI_MODEL,
        max_tokens=max_tokens,
        temperature=0.7,
        timeout=90
    )


def parse_rewritten_bullets(response: str, original_bullets: List[str]) -> List[str]:
    """Parse Ollama response into individual bullets"""
    lines = response.split('\n')
    rewritten = []
    
    for line in lines:
        line = line.strip()
        # Look for numbered bullets
        if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
            # Remove numbering and bullet markers
            bullet = line.lstrip('0123456789.-•* ').strip()
            if bullet and len(bullet) > 20:  # Minimum length check
                rewritten.append(bullet)
    
    # If we didn't get enough bullets, pad with originals
    while len(rewritten) < len(original_bullets):
        idx = len(rewritten)
        if idx < len(original_bullets):
            rewritten.append(original_bullets[idx])
    
    # Trim to match original count
    return rewritten[:len(original_bullets)]


def identify_changes(original: str, rewritten: str) -> List[str]:
    """Identify what changed between original and rewritten"""
    changes = []
    
    original_lower = original.lower()
    rewritten_lower = rewritten.lower()
    
    # Check for action verb improvement
    action_verbs = ['led', 'managed', 'developed', 'created', 'implemented', 
                    'designed', 'improved', 'increased', 'reduced', 'achieved',
                    'optimized', 'streamlined', 'spearheaded', 'orchestrated']
    
    original_has_action = any(original_lower.startswith(verb) for verb in action_verbs)
    rewritten_has_action = any(rewritten_lower.startswith(verb) for verb in action_verbs)
    
    if not original_has_action and rewritten_has_action:
        changes.append("Added strong action verb")
    elif original_has_action and rewritten_has_action:
        # Check if verb changed
        orig_verb = next((v for v in action_verbs if original_lower.startswith(v)), None)
        new_verb = next((v for v in action_verbs if rewritten_lower.startswith(v)), None)
        if orig_verb != new_verb:
            changes.append("Improved action verb")
    
    # Check for quantification
    import re
    original_has_numbers = bool(re.search(r'\d+', original))
    rewritten_has_numbers = bool(re.search(r'\d+', rewritten))
    
    if not original_has_numbers and rewritten_has_numbers:
        changes.append("Added quantifiable metrics")
    elif rewritten_has_numbers and original_has_numbers:
        # Count numbers
        orig_nums = len(re.findall(r'\d+', original))
        new_nums = len(re.findall(r'\d+', rewritten))
        if new_nums > orig_nums:
            changes.append("Added more metrics")
    
    # Check for impact words
    impact_words = ['increased', 'reduced', 'improved', 'enhanced', 'optimized', 
                    'achieved', 'delivered', 'generated', 'saved']
    
    original_has_impact = any(word in original_lower for word in impact_words)
    rewritten_has_impact = any(word in rewritten_lower for word in impact_words)
    
    if not original_has_impact and rewritten_has_impact:
        changes.append("Emphasized results and impact")
    
    # Check for conciseness
    if len(rewritten) < len(original) * 0.85:
        changes.append("Made more concise")
    elif len(rewritten) > len(original) * 1.15:
        changes.append("Added more detail")
    
    # Check for specificity
    specific_words = ['specific', 'particular', 'detailed', 'comprehensive', 'extensive']
    if any(word in rewritten_lower for word in specific_words):
        changes.append("Increased specificity")
    
    # Default if no specific changes detected
    if not changes:
        changes.append("Enhanced clarity and professionalism")
    
    return changes[:3]  # Limit to top 3 changes


def check_ai_rewriter_available() -> bool:
    """Check if AI service is available for rewriting"""
    return check_ai_available()
