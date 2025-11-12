"""
ATS Compatibility Analyzer
Detects issues that prevent resumes from being parsed correctly by ATS systems
"""

from typing import List, Dict, Any
from enum import Enum
import re


class ATSIssueSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class ATSIssue:
    """Represents a single ATS compatibility issue"""
    
    def __init__(
        self,
        id: str,
        severity: ATSIssueSeverity,
        title: str,
        description: str,
        suggestion: str,
        location: Dict[str, Any] = None
    ):
        self.id = id
        self.severity = severity
        self.title = title
        self.description = description
        self.suggestion = suggestion
        self.location = location or {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "severity": self.severity.value,
            "title": self.title,
            "description": self.description,
            "suggestion": self.suggestion,
            "location": self.location
        }


def analyze_ats_compatibility(resume_text: str) -> Dict[str, Any]:
    """
    Analyze resume for ATS compatibility issues
    
    Args:
        resume_text: Full text of the resume
    
    Returns:
        Dictionary with ats_score and list of issues
    """
    issues: List[ATSIssue] = []
    
    # Run all detection checks
    issues.extend(detect_table_usage(resume_text))
    issues.extend(detect_special_characters(resume_text))
    issues.extend(detect_header_footer_issues(resume_text))
    issues.extend(detect_formatting_issues(resume_text))
    issues.extend(detect_missing_sections(resume_text))
    issues.extend(detect_keyword_optimization(resume_text))
    
    # Calculate ATS score
    ats_score = calculate_ats_score(issues)
    
    return {
        "ats_score": ats_score,
        "issues": [issue.to_dict() for issue in issues]
    }


def calculate_ats_score(issues: List[ATSIssue]) -> float:
    """Calculate overall ATS score based on issues found"""
    score = 100.0
    
    # Deduct points based on severity
    for issue in issues:
        if issue.severity == ATSIssueSeverity.CRITICAL:
            score -= 15
        elif issue.severity == ATSIssueSeverity.WARNING:
            score -= 8
        elif issue.severity == ATSIssueSeverity.INFO:
            score -= 3
    
    return max(0.0, min(100.0, score))


def detect_table_usage(text: str) -> List[ATSIssue]:
    """Detect table or column formatting"""
    issues = []
    
    # Look for table indicators
    has_table = False
    
    # Check for markdown-style tables
    if re.search(r'\|.*\|.*\|', text):
        has_table = True
    
    # Check for tab-separated columns
    if re.search(r'\t.*\t.*\t', text):
        has_table = True
    
    # Check for excessive spacing (column indicators)
    lines = text.split('\n')
    for line in lines:
        if re.search(r'\s{10,}', line):  # 10+ consecutive spaces
            has_table = True
            break
    
    if has_table:
        issues.append(ATSIssue(
            id="ats-table-usage",
            severity=ATSIssueSeverity.CRITICAL,
            title="Table Formatting Detected",
            description="Your resume appears to use tables or columns, which many ATS systems cannot parse correctly.",
            suggestion="Convert tables to simple bullet points or linear text format. Use standard sections with clear headings instead of multi-column layouts."
        ))
    
    return issues


def detect_special_characters(text: str) -> List[ATSIssue]:
    """Detect problematic special characters"""
    issues = []
    
    # Problematic characters for ATS
    problematic_chars = {
        '•': 'bullet points',
        '→': 'arrows',
        '★': 'stars',
        '◆': 'diamonds',
        '§': 'section symbols',
        '©': 'copyright symbols',
        '®': 'registered symbols',
        '™': 'trademark symbols'
    }
    
    found_chars = []
    for char, name in problematic_chars.items():
        if char in text:
            found_chars.append(name)
    
    if found_chars:
        issues.append(ATSIssue(
            id="ats-special-chars",
            severity=ATSIssueSeverity.WARNING,
            title="Special Characters Detected",
            description=f"Your resume contains special characters ({', '.join(found_chars)}) that may not be recognized by ATS systems.",
            suggestion="Replace special characters with standard ASCII characters. Use hyphens (-) for bullet points and asterisks (*) for emphasis."
        ))
    
    return issues


def detect_header_footer_issues(text: str) -> List[ATSIssue]:
    """Detect if contact info might be in header/footer"""
    issues = []
    
    lines = text.split('\n')
    first_few_lines = ' '.join(lines[:5]).lower()
    
    # Check if contact info is present in top of document
    has_email = '@' in first_few_lines
    has_phone = bool(re.search(r'\d{3}[-.]?\d{3}[-.]?\d{4}', first_few_lines))
    
    if not (has_email or has_phone):
        issues.append(ATSIssue(
            id="ats-missing-contact",
            severity=ATSIssueSeverity.CRITICAL,
            title="Contact Information Not Found",
            description="Contact information should be clearly visible in the main body of your resume, not in headers or footers.",
            suggestion="Place your name, phone number, email, and location at the top of your resume in the main document body. Avoid using headers or footers for critical information."
        ))
    
    return issues


def detect_formatting_issues(text: str) -> List[ATSIssue]:
    """Detect formatting inconsistencies"""
    issues = []
    
    # Check for inconsistent date formats
    date_formats = [
        r'\d{1,2}/\d{1,2}/\d{2,4}',  # MM/DD/YYYY
        r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
        r'[A-Za-z]+\s+\d{4}',  # Month YYYY
    ]
    
    found_formats = sum(1 for pattern in date_formats if re.search(pattern, text))
    
    if found_formats > 1:
        issues.append(ATSIssue(
            id="ats-inconsistent-dates",
            severity=ATSIssueSeverity.WARNING,
            title="Inconsistent Date Formatting",
            description="Your resume uses multiple date formats, which can confuse ATS parsers.",
            suggestion="Use a consistent date format throughout your resume. Recommended: 'Month YYYY' (e.g., 'January 2023') or 'MM/YYYY'."
        ))
    
    # Check for excessive line breaks
    if re.search(r'\n\n\n+', text):
        issues.append(ATSIssue(
            id="ats-excessive-breaks",
            severity=ATSIssueSeverity.INFO,
            title="Excessive Line Breaks",
            description="Multiple consecutive blank lines can disrupt ATS parsing.",
            suggestion="Use single blank lines to separate sections. Remove excessive whitespace."
        ))
    
    return issues


def detect_missing_sections(text: str) -> List[ATSIssue]:
    """Detect missing standard resume sections"""
    issues = []
    lower_text = text.lower()
    
    # Standard resume sections
    standard_sections = [
        {
            'name': 'Experience',
            'keywords': ['experience', 'work history', 'employment', 'professional experience']
        },
        {
            'name': 'Education',
            'keywords': ['education', 'academic', 'degree', 'university', 'college']
        },
        {
            'name': 'Skills',
            'keywords': ['skills', 'technical skills', 'competencies', 'expertise']
        }
    ]
    
    missing_sections = []
    
    for section in standard_sections:
        has_section = any(keyword in lower_text for keyword in section['keywords'])
        if not has_section:
            missing_sections.append(section['name'])
    
    if missing_sections:
        issues.append(ATSIssue(
            id="ats-missing-sections",
            severity=ATSIssueSeverity.WARNING,
            title="Missing Standard Sections",
            description=f"Your resume is missing standard sections: {', '.join(missing_sections)}. ATS systems look for these sections.",
            suggestion="Include clearly labeled sections for Experience, Education, and Skills. Use standard section headers that ATS systems recognize."
        ))
    
    return issues


def detect_keyword_optimization(text: str) -> List[ATSIssue]:
    """Detect keyword optimization opportunities"""
    issues = []
    
    # Check if skills are in bullet points
    skills_match = re.search(r'skills?:(.+?)(?=\n\n|\n[A-Z]|$)', text, re.IGNORECASE | re.DOTALL)
    if skills_match:
        skills_text = skills_match.group(1)
        has_bullets = bool(re.search(r'[-•*]\s', skills_text))
        
        if not has_bullets:
            issues.append(ATSIssue(
                id="ats-skills-format",
                severity=ATSIssueSeverity.INFO,
                title="Skills Section Formatting",
                description="Your skills section would be more ATS-friendly with bullet points.",
                suggestion="Format your skills as a bulleted list. This helps ATS systems identify and extract individual skills more accurately."
            ))
    
    # Check for action verbs
    action_verbs = ['led', 'managed', 'developed', 'created', 'implemented', 
                    'designed', 'improved', 'increased', 'reduced', 'achieved']
    has_action_verbs = any(verb in text.lower() for verb in action_verbs)
    
    if not has_action_verbs:
        issues.append(ATSIssue(
            id="ats-action-verbs",
            severity=ATSIssueSeverity.INFO,
            title="Limited Action Verbs",
            description="Your resume could benefit from more strong action verbs, which ATS systems often look for.",
            suggestion="Start your bullet points with strong action verbs like 'Led,' 'Managed,' 'Developed,' 'Implemented,' etc."
        ))
    
    # Check for quantifiable achievements
    has_numbers = bool(re.search(r'\d+%|\$\d+|\d+\+', text))
    if not has_numbers:
        issues.append(ATSIssue(
            id="ats-quantifiable-achievements",
            severity=ATSIssueSeverity.INFO,
            title="Missing Quantifiable Achievements",
            description="Your resume lacks quantifiable metrics, which both ATS and recruiters value.",
            suggestion="Add specific numbers, percentages, or dollar amounts to demonstrate your impact (e.g., 'Increased sales by 25%', 'Managed team of 10')."
        ))
    
    return issues


def get_ats_score_label(score: float) -> str:
    """Get human-readable label for ATS score"""
    if score >= 80:
        return "ATS-Friendly"
    elif score >= 60:
        return "Needs Minor Fixes"
    else:
        return "Needs Major Fixes"
