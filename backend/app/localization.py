"""
Localization module
Provides region-specific resume formatting and terminology advice
"""

from typing import List, Dict

# Region-specific guidelines
REGION_GUIDELINES = {
    "US": {
        "format": [
            "Do NOT include photo, age, marital status, or nationality",
            "Use month/day/year date format (e.g., 12/25/2023) or 'Month YYYY'",
            "Keep resume to 1-2 pages maximum (1 page preferred for <10 years experience)",
            "Use 'Resume' as document title, not 'CV'",
            "Include GPA if above 3.5 and recent graduate (within 2 years)",
            "List education after experience (unless recent graduate)",
            "Use letter-size paper (8.5\" x 11\")",
            "Avoid headers and footers (ATS compatibility)",
            "Use standard fonts: Arial, Calibri, Times New Roman",
        ],
        "terminology": {
            "CV": "Resume",
            "Mobile": "Cell phone",
            "Post": "Position",
            "Holiday": "Vacation",
            "Redundancy": "Layoff",
            "Whilst": "While",
            "Amongst": "Among",
            "Programme": "Program",
            "Organised": "Organized",
            "Specialised": "Specialized",
        },
        "sections": [
            "Contact Information",
            "Professional Summary (optional)",
            "Work Experience",
            "Education",
            "Skills",
            "Certifications (if applicable)"
        ],
        "date_format": "MM/DD/YYYY or Month YYYY",
        "cultural_notes": [
            "Emphasize quantifiable achievements and metrics",
            "Use action verbs to start bullet points",
            "Focus on individual contributions and results",
            "Keep tone professional but confident",
        ]
    },
    "UK": {
        "format": [
            "Photo optional (not common, but acceptable)",
            "Use day/month/year date format (e.g., 25/12/2023) or 'Month YYYY'",
            "Can be 2-3 pages (2 pages is standard)",
            "Use 'CV' (Curriculum Vitae) as document title",
            "Include nationality if relevant for work authorization",
            "Education typically listed before experience",
            "Use A4 paper size",
            "Include postcode in address",
            "References section expected (can say 'available upon request')",
        ],
        "terminology": {
            "Resume": "CV",
            "Cell phone": "Mobile",
            "Position": "Post",
            "Vacation": "Holiday",
            "Layoff": "Redundancy",
            "While": "Whilst",
            "Among": "Amongst",
            "Program": "Programme",
            "Organized": "Organised",
            "Specialized": "Specialised",
            "Analyze": "Analyse",
            "License": "Licence",
        },
        "sections": [
            "Personal Details",
            "Personal Profile",
            "Education",
            "Work Experience / Employment History",
            "Skills",
            "References"
        ],
        "date_format": "DD/MM/YYYY or Month YYYY",
        "cultural_notes": [
            "Use British English spelling throughout",
            "Tone should be modest and factual",
            "Emphasize team contributions alongside individual achievements",
            "Include professional memberships if relevant",
        ]
    },
    "EU": {
        "format": [
            "Photo often expected (professional headshot, country-dependent)",
            "Use day/month/year date format (e.g., 25.12.2023 or 25/12/2023)",
            "Can be 2-3 pages",
            "Consider Europass CV format for standardization",
            "Include date of birth, nationality, place of birth (often expected)",
            "Language skills section is critical - use CEFR levels (A1-C2)",
            "Use A4 paper size",
            "Include full address with country",
            "Marital status may be included (country-dependent)",
        ],
        "terminology": {
            "Resume": "CV, Lebenslauf (DE), Curriculum Vitae",
            "Skills": "Competencies / Kompetenzen (DE)",
            "Work Experience": "Professional Experience / Berufserfahrung (DE)",
            "Education": "Education / Ausbildung (DE)",
        },
        "sections": [
            "Personal Information",
            "Professional Summary / Objective",
            "Education",
            "Work Experience",
            "Language Skills (with CEFR levels)",
            "Technical Skills / Competencies",
            "Additional Information",
            "References"
        ],
        "date_format": "DD.MM.YYYY or DD/MM/YYYY",
        "cultural_notes": [
            "Emphasize formal qualifications and certifications",
            "List language proficiency using CEFR framework (A1-C2)",
            "Include all relevant training and professional development",
            "Chronological order is strongly preferred",
            "Be thorough and detailed - comprehensiveness is valued",
        ]
    },
    "APAC": {
        "format": [
            "Photo typically required (professional headshot, business attire)",
            "Use day/month/year date format (e.g., 25/12/2023)",
            "Can be 2-3 pages",
            "Include date of birth, nationality, marital status, gender",
            "Education listed first (especially in China, Japan, Korea, Singapore)",
            "References may be expected on CV (especially in Singapore, Australia)",
            "Use A4 paper size",
            "Include full address",
            "May include race/ethnicity in some countries (Malaysia, Singapore)",
        ],
        "terminology": {
            "Resume": "CV or Resume (both accepted)",
            "Cell phone": "Mobile / Handphone (Singapore)",
            "Vacation": "Leave / Annual Leave",
        },
        "sections": [
            "Personal Particulars / Personal Information",
            "Career Objective (common in East Asia)",
            "Education / Academic Qualifications",
            "Work Experience / Employment History",
            "Skills & Competencies",
            "Languages",
            "Co-curricular Activities (for recent graduates)",
            "References"
        ],
        "date_format": "DD/MM/YYYY",
        "cultural_notes": [
            "Emphasize educational credentials and institution prestige",
            "Include all relevant certifications and training",
            "Respect for hierarchy - mention reporting relationships",
            "Team harmony and collaboration are valued",
            "Include career objective for junior to mid-level positions",
            "List references with full contact details (if requested)",
        ]
    }
}


def get_localization_advice(resume_text: str, target_region: str) -> Dict:
    """
    Generate localization advice for target region
    
    Args:
        resume_text: Resume text to analyze
        target_region: Target region (US, UK, EU, APAC)
        
    Returns:
        Dictionary with recommendations and format changes
    """
    if target_region not in REGION_GUIDELINES:
        raise ValueError(f"Unsupported region: {target_region}")
    
    guidelines = REGION_GUIDELINES[target_region]
    recommendations = []
    format_changes = guidelines["format"].copy()
    terminology_changes = []
    
    # Check for terminology that should be changed
    resume_lower = resume_text.lower()
    for source_term, target_term in guidelines["terminology"].items():
        if source_term.lower() in resume_lower:
            terminology_changes.append({
                "from": source_term,
                "to": target_term,
                "reason": f"Use '{target_term}' in {target_region} resumes"
            })
    
    # Region-specific recommendations
    if target_region == "US":
        if any(word in resume_lower for word in ["photo", "picture", "image"]):
            recommendations.append("Remove photo - not standard in US resumes and may introduce bias")
        
        if any(word in resume_lower for word in ["age", "born", "date of birth"]):
            recommendations.append("Remove age/date of birth - illegal to request in US")
        
        if any(word in resume_lower for word in ["marital", "married", "single"]):
            recommendations.append("Remove marital status - not relevant in US resumes")
    
    elif target_region == "UK":
        recommendations.append("Consider adding 'References available upon request' at the end")
        recommendations.append("Use British English spelling (e.g., 'organised' not 'organized')")
    
    elif target_region == "EU":
        recommendations.append("Consider using Europass CV format for EU applications")
        recommendations.append("Emphasize language skills - multilingualism is highly valued")
        if "language" not in resume_lower:
            recommendations.append("Add a dedicated 'Language Skills' section")
    
    elif target_region == "APAC":
        recommendations.append("Include professional photo (headshot, business attire)")
        recommendations.append("List education before work experience if applying in East Asia")
        if "objective" not in resume_lower:
            recommendations.append("Consider adding a 'Career Objective' section at the top")
        recommendations.append("Include personal particulars: DOB, nationality, marital status")
    
    # Add cultural notes
    if "cultural_notes" in guidelines:
        recommendations.extend([f"Cultural tip: {note}" for note in guidelines["cultural_notes"][:2]])
    
    # Add date format recommendation
    if "date_format" in guidelines:
        recommendations.append(f"Use {guidelines['date_format']} date format consistently")
    
    return {
        "recommendations": recommendations,
        "format_changes": format_changes,
        "terminology_changes": terminology_changes,
        "target_region": target_region,
        "date_format": guidelines.get("date_format", ""),
        "cultural_notes": guidelines.get("cultural_notes", [])
    }
