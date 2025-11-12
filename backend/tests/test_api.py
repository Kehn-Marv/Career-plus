import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "Career+" in response.json()["message"]


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_analyze_bias():
    """Test bias detection endpoint"""
    response = client.post(
        "/api/analyze-bias",
        json={"text": "Looking for a young salesman to join our team"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "biased_phrases" in data
    assert "bias_score" in data
    assert len(data["biased_phrases"]) > 0


def test_analyze_bias_no_bias():
    """Test bias detection with neutral text"""
    response = client.post(
        "/api/analyze-bias",
        json={"text": "Looking for an experienced salesperson to join our team"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["bias_score"] < 10  # Should have low or no bias


def test_localize_us():
    """Test localization for US region"""
    response = client.post(
        "/api/localize",
        json={
            "resume_text": "My CV includes my photo and date of birth",
            "target_region": "US"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "format_changes" in data
    assert len(data["recommendations"]) > 0


def test_localize_invalid_region():
    """Test localization with invalid region"""
    response = client.post(
        "/api/localize",
        json={
            "resume_text": "My resume",
            "target_region": "INVALID"
        }
    )
    assert response.status_code == 400


def test_rewrite_batch():
    """Test batch rewriting endpoint"""
    response = client.post(
        "/api/rewrite-batch",
        json={
            "bullets": [
                "Responsible for managing projects",
                "Worked on system improvements"
            ],
            "job_description": "Senior Engineer role",
            "tone": "professional"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "rewritten" in data
    assert len(data["rewritten"]) == 2
    assert data["rewritten"][0]["original"] == "Responsible for managing projects"


def test_rate_limiting():
    """Test rate limiting (may need adjustment based on limits)"""
    # Make multiple requests quickly
    responses = []
    for _ in range(15):  # Exceed the 10 req/min limit
        response = client.post(
            "/api/analyze-bias",
            json={"text": "Test text"}
        )
        responses.append(response.status_code)
    
    # Should have at least one 429 (rate limited)
    assert 429 in responses
