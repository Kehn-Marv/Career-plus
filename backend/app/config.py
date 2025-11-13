"""
Configuration Management and Validation
Validates required environment variables on application startup
"""

import os
import sys
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()


class ConfigValidationError(Exception):
    """Raised when configuration validation fails"""
    pass


class AppConfig:
    """Application configuration with validation"""
    
    def __init__(self):
        """Initialize and validate configuration"""
        # API Configuration
        self.cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173')
        
        # Gemini Configuration
        self.gemini_api_key = os.getenv('GEMINI_API_KEY', '')
        self.gemini_model = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash-lite')
        
        # Hugging Face Configuration (optional)
        self.hf_token = os.getenv('HF_TOKEN', '')
        self.hf_embedding_model = os.getenv('HF_EMBEDDING_MODEL', 'sentence-transformers/all-mpnet-base-v2')
        self.hf_generation_model = os.getenv('HF_GENERATION_MODEL', 'mistralai/Mistral-7B-Instruct-v0.2')
        
        # Rate Limiting
        self.rate_limit_enabled = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true'
        self.max_requests_per_minute = int(os.getenv('MAX_REQUESTS_PER_MINUTE', '10'))
    
    def validate(self) -> None:
        """
        Validate configuration
        
        Raises:
            ConfigValidationError: If required configuration is missing or invalid
        """
        errors: List[str] = []
        warnings: List[str] = []
        
        # Validate Gemini API Key (required)
        if not self.gemini_api_key:
            errors.append('GEMINI_API_KEY is required but not set')
        elif self.gemini_api_key == 'your_gemini_api_key_here':
            errors.append('GEMINI_API_KEY is set to placeholder value. Please set a valid API key.')
        elif len(self.gemini_api_key) < 20:
            errors.append('GEMINI_API_KEY appears to be invalid (too short)')
        
        # Validate Gemini Model
        if not self.gemini_model:
            errors.append('GEMINI_MODEL cannot be empty')
        
        # Validate CORS origins
        if not self.cors_origins:
            warnings.append('CORS_ORIGINS is not set, using default values')
        
        # Validate rate limiting
        if self.max_requests_per_minute <= 0:
            errors.append('MAX_REQUESTS_PER_MINUTE must be a positive number')
        
        # Optional: Hugging Face Token
        if not self.hf_token:
            warnings.append('HF_TOKEN is not set. Hugging Face features will be unavailable.')
        elif self.hf_token == 'your_hugging_face_token_here':
            warnings.append('HF_TOKEN is set to placeholder value. Hugging Face features may not work.')
        
        # Print warnings
        if warnings:
            print('\n⚠️  Configuration Warnings:')
            for warning in warnings:
                print(f'   - {warning}')
        
        # Raise errors if any
        if errors:
            error_msg = '\n❌ Configuration Validation Failed:\n'
            error_msg += '\n'.join(f'   - {error}' for error in errors)
            error_msg += '\n\nPlease check your backend/.env file and ensure all required variables are set.'
            error_msg += '\nSee backend/.env.example for reference.'
            raise ConfigValidationError(error_msg)
    
    def print_config_summary(self) -> None:
        """Print configuration summary (without sensitive data)"""
        print('\n✓ Backend Configuration:')
        print(f'   - Gemini Model: {self.gemini_model}')
        print(f'   - Gemini API Key: {"✓ Set" if self.gemini_api_key else "✗ Not set"}')
        print(f'   - HF Token: {"✓ Set" if self.hf_token else "✗ Not set"}')
        print(f'   - Rate Limiting: {"Enabled" if self.rate_limit_enabled else "Disabled"}')
        print(f'   - Max Requests/Min: {self.max_requests_per_minute}')
        print(f'   - CORS Origins: {self.cors_origins}')
        print()


# Global configuration instance
config: Optional[AppConfig] = None


def get_config() -> AppConfig:
    """Get the global configuration instance"""
    global config
    if config is None:
        config = AppConfig()
    return config


def validate_config() -> None:
    """
    Validate configuration on startup
    
    Raises:
        ConfigValidationError: If configuration is invalid
        SystemExit: If validation fails (exits with code 1)
    """
    try:
        cfg = get_config()
        cfg.validate()
        cfg.print_config_summary()
    except ConfigValidationError as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
