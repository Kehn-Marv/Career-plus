"""
Bias detection module
Identifies potentially biased language in resumes and suggests neutral alternatives
"""

from typing import List, Dict
import re

# Enhanced bias dictionary with expanded categories
BIAS_PATTERNS = {
    "gender": {
        # Gender-specific terms
        "he/she": {"suggestion": "they", "reason": "Use gender-neutral pronouns", "confidence": 0.9},
        "his/her": {"suggestion": "their", "reason": "Use gender-neutral pronouns", "confidence": 0.9},
        "him/her": {"suggestion": "them", "reason": "Use gender-neutral pronouns", "confidence": 0.9},
        "himself/herself": {"suggestion": "themselves", "reason": "Use gender-neutral pronouns", "confidence": 0.9},
        "salesman": {"suggestion": "salesperson", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "saleswoman": {"suggestion": "salesperson", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "chairman": {"suggestion": "chairperson", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "chairwoman": {"suggestion": "chairperson", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "businessman": {"suggestion": "businessperson", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "businesswoman": {"suggestion": "businessperson", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "manpower": {"suggestion": "workforce", "reason": "Use gender-neutral terms", "confidence": 0.95},
        "man-hours": {"suggestion": "work hours", "reason": "Use gender-neutral terms", "confidence": 0.95},
        "guys": {"suggestion": "team", "reason": "Use gender-neutral terms for groups", "confidence": 0.8},
        "waitress": {"suggestion": "server", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "waiter": {"suggestion": "server", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "stewardess": {"suggestion": "flight attendant", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "policeman": {"suggestion": "police officer", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "policewoman": {"suggestion": "police officer", "reason": "Use gender-neutral job titles", "confidence": 1.0},
        "fireman": {"suggestion": "firefighter", "reason": "Use gender-neutral job titles", "confidence": 1.0},
    },
    "age": {
        # Age-related terms
        "young": {"suggestion": "energetic", "reason": "Avoid age references", "confidence": 0.7},
        "youthful": {"suggestion": "dynamic", "reason": "Avoid age references", "confidence": 0.8},
        "mature": {"suggestion": "experienced", "reason": "Avoid age references", "confidence": 0.7},
        "senior": {"suggestion": "experienced", "reason": "Avoid age references unless referring to job level", "confidence": 0.6},
        "junior": {"suggestion": "entry-level", "reason": "Use level-based terms", "confidence": 0.6},
        "recent graduate": {"suggestion": "new professional", "reason": "Focus on skills, not graduation timing", "confidence": 0.8},
        "digital native": {"suggestion": "tech-savvy", "reason": "Avoid generational stereotypes", "confidence": 0.9},
        "millennial": {"suggestion": "professional", "reason": "Avoid generational labels", "confidence": 0.9},
        "gen z": {"suggestion": "professional", "reason": "Avoid generational labels", "confidence": 0.9},
        "baby boomer": {"suggestion": "experienced professional", "reason": "Avoid generational labels", "confidence": 0.9},
        "old": {"suggestion": "experienced", "reason": "Avoid age references", "confidence": 0.95},
        "elderly": {"suggestion": "experienced", "reason": "Avoid age references", "confidence": 0.95},
    },
    "race": {
        # Race/ethnicity bias
        "native english speaker": {"suggestion": "fluent in English", "reason": "Focus on proficiency, not origin", "confidence": 0.9},
        "native speaker": {"suggestion": "fluent", "reason": "Focus on proficiency, not origin", "confidence": 0.85},
        "articulate": {"suggestion": "clear communicator", "reason": "Can carry racial undertones", "confidence": 0.6},
        "urban": {"suggestion": "city", "reason": "Can carry racial undertones in some contexts", "confidence": 0.5},
        "diverse": {"suggestion": "varied", "reason": "Be specific about what varies", "confidence": 0.6},
        "minority": {"suggestion": "underrepresented", "reason": "Use more specific terms", "confidence": 0.7},
        "exotic": {"suggestion": "unique", "reason": "Can carry racial undertones", "confidence": 0.8},
    },
    "disability": {
        # Disability/ableist language
        "crazy": {"suggestion": "intense", "reason": "Avoid ableist language", "confidence": 0.8},
        "insane": {"suggestion": "remarkable", "reason": "Avoid ableist language", "confidence": 0.8},
        "blind to": {"suggestion": "unaware of", "reason": "Avoid ableist language", "confidence": 0.9},
        "deaf to": {"suggestion": "ignored", "reason": "Avoid ableist language", "confidence": 0.9},
        "lame": {"suggestion": "weak", "reason": "Avoid ableist language", "confidence": 0.9},
        "dumb": {"suggestion": "ineffective", "reason": "Avoid ableist language", "confidence": 0.9},
        "crippled": {"suggestion": "limited", "reason": "Avoid ableist language", "confidence": 1.0},
        "handicapped": {"suggestion": "person with disability", "reason": "Use person-first language", "confidence": 0.9},
        "wheelchair-bound": {"suggestion": "wheelchair user", "reason": "Use person-first language", "confidence": 0.95},
        "suffers from": {"suggestion": "has", "reason": "Avoid victimizing language", "confidence": 0.85},
    },
    "religion": {
        # Religious bias
        "christian values": {"suggestion": "ethical values", "reason": "Use secular terms", "confidence": 0.9},
        "god-fearing": {"suggestion": "principled", "reason": "Use secular terms", "confidence": 0.95},
        "blessed": {"suggestion": "fortunate", "reason": "Use secular terms", "confidence": 0.7},
    },
    "marital_status": {
        # Marital status
        "married": {"suggestion": "[remove]", "reason": "Marital status is not relevant", "confidence": 0.95},
        "single": {"suggestion": "[remove]", "reason": "Marital status is not relevant", "confidence": 0.95},
        "divorced": {"suggestion": "[remove]", "reason": "Marital status is not relevant", "confidence": 0.95},
    },
    "socioeconomic": {
        # Socioeconomic bias
        "privileged": {"suggestion": "advantaged", "reason": "Can imply class bias", "confidence": 0.6},
        "underprivileged": {"suggestion": "underserved", "reason": "Can imply class bias", "confidence": 0.7},
        "ghetto": {"suggestion": "neighborhood", "reason": "Avoid classist language", "confidence": 0.95},
        "trailer park": {"suggestion": "community", "reason": "Avoid classist language", "confidence": 0.9},
    },
    "other": {
        # Unnecessarily gendered perceptions
        "aggressive": {"suggestion": "assertive", "reason": "Can be perceived differently by gender", "confidence": 0.6},
        "bossy": {"suggestion": "leadership-oriented", "reason": "Often used negatively for women", "confidence": 0.85},
        "emotional": {"suggestion": "passionate", "reason": "Can be perceived differently by gender", "confidence": 0.6},
        "shrill": {"suggestion": "emphatic", "reason": "Often used negatively for women", "confidence": 0.9},
        "feisty": {"suggestion": "spirited", "reason": "Can be condescending", "confidence": 0.8},
        "bubbly": {"suggestion": "enthusiastic", "reason": "Can be diminishing", "confidence": 0.75},
    }
}


def detect_bias(text: str) -> List[Dict]:
    """
    Detect biased language in text
    
    Args:
        text: Text to analyze
        
    Returns:
        List of detected biased phrases with suggestions
    """
    text_lower = text.lower()
    detected = []
    
    for category, patterns in BIAS_PATTERNS.items():
        for phrase, info in patterns.items():
            # Use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(phrase) + r'\b'
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            
            for match in matches:
                # Get the original case version
                original_text = text[match.start():match.end()]
                
                # Get surrounding context for better detection
                context_start = max(0, match.start() - 30)
                context_end = min(len(text), match.end() + 30)
                context = text[context_start:context_end]
                
                detected.append({
                    "original": original_text,
                    "suggestion": info["suggestion"],
                    "reason": info["reason"],
                    "category": category,
                    "confidence": info.get("confidence", 0.8),
                    "context": context.strip(),
                    "position": match.start()
                })
    
    # Remove duplicates and sort by position
    seen = set()
    unique_detected = []
    for item in detected:
        key = (item["original"].lower(), item["suggestion"])
        if key not in seen:
            seen.add(key)
            unique_detected.append(item)
    
    unique_detected.sort(key=lambda x: x["position"])
    
    # Remove position from output, keep confidence and context
    for item in unique_detected:
        del item["position"]
    
    return unique_detected


def calculate_bias_score(biased_phrases: List[Dict], text_length: int) -> float:
    """
    Calculate bias score based on number and severity of biased phrases
    
    Args:
        biased_phrases: List of detected biased phrases
        text_length: Length of text in characters
        
    Returns:
        Bias score from 0 (no bias) to 100 (high bias)
    """
    if not biased_phrases:
        return 0.0
    
    # Weight by category severity
    category_weights = {
        "gender": 3.0,
        "age": 2.5,
        "race": 3.5,
        "disability": 3.0,
        "religion": 3.5,
        "marital_status": 4.0,
        "socioeconomic": 2.5,
        "other": 2.0
    }
    
    total_weight = sum(
        category_weights.get(phrase["category"], 2.0)
        for phrase in biased_phrases
    )
    
    # Normalize by text length (per 1000 characters)
    normalized_score = (total_weight / (text_length / 1000)) * 10
    
    # Cap at 100
    return min(100.0, normalized_score)


def analyze_bias(text: str) -> Dict:
    """
    Analyze text for bias and return comprehensive results
    
    Args:
        text: Text to analyze
        
    Returns:
        Dictionary with biased_phrases and bias_score
    """
    biased_phrases = detect_bias(text)
    bias_score = calculate_bias_score(biased_phrases, len(text))
    
    return {
        "biased_phrases": biased_phrases,
        "bias_score": round(bias_score, 2)
    }
