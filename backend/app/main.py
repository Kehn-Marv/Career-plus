from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import router as api_router
from .config import validate_config, get_config

# Validate configuration on startup
validate_config()

app = FastAPI(
    title="Career+ Backend API",
    version="0.1.0",
    description="AI-powered resume analysis and optimization API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allow frontend to access API
config = get_config()
cors_origins = config.cors_origins.split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Career+ API",
        "version": "0.1.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
