"""
Career+ Resume Rewriter
Hugging Face Space with Gradio interface and FastAPI endpoint
Provides AI-powered resume bullet point rewriting
"""

import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app for API endpoints
app = FastAPI(title="Career+ Resume Rewriter API", version="1.0.0")

# Pydantic models for API
class RewriteRequest(BaseModel):
    bullet: str = Field(..., description="Resume bullet point to rewrite", min_length=10, max_length=500)
    job_description: str = Field(..., description="Target job description", min_length=50, max_length=5000)
    tone: Optional[str] = Field("professional", description="Writing tone")
    temperature: Optional[float] = Field(0.7, ge=0.3, le=1.0, description="Generation temperature")

class BatchRewriteRequest(BaseModel):
    bullets: List[str] = Field(..., description="List of resume bullets to rewrite", min_items=1, max_items=10)
    job_description: str = Field(..., description="Target job description", min_length=50, max_length=5000)
    tone: Optional[str] = Field("professional", description="Writing tone")
    temperature: Optional[float] = Field(0.7, ge=0.3, le=1.0, description="Generation temperature")

class RewriteResponse(BaseModel):
    original: str
    rewritten: str
    success: bool

class BatchRewriteResponse(BaseModel):
    results: List[RewriteResponse]
    total: int
    success_count: int

# Model configuration
MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2"
MAX_NEW_TOKENS = 256
TEMPERATURE = 0.7

# Global model and tokenizer
model = None
tokenizer = None

def load_model():
    """Load model with 4-bit quantization for efficiency"""
    global model, tokenizer
    
    if model is not None:
        return model, tokenizer
    
    logger.info(f"Loading model: {MODEL_NAME}")
    
    try:
        # Configure 4-bit quantization
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )
        
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        tokenizer.pad_token = tokenizer.eos_token
        
        # Load model
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True
        )
        
        logger.info("Model loaded successfully")
        return model, tokenizer
        
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

def create_prompt(bullet: str, job_description: str, tone: str = "professional") -> str:
    """Create prompt for resume rewriting"""
    
    prompt = f"""<s>[INST] You are an expert resume writer. Rewrite the following resume bullet point to be more impactful and tailored to the job description.

Job Description:
{job_description[:500]}

Original Bullet:
{bullet}

Requirements:
- Make it concise and results-oriented
- Use strong action verbs
- Add quantifiable metrics where possible
- Maintain a {tone} tone
- Keep it to 1-2 sentences
- Focus on achievements and impact

Rewritten Bullet: [/INST]"""
    
    return prompt

def rewrite_bullet(
    bullet: str,
    job_description: str,
    tone: str = "professional",
    temperature: float = 0.7
) -> str:
    """Rewrite a single resume bullet point"""
    
    try:
        # Load model if not already loaded
        model, tokenizer = load_model()
        
        # Create prompt
        prompt = create_prompt(bullet, job_description, tone)
        
        # Tokenize
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024)
        inputs = {k: v.to(model.device) for k, v in inputs.items()}
        
        # Generate
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=MAX_NEW_TOKENS,
                temperature=temperature,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.1,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the rewritten bullet (after [/INST])
        if "[/INST]" in generated_text:
            rewritten = generated_text.split("[/INST]")[-1].strip()
        else:
            rewritten = generated_text.strip()
        
        # Clean up
        rewritten = rewritten.replace("Rewritten Bullet:", "").strip()
        
        return rewritten
        
    except Exception as e:
        logger.error(f"Rewriting failed: {e}")
        return f"Error: {str(e)}"

def rewrite_batch(
    bullets_text: str,
    job_description: str,
    tone: str = "professional",
    temperature: float = 0.7
) -> str:
    """Rewrite multiple bullets (one per line)"""
    
    if not bullets_text.strip():
        return "Please enter at least one bullet point."
    
    if not job_description.strip():
        return "Please enter a job description."
    
    # Split bullets by newline
    bullets = [b.strip() for b in bullets_text.split('\n') if b.strip()]
    
    if len(bullets) > 10:
        return "Please limit to 10 bullet points at a time."
    
    results = []
    for i, bullet in enumerate(bullets, 1):
        logger.info(f"Rewriting bullet {i}/{len(bullets)}")
        rewritten = rewrite_bullet(bullet, job_description, tone, temperature)
        results.append(f"**Original {i}:**\n{bullet}\n\n**Improved {i}:**\n{rewritten}\n")
    
    return "\n---\n\n".join(results)

# FastAPI endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Career+ Resume Rewriter",
        "version": "1.0.0",
        "model": MODEL_NAME
    }

@app.post("/api/rewrite", response_model=RewriteResponse)
async def api_rewrite_bullet(request: RewriteRequest):
    """
    Rewrite a single resume bullet point
    
    Args:
        request: RewriteRequest with bullet, job_description, tone, temperature
    
    Returns:
        RewriteResponse with original, rewritten text, and success status
    """
    try:
        logger.info(f"API rewrite request received")
        
        rewritten = rewrite_bullet(
            bullet=request.bullet,
            job_description=request.job_description,
            tone=request.tone,
            temperature=request.temperature
        )
        
        # Check if rewriting failed
        if rewritten.startswith("Error:"):
            raise HTTPException(status_code=500, detail=rewritten)
        
        return RewriteResponse(
            original=request.bullet,
            rewritten=rewritten,
            success=True
        )
        
    except Exception as e:
        logger.error(f"API rewrite failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rewrite-batch", response_model=BatchRewriteResponse)
async def api_rewrite_batch(request: BatchRewriteRequest):
    """
    Rewrite multiple resume bullet points
    
    Args:
        request: BatchRewriteRequest with bullets list, job_description, tone, temperature
    
    Returns:
        BatchRewriteResponse with list of results and statistics
    """
    try:
        logger.info(f"API batch rewrite request received for {len(request.bullets)} bullets")
        
        results = []
        success_count = 0
        
        for bullet in request.bullets:
            try:
                rewritten = rewrite_bullet(
                    bullet=bullet,
                    job_description=request.job_description,
                    tone=request.tone,
                    temperature=request.temperature
                )
                
                success = not rewritten.startswith("Error:")
                if success:
                    success_count += 1
                
                results.append(RewriteResponse(
                    original=bullet,
                    rewritten=rewritten,
                    success=success
                ))
                
            except Exception as e:
                logger.error(f"Failed to rewrite bullet: {e}")
                results.append(RewriteResponse(
                    original=bullet,
                    rewritten=f"Error: {str(e)}",
                    success=False
                ))
        
        return BatchRewriteResponse(
            results=results,
            total=len(results),
            success_count=success_count
        )
        
    except Exception as e:
        logger.error(f"API batch rewrite failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Create Gradio interface
with gr.Blocks(title="Career+ Resume Rewriter", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🚀 Career+ Resume Rewriter
    
    AI-powered resume bullet point rewriting using Mistral-7B-Instruct.
    
    **How to use:**
    1. Paste your resume bullet points (one per line)
    2. Paste the job description
    3. Select tone and creativity
    4. Click "Rewrite Bullets"
    """)
    
    with gr.Row():
        with gr.Column():
            bullets_input = gr.Textbox(
                label="Resume Bullet Points",
                placeholder="Enter your resume bullets, one per line...\n\nExample:\n- Managed team projects\n- Worked on system improvements",
                lines=8
            )
            
            jd_input = gr.Textbox(
                label="Job Description",
                placeholder="Paste the job description here...",
                lines=6
            )
            
            with gr.Row():
                tone_input = gr.Dropdown(
                    choices=["professional", "dynamic", "technical", "leadership"],
                    value="professional",
                    label="Tone"
                )
                
                temp_input = gr.Slider(
                    minimum=0.3,
                    maximum=1.0,
                    value=0.7,
                    step=0.1,
                    label="Creativity (Temperature)"
                )
            
            submit_btn = gr.Button("✨ Rewrite Bullets", variant="primary", size="lg")
        
        with gr.Column():
            output = gr.Markdown(label="Rewritten Bullets")
    
    # Examples
    gr.Examples(
        examples=[
            [
                "Responsible for managing team projects\nWorked on improving system performance",
                "Senior Software Engineer position requiring 5+ years experience in Python, AWS, and team leadership. Must have strong communication skills and ability to mentor junior developers.",
                "professional",
                0.7
            ]
        ],
        inputs=[bullets_input, jd_input, tone_input, temp_input]
    )
    
    # Connect button
    submit_btn.click(
        fn=rewrite_batch,
        inputs=[bullets_input, jd_input, tone_input, temp_input],
        outputs=output
    )
    
    gr.Markdown("""
    ---
    
    **Note:** This is a free service. Processing may take 10-30 seconds per bullet.
    
    **Privacy:** Your data is processed in real-time and not stored.
    
    Built with ❤️ for [Career+](https://github.com/yourusername/career-plus)
    """)

# Mount Gradio app to FastAPI
app = gr.mount_gradio_app(app, demo, path="/")

# Launch
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
