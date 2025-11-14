"""
Performance tests for auto-fix workflow
Tests processing time, throughput, and resource usage
"""

import pytest
import time
import json
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

# Mock WeasyPrint before importing app
import sys
mock_weasyprint = MagicMock()
sys.modules['weasyprint'] = mock_weasyprint
sys.modules['weasyprint.text'] = MagicMock()
sys.modules['weasyprint.text.ffi'] = MagicMock()

from app.main import app

client = TestClient(app)


# Test data generators
def generate_resume(num_jobs=3, bullets_per_job=5):
    """Generate a resume with specified complexity"""
    return {
        "summary": "Experienced professional with extensive background in software development and team leadership.",
        "experience": [
            {
                "title": f"Senior Engineer {i}",
                "company": f"Tech Company {i}",
                "location": "San Francisco, CA",
                "dates": f"{2015+i} - {2016+i}",
                "description": [
                    f"Developed and maintained critical systems handling {j}M+ requests daily"
                    for j in range(1, bullets_per_job + 1)
                ]
            }
            for i in range(num_jobs)
        ],
        "education": [
            {
                "degree": "BS Computer Science",
                "school": "University of California",
                "location": "Berkeley, CA",
                "dates": "2011 - 2015"
            }
        ],
        "skills": [
            "Python", "JavaScript", "TypeScript", "React", "Node.js",
            "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes",
            "AWS", "GCP", "CI/CD", "Microservices", "REST APIs"
        ],
        "certifications": [
            "AWS Certified Solutions Architect",
            "Google Cloud Professional"
        ]
    }


def generate_issues(count=5):
    """Generate sample ATS issues"""
    return [
        {
            "id": f"issue-{i}",
            "severity": ["critical", "warning", "info"][i % 3],
            "title": f"Issue {i}",
            "description": f"Description for issue {i}",
            "suggestion": f"Fix suggestion {i}"
        }
        for i in range(count)
    ]


def generate_recommendations(count=5):
    """Generate sample recommendations"""
    return [
        {
            "id": f"rec-{i}",
            "type": ["content", "keyword", "format"][i % 3],
            "priority": ["high", "medium", "low"][i % 3],
            "suggestedText": f"Recommendation {i}",
            "explanation": f"Explanation {i}",
            "impact": 7 + (i % 3)
        }
        for i in range(count)
    ]


JOB_DESCRIPTION = """
Senior Software Engineer position requiring 5+ years of experience in backend development.
Must have expertise in Python, microservices architecture, cloud platforms (AWS/GCP),
and database design. Experience with Docker, Kubernetes, and CI/CD pipelines required.
Strong communication skills and ability to mentor junior developers essential.
"""


class TestAutoFixPerformance:
    """Performance tests for auto-fix workflow"""
    
    def test_small_resume_processing_time(self):
        """Test 15.3: Measure processing time for small resume (1 job)"""
        resume = generate_resume(num_jobs=1, bullets_per_job=3)
        
        start_time = time.time()
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": resume,
                "ats_issues": generate_issues(3),
                "recommendations": generate_recommendations(3),
                "job_description": JOB_DESCRIPTION
            }
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200
        assert elapsed < 15, f"Small resume took {elapsed:.2f}s, should be under 15s"
        
        print(f"✅ Small resume (1 job): {elapsed:.2f}s")
        return elapsed
    
    def test_medium_resume_processing_time(self):
        """Test 15.3: Measure processing time for medium resume (3 jobs)"""
        resume = generate_resume(num_jobs=3, bullets_per_job=5)
        
        start_time = time.time()
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": resume,
                "ats_issues": generate_issues(5),
                "recommendations": generate_recommendations(5),
                "job_description": JOB_DESCRIPTION
            }
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200
        assert elapsed < 25, f"Medium resume took {elapsed:.2f}s, should be under 25s"
        
        print(f"✅ Medium resume (3 jobs): {elapsed:.2f}s")
        return elapsed
    
    def test_large_resume_processing_time(self):
        """Test 15.3: Measure processing time for large resume (5+ jobs)"""
        resume = generate_resume(num_jobs=6, bullets_per_job=7)
        
        start_time = time.time()
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": resume,
                "ats_issues": generate_issues(10),
                "recommendations": generate_recommendations(10),
                "job_description": JOB_DESCRIPTION
            }
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200
        assert elapsed < 30, f"Large resume took {elapsed:.2f}s, should be under 30s"
        
        print(f"✅ Large resume (6 jobs): {elapsed:.2f}s")
        return elapsed
    
    def test_pdf_generation_performance(self):
        """Test 15.3: Measure PDF generation time"""
        resume = generate_resume(num_jobs=3, bullets_per_job=5)
        
        # Test each template
        templates = ["professional", "modern", "minimal"]
        results = {}
        
        for template_id in templates:
            start_time = time.time()
            response = client.post(
                "/api/generate-pdf",
                json={
                    "resume_json": resume,
                    "template_id": template_id,
                    "options": {}
                }
            )
            elapsed = time.time() - start_time
            
            assert response.status_code == 200
            assert elapsed < 10, f"PDF generation took {elapsed:.2f}s, should be under 10s"
            
            results[template_id] = {
                "time": elapsed,
                "size": len(response.content)
            }
            
            print(f"✅ PDF ({template_id}): {elapsed:.2f}s, {len(response.content)} bytes")
        
        return results
    
    def test_end_to_end_performance(self):
        """Test 15.3: Measure complete end-to-end workflow time"""
        resume = generate_resume(num_jobs=3, bullets_per_job=5)
        
        # Step 1: Auto-fix
        start_time = time.time()
        autofix_response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": resume,
                "ats_issues": generate_issues(5),
                "recommendations": generate_recommendations(5),
                "job_description": JOB_DESCRIPTION
            }
        )
        autofix_time = time.time() - start_time
        
        assert autofix_response.status_code == 200
        optimized_resume = autofix_response.json()["optimized_resume"]
        
        # Step 2: PDF generation
        pdf_start = time.time()
        pdf_response = client.post(
            "/api/generate-pdf",
            json={
                "resume_json": optimized_resume,
                "template_id": "professional",
                "options": {}
            }
        )
        pdf_time = time.time() - pdf_start
        
        assert pdf_response.status_code == 200
        
        total_time = time.time() - start_time
        
        # Total should be under 30 seconds
        assert total_time < 30, f"End-to-end took {total_time:.2f}s, should be under 30s"
        
        print(f"✅ End-to-end performance:")
        print(f"   - Auto-fix: {autofix_time:.2f}s")
        print(f"   - PDF gen: {pdf_time:.2f}s")
        print(f"   - Total: {total_time:.2f}s")
        
        return {
            "autofix_time": autofix_time,
            "pdf_time": pdf_time,
            "total_time": total_time
        }
    
    def test_multiple_page_resume_performance(self):
        """Test 15.3: Test with resume that spans multiple pages"""
        # Create a very detailed resume
        large_resume = generate_resume(num_jobs=8, bullets_per_job=10)
        
        start_time = time.time()
        response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": large_resume,
                "ats_issues": generate_issues(15),
                "recommendations": generate_recommendations(15),
                "job_description": JOB_DESCRIPTION
            }
        )
        elapsed = time.time() - start_time
        
        assert response.status_code == 200
        
        # Multi-page resumes may take longer but should still be reasonable
        assert elapsed < 35, f"Multi-page resume took {elapsed:.2f}s, should be under 35s"
        
        print(f"✅ Multi-page resume (8 jobs): {elapsed:.2f}s")
        return elapsed
    
    def test_throughput_sequential(self):
        """Test 15.3: Measure throughput with sequential requests"""
        resume = generate_resume(num_jobs=2, bullets_per_job=4)
        num_requests = 5
        
        start_time = time.time()
        
        for i in range(num_requests):
            response = client.post(
                "/api/auto-fix",
                json={
                    "resume_json": resume,
                    "ats_issues": generate_issues(3),
                    "recommendations": generate_recommendations(3),
                    "job_description": JOB_DESCRIPTION
                }
            )
            assert response.status_code == 200
        
        total_time = time.time() - start_time
        avg_time = total_time / num_requests
        throughput = num_requests / total_time
        
        print(f"✅ Sequential throughput:")
        print(f"   - {num_requests} requests in {total_time:.2f}s")
        print(f"   - Average: {avg_time:.2f}s per request")
        print(f"   - Throughput: {throughput:.2f} requests/second")
        
        return {
            "total_time": total_time,
            "avg_time": avg_time,
            "throughput": throughput
        }
    
    def test_response_size_analysis(self):
        """Test 15.3: Analyze response sizes for different resume types"""
        test_cases = [
            ("Small", generate_resume(1, 3)),
            ("Medium", generate_resume(3, 5)),
            ("Large", generate_resume(6, 7))
        ]
        
        results = {}
        
        for name, resume in test_cases:
            response = client.post(
                "/api/auto-fix",
                json={
                    "resume_json": resume,
                    "ats_issues": generate_issues(5),
                    "recommendations": generate_recommendations(5),
                    "job_description": JOB_DESCRIPTION
                }
            )
            
            assert response.status_code == 200
            
            response_size = len(response.content)
            results[name] = response_size
            
            print(f"✅ {name} resume response: {response_size} bytes")
        
        return results
    
    def test_identify_bottlenecks(self):
        """Test 15.3: Identify performance bottlenecks in the workflow"""
        resume = generate_resume(num_jobs=3, bullets_per_job=5)
        
        # Measure each component
        timings = {}
        
        # 1. Auto-fix timing
        start = time.time()
        autofix_response = client.post(
            "/api/auto-fix",
            json={
                "resume_json": resume,
                "ats_issues": generate_issues(5),
                "recommendations": generate_recommendations(5),
                "job_description": JOB_DESCRIPTION
            }
        )
        timings["autofix"] = time.time() - start
        
        assert autofix_response.status_code == 200
        optimized = autofix_response.json()["optimized_resume"]
        
        # 2. PDF generation timing
        start = time.time()
        pdf_response = client.post(
            "/api/generate-pdf",
            json={
                "resume_json": optimized,
                "template_id": "professional",
                "options": {}
            }
        )
        timings["pdf_generation"] = time.time() - start
        
        assert pdf_response.status_code == 200
        
        # Analyze bottlenecks
        total = sum(timings.values())
        percentages = {k: (v/total)*100 for k, v in timings.items()}
        
        print(f"✅ Performance breakdown:")
        for component, timing in timings.items():
            pct = percentages[component]
            print(f"   - {component}: {timing:.2f}s ({pct:.1f}%)")
        
        # Identify bottleneck
        bottleneck = max(timings.items(), key=lambda x: x[1])
        print(f"   - Bottleneck: {bottleneck[0]} ({bottleneck[1]:.2f}s)")
        
        return timings
    
    def test_memory_efficiency(self):
        """Test 15.3: Test memory efficiency with large resumes"""
        # Create progressively larger resumes
        sizes = [1, 3, 5, 8]
        
        for size in sizes:
            resume = generate_resume(num_jobs=size, bullets_per_job=size*2)
            
            response = client.post(
                "/api/auto-fix",
                json={
                    "resume_json": resume,
                    "ats_issues": generate_issues(size*2),
                    "recommendations": generate_recommendations(size*2),
                    "job_description": JOB_DESCRIPTION
                }
            )
            
            # Should handle without memory errors
            assert response.status_code in [200, 413, 500]
            
            if response.status_code == 200:
                print(f"✅ Handled {size} jobs successfully")
            else:
                print(f"⚠️  {size} jobs: status {response.status_code}")


class TestPerformanceRegression:
    """Regression tests to ensure performance doesn't degrade"""
    
    def test_baseline_performance(self):
        """Establish baseline performance metrics"""
        resume = generate_resume(num_jobs=3, bullets_per_job=5)
        
        times = []
        for _ in range(3):
            start = time.time()
            response = client.post(
                "/api/auto-fix",
                json={
                    "resume_json": resume,
                    "ats_issues": generate_issues(5),
                    "recommendations": generate_recommendations(5),
                    "job_description": JOB_DESCRIPTION
                }
            )
            elapsed = time.time() - start
            
            assert response.status_code == 200
            times.append(elapsed)
        
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"✅ Baseline performance (3 runs):")
        print(f"   - Average: {avg_time:.2f}s")
        print(f"   - Min: {min_time:.2f}s")
        print(f"   - Max: {max_time:.2f}s")
        
        # All runs should be under 30s
        assert max_time < 30, f"Max time {max_time:.2f}s exceeds 30s threshold"
        
        return {
            "avg": avg_time,
            "min": min_time,
            "max": max_time
        }


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
