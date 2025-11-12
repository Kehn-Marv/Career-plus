from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# Request/Response models for API endpoints

class ParseRequest(BaseModel):
    """Request model for parsing documents"""
    text: Optional[str] = None


class EmbedRequest(BaseModel):
    """Request model for generating embeddings"""
    texts: List[str] = Field(..., min_items=1, max_items=100)


class ScoreRequest(BaseModel):
    """Request model for scoring resume against job description"""
    resume_text: str = Field(..., min_length=100)
    job_text: str = Field(..., min_length=50)


class RewriteRequest(BaseModel):
    """Request model for AI rewriting"""
    text: str = Field(..., min_length=10)
    tone: Optional[str] = Field(default="professional")
    role: Optional[str] = Field(default="")


class BiasAnalysisRequest(BaseModel):
    """Request model for bias detection"""
    text: str = Field(..., min_length=10)


class BiasedPhrase(BaseModel):
    """Model for a biased phrase with suggestion"""
    original: str
    suggestion: str
    reason: str
    category: Literal["gender", "age", "race", "disability", "religion", "marital_status", "socioeconomic", "other"]
    confidence: float = 0.8
    context: Optional[str] = None


class BiasAnalysisResponse(BaseModel):
    """Response model for bias detection"""
    biased_phrases: List[BiasedPhrase]
    bias_score: float = Field(..., ge=0, le=100, description="0 = no bias, 100 = high bias")


class LocalizationRequest(BaseModel):
    """Request model for localization advice"""
    resume_text: str = Field(..., min_length=100)
    target_region: Literal["US", "UK", "EU", "APAC"]


class LocalizationResponse(BaseModel):
    """Response model for localization advice"""
    recommendations: List[str]
    format_changes: List[str]
    terminology_changes: List[dict]


class RewriteBatchRequest(BaseModel):
    """Request model for batch rewriting"""
    bullets: List[str] = Field(..., min_items=1, max_items=50)
    job_description: str
    tone: str = "professional"


class RewrittenBullet(BaseModel):
    """Model for a rewritten bullet point"""
    original: str
    improved: str
    changes: List[str]


class RewriteBatchResponse(BaseModel):
    """Response model for batch rewriting"""
    rewritten: List[RewrittenBullet]


class ATSAnalysisRequest(BaseModel):
    """Request model for ATS compatibility analysis"""
    resume_text: str = Field(..., min_length=100)


class ATSIssueModel(BaseModel):
    """Model for a single ATS issue"""
    id: str
    severity: Literal["critical", "warning", "info"]
    title: str
    description: str
    suggestion: str
    location: Optional[dict] = None


class ATSAnalysisResponse(BaseModel):
    """Response model for ATS compatibility analysis"""
    ats_score: float = Field(..., ge=0, le=100)
    issues: List[ATSIssueModel]


class ChatRequest(BaseModel):
    """Request model for chat"""
    message: str = Field(..., min_length=1)
    context: dict = {}
    conversation_history: List[dict] = []


class ChatResponse(BaseModel):
    """Response model for chat"""
    response: str
