"""
Rate limiting middleware
Prevents API abuse by limiting requests per IP address
"""

from fastapi import HTTPException, Request
from functools import wraps
import time
from collections import defaultdict, deque
from typing import Dict, Deque

# In-memory storage for rate limiting
# In production, use Redis for distributed rate limiting
request_history: Dict[str, Deque[float]] = defaultdict(deque)


def get_client_ip(request: Request) -> str:
    """
    Extract client IP address from request
    
    Args:
        request: FastAPI request object
        
    Returns:
        Client IP address
    """
    # Check for forwarded IP (behind proxy)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    # Check for real IP
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client
    return request.client.host if request.client else "unknown"


def rate_limit(max_requests: int = 10, window_seconds: int = 60):
    """
    Rate limiting decorator
    
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        
    Usage:
        @rate_limit(max_requests=10, window_seconds=60)
        async def my_endpoint(request: Request):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = get_client_ip(request)
            current_time = time.time()
            
            # Get request history for this IP
            history = request_history[client_ip]
            
            # Remove requests outside the time window
            while history and history[0] < current_time - window_seconds:
                history.popleft()
            
            # Check if rate limit exceeded
            if len(history) >= max_requests:
                # Calculate retry-after time
                oldest_request = history[0]
                retry_after = int(window_seconds - (current_time - oldest_request)) + 1
                
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)}
                )
            
            # Add current request to history
            history.append(current_time)
            
            # Call the actual endpoint
            return await func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def cleanup_old_entries(max_age_seconds: int = 3600):
    """
    Clean up old entries from request history
    Should be called periodically (e.g., every hour)
    
    Args:
        max_age_seconds: Maximum age of entries to keep
    """
    current_time = time.time()
    cutoff_time = current_time - max_age_seconds
    
    # Remove IPs with no recent requests
    ips_to_remove = []
    for ip, history in request_history.items():
        # Remove old requests
        while history and history[0] < cutoff_time:
            history.popleft()
        
        # Mark IP for removal if no recent requests
        if not history:
            ips_to_remove.append(ip)
    
    # Remove empty IP entries
    for ip in ips_to_remove:
        del request_history[ip]
    
    return len(ips_to_remove)
