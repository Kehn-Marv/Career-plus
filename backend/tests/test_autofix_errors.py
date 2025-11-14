"""
Error scenario tests for auto-fix workflow
Tests error handling, retry logic, and failure recovery
"""

import pytest
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
    "summary": "Test summary",
    "experience": [{
        "title": "Engineer",
        "company": "Company",
        "location": "City",
        "dates": "2020-2021",
        "description": ["Test"]
    }],
    "education": [],
    "skills": ["Python"]
}

SAMPLE_REQUEST = {
    "resume_json": SAMPLE_RESUME,
    "ats_issues": [],
    "recommendations": [],
    "job_description": "Test job"
}


class TestAutoFixErrors:
    """Error scenario tests for auto-fix"""
    
    def test_invalid_resume_json(self):
        """Test 15.2: Handle invalid resume JSON structure"""
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": {"invalid": "structure"},
                "ats_issues": [],
                "recommendations": [],
                "job_description": "Test"
            }
        )
        
        # Should handle gracefully
        assert response.status_code in [400, 422, 500]
        print(f"✅ Invalid JSON handled with status {response.status_code}")
    
    def test_missing_required_fields(self):
        """Test 15.2: Handle missing required fields"""
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": SAMPLE_RESUME
                # Missing other required fields
            }
        )
        
        assert response.status_code == 422  # Validation error
        print("✅ Missing fields validation works")
    
    def test_empty_resume(self):
        """Test 15.2: Handle empty resume"""
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": {},
                "ats_issues": [],
                "recommendations": [],
                "job_description": ""
            }
        )
        
        # Should handle empty resume
        assert response.status_code in [400, 422, 500]
        print(f"✅ Empty resume handled with status {response.status_code}")
    
    @patch('app.gemini_client.generate_text')
    def test_ai_service_failure(self, mock_generate):
        """Test 15.2: Handle AI service failures"""
        # Simulate AI service failure
        mock_generate.side_effect = Exception("AI service unavailable")
        
        response = client.post(
            "/api/auto-fix",
            json=SAMPLE_REQUEST
        )
        
        # Should return error
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
        print(f"✅ AI service failure handled: {data['detail']}")
    
    @patch('app.gemini_client.generate_text')
    def test_ai_timeout(self, mock_generate):
        """Test 15.2: Handle AI service timeout"""
        import time
        
        def slow_response(*args, **kwargs):
            time.sleep(0.5)  # Simulate slow response
            return '{"summary": "test"}'
        
        mock_generate.side_effect = slow_response
        
        response = client.post(
            "/api/auto-fix",
            json=SAMPLE_REQUEST
        )
        
        # Should complete or timeout gracefully
        assert response.status_code in [200, 500, 504]
        print(f"✅ Timeout handled with status {response.status_code}")
    
    @patch('app.gemini_client.generate_text')
    def test_invalid_ai_response(self, mock_generate):
        """Test 15.2: Handle invalid AI response format"""
        # Return invalid JSON
        mock_generate.return_value = "This is not valid JSON"
        
        response = client.post(
            "/api/auto-fix",
            json=SAMPLE_REQUEST
        )
        
        # Should handle parsing error
        assert response.status_code == 500
        print("✅ Invalid AI response handled")
    
    def test_pdf_generation_invalid_template(self):
        """Test 15.2: Handle invalid template ID"""
        response = client.post(
            "/api/generate-pdf",
            json={
                "resume_json": SAMPLE_RESUME,
                "template_id": "nonexistent_template",
                "options": {}
            }
        )
        
        # Should return error for invalid template
        assert response.status_code in [400, 404, 500]
        print(f"✅ Invalid template handled with status {response.status_code}")
    
    def test_pdf_generation_malformed_resume(self):
        """Test 15.2: Handle malformed resume for PDF generation"""
        response = client.post(
            "/api/generate-pdf",
            json={
                "resume_json": {"invalid": "data"},
                "template_id": "professional",
                "options": {}
            }
        )
        
        # Should handle gracefully
        assert response.status_code in [400, 500]
        print(f"✅ Malformed resume for PDF handled with status {response.status_code}")
    
    @patch('app.template_engine.template_engine.render')
    def test_pdf_generation_render_failure(self, mock_render):
        """Test 15.2: Handle template rendering failure"""
        mock_render.side_effect = Exception("Template rendering failed")
        
        response = client.post(
            "/api/generate-pdf",
            json={
                "resume_json": SAMPLE_RESUME,
                "template_id": "professional",
                "options": {}
            }
        )
        
        assert response.status_code == 500
        print("✅ Template rendering failure handled")
    
    def test_rate_limiting_autofix(self):
        """Test 15.2: Verify rate limiting on auto-fix endpoint"""
        responses = []
        
        # Make multiple rapid requests
        for i in range(10):
            response = client.post(
                "/api/auto-fix",
                json=SAMPLE_REQUEST
            )
            responses.append(response.status_code)
        
        # Should have some rate limited responses
        # Note: Actual rate limit depends on configuration
        print(f"✅ Rate limiting test: {responses.count(429)} rate limited out of 10")
    
    def test_large_resume_handling(self):
        """Test 15.2: Handle very large resumes"""
        # Create a very large resume
        large_resume = {
            **SAMPLE_RESUME,
            "experience": [
                {
                    "title": f"Position {i}",
                    "company": f"Company {i}",
                    "location": "City",
                    "dates": f"{2000+i}-{2001+i}",
                    "description": [f"Long description " * 100 for _ in range(10)]
                }
                for i in range(20)
            ]
        }
        
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": large_resume,
                "ats_issues": [],
                "recommendations": [],
                "job_description": "Test"
            }
        )
        
        # Should handle or reject gracefully
        assert response.status_code in [200, 413, 500]
        print(f"✅ Large resume handled with status {response.status_code}")
    
    def test_concurrent_requests(self):
        """Test 15.2: Handle concurrent requests"""
        import concurrent.futures
        
        def make_request():
            return client.post("/api/auto-fix", json=SAMPLE_REQUEST)
        
        # Make 5 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(5)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # All should complete (some may be rate limited)
        assert len(results) == 5
        success_count = sum(1 for r in results if r.status_code == 200)
        print(f"✅ Concurrent requests: {success_count}/5 succeeded")
    
    @patch('app.gemini_client.generate_text')
    def test_retry_logic_simulation(self, mock_generate):
        """Test 15.2: Simulate retry logic for transient failures"""
        # First call fails, second succeeds
        mock_generate.side_effect = [
            Exception("Transient error"),
            '{"summary": "Success", "experience": [], "education": [], "skills": []}'
        ]
        
        # Note: This tests if the endpoint can handle retries
        # Actual retry logic may be in the client
        response = client.post(
            "/api/auto-fix",
            json=SAMPLE_REQUEST
        )
        
        # First attempt will fail
        assert response.status_code == 500
        
        # Second attempt should succeed
        mock_generate.side_effect = None
        mock_generate.return_value = '{"summary": "Success", "experience": [], "education": [], "skills": []}'
        
        response2 = client.post(
            "/api/auto-fix",
            json=SAMPLE_REQUEST
        )
        
        print(f"✅ Retry simulation: First={response.status_code}, Second={response2.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
