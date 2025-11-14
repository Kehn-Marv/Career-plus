"""
Gemini Client
Unified client for accessing Google's Gemini API
"""

import os
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Gemini configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash-lite')


class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client
        
        Args:
            api_key: Optional API key (defaults to GEMINI_API_KEY env var)
        """
        self.api_key = api_key or GEMINI_API_KEY
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        # Initialize the Gemini client
        self.client = genai.Client(api_key=self.api_key)
        
        print(f"✓ Using Google Gemini API with model: {GEMINI_MODEL}")
    
    def generate(
        self,
        prompt: str,
        model: str = GEMINI_MODEL,
        max_tokens: int = 500,
        temperature: float = 0.7,
        timeout: int = 90,
        response_mime_type: Optional[str] = None
    ) -> str:
        """
        Generate text using Gemini model
        
        Args:
            prompt: The prompt to send to the model
            model: Model name to use (defaults to gemini-2.5-flash-lite)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0-1)
            timeout: Request timeout in seconds
            response_mime_type: Optional MIME type for response (e.g., 'application/json')
            
        Returns:
            Generated text response
            
        Raises:
            Exception: If API call fails
        """
        try:
            # Configure generation parameters
            config = types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                response_mime_type=response_mime_type
            )
            
            # Make the API call
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=config
            )
            
            # Extract and return the text
            return response.text.strip()
            
        except Exception as e:
            error_msg = str(e).lower()
            
            # Handle specific error types
            if 'api key' in error_msg or 'authentication' in error_msg or 'unauthorized' in error_msg:
                raise Exception("Gemini API authentication failed. Please check your API key.")
            elif 'quota' in error_msg or 'rate limit' in error_msg:
                raise Exception("Gemini API rate limit exceeded. Please try again later.")
            elif 'timeout' in error_msg:
                raise Exception("Gemini API request timeout")
            elif 'content' in error_msg and 'filter' in error_msg:
                raise Exception("Content was filtered by safety settings")
            else:
                raise Exception(f"Gemini API error: {e}")
    
    def check_availability(self) -> bool:
        """
        Check if Gemini API is accessible
        
        Returns:
            True if API is available, False otherwise
        """
        try:
            # Try a minimal generation request
            response = self.client.models.generate_content(
                model=GEMINI_MODEL,
                contents="test"
            )
            return bool(response.text)
        except Exception:
            return False


# Global client instance
try:
    gemini_client = GeminiClient()
except Exception as e:
    print(f"⚠ Warning: Failed to initialize Gemini client: {e}")
    gemini_client = None


def generate_text(
    prompt: str,
    model: str = GEMINI_MODEL,
    max_tokens: int = 500,
    temperature: float = 0.7,
    timeout: int = 90,
    response_mime_type: Optional[str] = None
) -> str:
    """
    Convenience function to generate text using the Gemini client
    
    Args:
        prompt: The prompt to send
        model: Model to use
        max_tokens: Maximum tokens to generate
        temperature: Sampling temperature
        timeout: Request timeout
        response_mime_type: Optional MIME type for response (e.g., 'application/json')
        
    Returns:
        Generated text
        
    Raises:
        Exception: If client is not initialized or generation fails
    """
    if gemini_client is None:
        raise Exception("Gemini client is not initialized")
    
    return gemini_client.generate(prompt, model, max_tokens, temperature, timeout, response_mime_type)


def check_ai_available() -> bool:
    """Check if Gemini API is available"""
    if gemini_client is None:
        return False
    return gemini_client.check_availability()
