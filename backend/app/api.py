from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from .models import (
    BiasAnalysisRequest, BiasAnalysisResponse,
    LocalizationRequest, LocalizationResponse,
    RewriteBatchRequest, RewriteBatchResponse, RewrittenBullet,
    EmbedRequest,
    ATSAnalysisRequest, ATSAnalysisResponse,
    ChatRequest, ChatResponse,
    AutoFixRequest, AutoFixResponse,
    PDFGenerationRequest
)
from .ai_insights import generate_ai_insights
from .bias_detection import analyze_bias
from .localization import get_localization_advice
from .ats_analyzer import analyze_ats_compatibility
from .batch_rewriter import rewrite_bullets_batch, check_ai_rewriter_available
from .chat_service import generate_chat_response
from .rate_limiter import rate_limit
from .resume_optimizer import optimize_resume_content
from .grammar_fixer import fix_grammar_and_ats
from .keyword_injector import inject_keywords_intelligently
from .template_engine import template_engine
import time
import asyncio

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


@router.post("/auto-fix", response_model=AutoFixResponse)
@rate_limit(max_requests=5, window_seconds=60)
async def auto_fix_endpoint(request: Request, payload: AutoFixRequest):
    """
    Comprehensive auto-fix using Gemini AI
    
    Applies content optimization, grammar fixes, and keyword injection
    """
    start_time = time.time()
    applied_fixes = []
    
    try:
        # Log received payload for debugging
        print(f"[Auto-Fix] Received payload:")
        print(f"  - resume_json type: {type(payload.resume_json)}")
        print(f"  - resume_json keys: {list(payload.resume_json.keys()) if isinstance(payload.resume_json, dict) else 'N/A'}")
        print(f"  - ats_issues count: {len(payload.ats_issues)}")
        print(f"  - recommendations count: {len(payload.recommendations)}")
        print(f"  - job_description length: {len(payload.job_description)}")
        
        # Step 1: Content Optimization
        print("[Auto-Fix] Step 1: Optimizing content...")
        optimized_content = await optimize_resume_content(
            resume=payload.resume_json,
            issues=payload.ats_issues,
            recommendations=payload.recommendations,
            job_description=payload.job_description
        )
        applied_fixes.append("Content optimization")
        
        # Step 2: Grammar and ATS Phrasing
        print("[Auto-Fix] Step 2: Fixing grammar and ATS phrasing...")
        grammar_fixed = await fix_grammar_and_ats(optimized_content)
        applied_fixes.append("Grammar and ATS phrasing")
        
        # Step 3: Keyword Injection
        print("[Auto-Fix] Step 3: Injecting keywords...")
        final_resume = await inject_keywords_intelligently(
            resume=grammar_fixed,
            recommendations=payload.recommendations,
            job_description=payload.job_description
        )
        applied_fixes.append("Keyword injection")
        
        # Calculate metrics
        processing_time = time.time() - start_time
        metrics = calculate_improvement_metrics(
            original=payload.resume_json,
            optimized=final_resume,
            issues=payload.ats_issues,
            recommendations=payload.recommendations
        )
        
        print(f"[Auto-Fix] Completed in {processing_time:.2f}s")
        
        return AutoFixResponse(
            optimized_resume=final_resume,
            applied_fixes=applied_fixes,
            improvement_metrics=metrics,
            processing_time=processing_time
        )
        
    except ValueError as e:
        # Validation or parsing errors
        import traceback
        print(f"[Auto-Fix] ValueError occurred:")
        print(f"  Error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Invalid data: {str(e)}")
    except Exception as e:
        # Log the full error for debugging
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Auto-fix failed: {str(e)}"
        )


def calculate_improvement_metrics(
    original: dict,
    optimized: dict,
    issues: list,
    recommendations: list
) -> dict:
    """
    Calculate improvement metrics between original and optimized resume
    
    Args:
        original: Original resume data
        optimized: Optimized resume data
        issues: List of ATS issues
        recommendations: List of recommendations
        
    Returns:
        Dictionary of improvement metrics
    """
    metrics = {
        "issues_addressed": len(issues),
        "recommendations_applied": len(recommendations),
        "content_enhancements": 0,
        "keywords_added": 0,
        "grammar_fixes_applied": 0
    }
    
    # Count content enhancements (sections that changed)
    for section in ['summary', 'experience', 'skills']:
        if section in original and section in optimized:
            if original[section] != optimized[section]:
                metrics["content_enhancements"] += 1
    
    # Estimate keywords added by comparing skills sections
    if 'skills' in original and 'skills' in optimized:
        original_skills = set(original.get('skills', []))
        optimized_skills = set(optimized.get('skills', []))
        metrics["keywords_added"] = len(optimized_skills - original_skills)
    
    # Count keyword recommendations
    keyword_recs = [r for r in recommendations if r.get('type') == 'keyword']
    metrics["keywords_added"] = max(metrics["keywords_added"], len(keyword_recs))
    
    # Estimate grammar fixes (rough estimate based on issues)
    grammar_issues = [i for i in issues if 'grammar' in i.get('title', '').lower()]
    metrics["grammar_fixes_applied"] = len(grammar_issues)
    
    return metrics


@router.post("/generate-pdf")
@rate_limit(max_requests=10, window_seconds=60)
async def generate_pdf_endpoint(request: Request, payload: PDFGenerationRequest):
    """
    Generate professional PDF using WeasyPrint
    
    Converts resume JSON to HTML with template, then to PDF with ATS-optimized settings
    """
    try:
        # Check if WeasyPrint is available
        try:
            from weasyprint import HTML, CSS
        except ImportError:
            raise HTTPException(
                status_code=503,
                detail="PDF generation service unavailable. WeasyPrint is not installed."
            )
        
        # Generate PDF using template engine
        print(f"[PDF Generation] Using template: {payload.template_id}")
        print(f"[PDF Generation] Resume data keys: {list(payload.resume_json.keys())}")
        try:
            pdf_bytes = template_engine.generate_pdf(
                template_id=payload.template_id,
                resume_data=payload.resume_json,
                options=payload.options
            )
        except ValueError as e:
            print(f"[PDF Generation] ValueError: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            print(f"[PDF Generation] Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"PDF generation failed: {str(e)}"
            )
        
        print(f"[PDF Generation] Generated PDF ({len(pdf_bytes)} bytes)")
        
        # Return PDF as binary response with ATS-friendly filename
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=resume_optimized.pdf",
                "Content-Length": str(len(pdf_bytes))
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": time.time()}


@router.get("/ai-status")
async def ai_status():
    """
    Check availability of AI services
    
    Returns status of Gemini API and model information
    """
    try:
        from .gemini_client import check_ai_available, GEMINI_MODEL
        
        gemini_available = check_ai_available()
        
        # Log the status for debugging
        if gemini_available:
            print(f"[AI Status] ✓ Gemini API available (model: {GEMINI_MODEL})")
        else:
            print("[AI Status] ✗ Gemini API unavailable")
        
        return {
            "gemini": {
                "available": gemini_available,
                "model": GEMINI_MODEL if gemini_available else None
            },
            "timestamp": time.time()
        }
    except Exception as e:
        print(f"[AI Status] Error checking AI status: {e}")
        return {
            "gemini": {
                "available": False,
                "model": None,
                "error": str(e)
            },
            "timestamp": time.time()
        }


@router.get("/cache/stats")
async def get_cache_stats():
    """
    Get cache statistics for all caches
    
    Returns statistics including hit rates, sizes, and performance metrics
    """
    try:
        from .cache_manager import cache_manager
        
        stats = cache_manager.get_all_stats()
        
        return JSONResponse(content={
            "status": "success",
            "caches": stats,
            "timestamp": time.time()
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cache/clear")
async def clear_cache(cache_type: str = None):
    """
    Clear cache(s)
    
    Args:
        cache_type: Optional specific cache to clear (template, prompt, ai_response, pdf, general)
                   If not provided, clears all caches
    """
    try:
        from .cache_manager import cache_manager
        
        if cache_type:
            if cache_type == 'template':
                cache_manager.get_template_cache().clear()
            elif cache_type == 'prompt':
                cache_manager.get_prompt_cache().clear()
            elif cache_type == 'ai_response':
                cache_manager.get_ai_response_cache().clear()
            elif cache_type == 'pdf':
                cache_manager.get_pdf_cache().clear()
            elif cache_type == 'general':
                cache_manager.get_general_cache().clear()
            else:
                raise HTTPException(status_code=400, detail=f"Invalid cache type: {cache_type}")
            
            return JSONResponse(content={
                "status": "success",
                "message": f"Cache '{cache_type}' cleared successfully"
            })
        else:
            cache_manager.clear_all()
            return JSONResponse(content={
                "status": "success",
                "message": "All caches cleared successfully"
            })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
