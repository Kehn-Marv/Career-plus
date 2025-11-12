from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from .models import (
    BiasAnalysisRequest, BiasAnalysisResponse,
    LocalizationRequest, LocalizationResponse,
    RewriteBatchRequest, RewriteBatchResponse, RewrittenBullet,
    EmbedRequest,
    ATSAnalysisRequest, ATSAnalysisResponse,
    ChatRequest, ChatResponse
)
from .ai_insights import generate_ai_insights
from .bias_detection import analyze_bias
from .localization import get_localization_advice
from .ats_analyzer import analyze_ats_compatibility
from .batch_rewriter import rewrite_bullets_batch, check_ai_rewriter_available
from .chat_service import generate_chat_response
from .rate_limiter import rate_limit
import time

router = APIRouter()

# In-memory storage for rate limiting (will be replaced with Redis in production)
request_history = {}


@router.post("/analyze-bias", response_model=BiasAnalysisResponse)
@rate_limit(max_requests=10, window_seconds=60)
async def analyze_bias_endpoint(request: Request, payload: BiasAnalysisRequest):
    """
    Analyze text for biased language
    
    Returns detected biased phrases with neutral suggestions
    """
    try:
        result = analyze_bias(payload.text)
        return BiasAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/localize", response_model=LocalizationResponse)
@rate_limit(max_requests=10, window_seconds=60)
async def localize_endpoint(request: Request, payload: LocalizationRequest):
    """
    Get localization advice for target region
    
    Returns region-specific formatting and terminology recommendations
    """
    try:
        result = get_localization_advice(payload.resume_text, payload.target_region)
        return LocalizationResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rewrite-batch", response_model=RewriteBatchResponse)
@rate_limit(max_requests=5, window_seconds=60)
async def rewrite_batch_endpoint(request: Request, payload: RewriteBatchRequest):
    """
    Rewrite multiple resume bullets in batch using AI
    
    Uses Ollama to generate improved, impactful bullet points
    """
    try:
        # Check if AI service is available
        if not check_ai_rewriter_available():
            raise HTTPException(
                status_code=503,
                detail="AI service is not available. Please check your AI Gateway configuration."
            )
        
        # Rewrite bullets using AI Gateway
        rewrite_results = rewrite_bullets_batch(
            bullets=payload.bullets,
            job_description=payload.job_description,
            tone=payload.tone
        )
        
        # Convert to response format
        rewritten = [
            RewrittenBullet(
                original=result.original,
                improved=result.rewritten,
                changes=result.changes
            )
            for result in rewrite_results
        ]
        
        return RewriteBatchResponse(rewritten=rewritten)
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Batch rewriting failed: {str(e)}")


@router.post("/embeddings")
@rate_limit(max_requests=20, window_seconds=60)
async def generate_embeddings_endpoint(request: Request, payload: EmbedRequest):
    """
    Generate embeddings for text using sentence-transformers
    
    Returns embeddings as arrays of floats
    """
    try:
        from sentence_transformers import SentenceTransformer
        
        # Load model (cached after first load)
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Generate embeddings
        embeddings = model.encode(payload.texts, convert_to_numpy=True)
        
        # Convert to list of lists
        embeddings_list = [emb.tolist() for emb in embeddings]
        
        return {
            "embeddings": embeddings_list,
            "model": "all-MiniLM-L6-v2",
            "dimension": len(embeddings_list[0]) if embeddings_list else 0
        }
        
    except ImportError:
        raise HTTPException(
            status_code=503, 
            detail="Embedding model not available. Please install sentence-transformers."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-insights")
@rate_limit(max_requests=10, window_seconds=60)
async def generate_insights_endpoint(request: Request, payload: dict):
    """
    Generate AI-powered personalized insights and recommendations
    
    Requires:
    - resume_text: str
    - job_description: str
    - keyword_analysis: dict
    - scores: dict
    """
    try:
        resume_text = payload.get('resume_text', '')
        job_description = payload.get('job_description', '')
        keyword_analysis = payload.get('keyword_analysis', {})
        scores = payload.get('scores', {})
        
        if not resume_text or not job_description:
            raise HTTPException(status_code=400, detail="resume_text and job_description are required")
        
        insights = generate_ai_insights(
            resume_text=resume_text,
            job_description=job_description,
            keyword_analysis=keyword_analysis,
            scores=scores
        )
        
        return insights
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-ats", response_model=ATSAnalysisResponse)
@rate_limit(max_requests=10, window_seconds=60)
async def analyze_ats_endpoint(request: Request, payload: ATSAnalysisRequest):
    """
    Analyze resume for ATS compatibility
    
    Returns ATS score and list of issues with severity levels
    """
    try:
        result = analyze_ats_compatibility(payload.resume_text)
        return ATSAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
@rate_limit(max_requests=20, window_seconds=60)
async def chat_endpoint(request: Request, payload: ChatRequest):
    """
    AI chat assistant for resume optimization
    
    Provides conversational guidance with context awareness
    """
    try:
        response_text = generate_chat_response(
            message=payload.message,
            context=payload.context,
            conversation_history=payload.conversation_history
        )
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": time.time()}
