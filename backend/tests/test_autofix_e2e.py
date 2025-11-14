"""
End-to-end tests for the auto-fix workflow
Tests complete flow from API request to PDF generation
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Mock WeasyPrint before importing app
import sys
mock_weasyprint = MagicMock()
sys.modules['weasyprint'] = mock_weasyprint
sys.modules['weasyprint.text'] = MagicMock()
sys.modules['weasyprint.text.ffi'] = MagicMock()

from app.main import app

client = TestClient(app)


# Sample test data
SAMPLE_RESUME = {
    "summary": "Experienced software engineer with 5 years of experience",
    "experience": [
        {
            "title": "Software Engineer",
            "company": "Tech Corp",
            "location": "San Francisco, CA",
            "dates": "2020 - Present",
            "description": [
                "Worked on backend systems",
                "Helped with database optimization"
            ]
        }
    ],
    "education": [
        {
            "degree": "BS Computer Science",
            "school": "University of California",
            "location": "Berkeley, CA",
            "dates": "2015 - 2019"
        }
    ],
    "skills": ["Python", "JavaScript", "SQL"]
}

SAMPLE_ATS_ISSUES = [
    {
        "id": "issue-1",
        "severity": "critical",
        "title": "Weak action verbs",
        "description": "Using passive language like 'Worked on' and 'Helped with'",
        "suggestion": "Replace with strong action verbs like 'Developed', 'Optimized'"
    },
    {
        "id": "issue-2",
        "severity": "warning",
        "title": "Missing keywords",
        "description": "Resume lacks important technical keywords",
        "suggestion": "Add keywords: REST API, microservices, cloud computing"
    }
]

SAMPLE_RECOMMENDATIONS = [
    {
        "id": "rec-1",
        "type": "content",
        "priority": "high",
        "suggestedText": "Add quantifiable metrics to achievements",
        "explanation": "Numbers make impact more concrete",
        "impact": 8
    },
    {
        "id": "rec-2",
        "type": "keyword",
        "priority": "high",
        "suggestedText": "Include: REST API, microservices, Docker",
        "explanation": "These keywords match the job description",
        "impact": 9
    }
]

SAMPLE_JOB_DESCRIPTION = """
Senior Software Engineer position requiring expertise in Python, 
REST API development, microservices architecture, and cloud computing.
Looking for someone with strong backend development experience.
"""


class TestAutoFixE2E:
    """End-to-end tests for auto-fix workflow"""
    
    def test_complete_autofix_workflow(self):
        """Test 15.1: Complete auto-fix flow from request to optimized resume"""
        # Step 1: Call auto-fix endpoint
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": SAMPLE_RESUME,
                "ats_issues": SAMPLE_ATS_ISSUES,
                "recommendations": SAMPLE_RECOMMENDATIONS,
                "job_description": SAMPLE_JOB_DESCRIPTION,
                "options": {}
            }
        )
        
        # Verify response
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "optimized_resume" in data
        assert "applied_fixes" in data
        assert "improvement_metrics" in data
        assert "processing_time" in data
        
        # Verify optimized resume has required sections
        optimized = data["optimized_resume"]
        assert "summary" in optimized
        assert "experience" in optimized
        assert "education" in optimized
        assert "skills" in optimized
        
        # Verify improvements were made
        assert len(data["applied_fixes"]) > 0
        assert data["processing_time"] > 0
        
        # Verify content improvements
        # Should have stronger action verbs
        experience_desc = optimized["experience"][0]["description"]
        assert any("Developed" in desc or "Optimized" in desc or "Implemented" in desc 
                   for desc in experience_desc), "Should use strong action verbs"
        
        # Should have added keywords
        resume_text = json.dumps(optimized).lower()
        assert "api" in resume_text or "microservices" in resume_text, "Should include relevant keywords"
        
        print(f"✅ Auto-fix completed in {data['processing_time']:.2f}s")
        print(f"✅ Applied {len(data['applied_fixes'])} fixes")
    
    def test_pdf_generation_workflow(self):
        """Test 15.1: PDF generation from optimized resume"""
        # First optimize the resume
        autofix_response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": SAMPLE_RESUME,
                "ats_issues": SAMPLE_ATS_ISSUES,
                "recommendations": SAMPLE_RECOMMENDATIONS,
                "job_description": SAMPLE_JOB_DESCRIPTION
            }
        )
        
        assert autofix_response.status_code == 200
        optimized_resume = autofix_response.json()["optimized_resume"]
        
        # Step 2: Generate PDF
        pdf_response = client.post(
            "/api/generate-pdf",
            json={
                "resume_json": optimized_resume,
                "template_id": "professional",
                "options": {}
            }
        )
        
        # Verify PDF generation
        assert pdf_response.status_code == 200
        assert pdf_response.headers["content-type"] == "application/pdf"
        assert len(pdf_response.content) > 0
        
        # Verify PDF is valid (starts with PDF magic number)
        assert pdf_response.content[:4] == b'%PDF', "Should be a valid PDF file"
        
        print(f"✅ PDF generated successfully ({len(pdf_response.content)} bytes)")
    
    def test_various_resume_types(self):
        """Test 15.1: Test with various resume types and lengths"""
        test_cases = [
            {
                "name": "Short resume (1 job)",
                "resume": SAMPLE_RESUME
            },
            {
                "name": "Long resume (multiple jobs)",
                "resume": {
                    **SAMPLE_RESUME,
                    "experience": [
                        {
                            "title": f"Position {i}",
                            "company": f"Company {i}",
                            "location": "City, State",
                            "dates": f"{2015+i} - {2016+i}",
                            "description": [
                                f"Responsibility {j}" for j in range(5)
                            ]
                        }
                        for i in range(5)
                    ]
                }
            },
            {
                "name": "Resume with certifications",
                "resume": {
                    **SAMPLE_RESUME,
                    "certifications": [
                        "AWS Certified Solutions Architect",
                        "Google Cloud Professional"
                    ]
                }
            }
        ]
        
        for test_case in test_cases:
            response = client.post(
                "/api/auto-fix",
                json={
                    "resume_json": test_case["resume"],
                    "ats_issues": SAMPLE_ATS_ISSUES,
                    "recommendations": SAMPLE_RECOMMENDATIONS,
                    "job_description": SAMPLE_JOB_DESCRIPTION
                }
            )
            
            assert response.status_code == 200, f"Failed for {test_case['name']}"
            data = response.json()
            assert "optimized_resume" in data
            
            print(f"✅ {test_case['name']}: Success")
    
    def test_ats_score_improvements(self):
        """Test 15.1: Verify ATS score improvements after optimization"""
        # This test verifies that the optimization actually improves the resume
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": SAMPLE_RESUME,
                "ats_issues": SAMPLE_ATS_ISSUES,
                "recommendations": SAMPLE_RECOMMENDATIONS,
                "job_description": SAMPLE_JOB_DESCRIPTION
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify improvement metrics exist
        metrics = data["improvement_metrics"]
        assert "keywords_added" in metrics or "content_enhancements" in metrics
        
        # Verify fixes were applied
        assert len(data["applied_fixes"]) >= len(SAMPLE_ATS_ISSUES)
        
        print(f"✅ Improvements verified: {data['applied_fixes']}")
    
    def test_processing_time_performance(self):
        """Test 15.1: Verify processing completes in reasonable time"""
        import time
        
        start_time = time.time()
        
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": SAMPLE_RESUME,
                "ats_issues": SAMPLE_ATS_ISSUES,
                "recommendations": SAMPLE_RECOMMENDATIONS,
                "job_description": SAMPLE_JOB_DESCRIPTION
            }
        )
        
        end_time = time.time()
        elapsed = end_time - start_time
        
        assert response.status_code == 200
        assert elapsed < 30, f"Processing took {elapsed:.2f}s, should be under 30s"
        
        print(f"✅ Processing completed in {elapsed:.2f}s (under 30s requirement)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
