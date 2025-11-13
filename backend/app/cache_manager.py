"""
Cache Manager for Performance Optimization
Provides in-memory caching for template rendering, AI prompts, and IndexedDB queries
"""

import time
import hashlib
from typing import Any, Dict, Optional, Callable, TypeVar, Generic
from functools import wraps
from collections import OrderedDict
import threading


T = TypeVar('T')


class LRUCache(Generic[T]):
    """
    Thread-safe LRU (Least Recently Used) cache implementation
    """
    
    def __init__(self, max_size: int = 100, ttl: Optional[int] = None):
        """
        Initialize LRU cache
        
        Args:
            max_size: Maximum number of items to store
            ttl: Time-to-live in seconds (None for no expiration)
        """
        self.max_size = max_size
        self.ttl = ttl
        self.cache: OrderedDict[str, tuple[T, float]] = OrderedDict()
        self.lock = threading.Lock()
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[T]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        with self.lock:
            if key not in self.cache:
                self.misses += 1
                return None
            
            value, timestamp = self.cache[key]
            
            # Check if expired
            if self.ttl and (time.time() - timestamp) > self.ttl:
                del self.cache[key]
                self.misses += 1
                return None
            
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            self.hits += 1
            return value
    
    def set(self, key: str, value: T) -> None:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
        """
        with self.lock:
            # Remove oldest item if at capacity
            if key not in self.cache and len(self.cache) >= self.max_size:
                self.cache.popitem(last=False)
            
            # Add/update value with current timestamp
            self.cache[key] = (value, time.time())
            self.cache.move_to_end(key)
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            True if key was found and deleted
        """
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                return True
            return False
    
    def clear(self) -> None:
        """Clear all cached values"""
        with self.lock:
            self.cache.clear()
            self.hits = 0
            self.misses = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dictionary with cache stats
        """
        with self.lock:
            total_requests = self.hits + self.misses
            hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
            
            return {
                'size': len(self.cache),
                'max_size': self.max_size,
                'hits': self.hits,
                'misses': self.misses,
                'hit_rate': f"{hit_rate:.2f}%",
                'ttl': self.ttl
            }


class CacheManager:
    """
    Central cache manager for the application
    Manages multiple caches for different purposes
    """
    
    def __init__(self):
        """Initialize cache manager with different cache types"""
        # Template rendering cache (larger, longer TTL)
        self.template_cache = LRUCache[str](max_size=50, ttl=3600)  # 1 hour
        
        # AI prompt cache (medium size, medium TTL)
        self.prompt_cache = LRUCache[str](max_size=100, ttl=1800)  # 30 minutes
        
        # AI response cache (smaller, shorter TTL)
        self.ai_response_cache = LRUCache[Dict[str, Any]](max_size=50, ttl=900)  # 15 minutes
        
        # PDF generation cache (smaller, longer TTL)
        self.pdf_cache = LRUCache[bytes](max_size=20, ttl=3600)  # 1 hour
        
        # General purpose cache
        self.general_cache = LRUCache[Any](max_size=100, ttl=600)  # 10 minutes
    
    def get_template_cache(self) -> LRUCache[str]:
        """Get template rendering cache"""
        return self.template_cache
    
    def get_prompt_cache(self) -> LRUCache[str]:
        """Get AI prompt cache"""
        return self.prompt_cache
    
    def get_ai_response_cache(self) -> LRUCache[Dict[str, Any]]:
        """Get AI response cache"""
        return self.ai_response_cache
    
    def get_pdf_cache(self) -> LRUCache[bytes]:
        """Get PDF generation cache"""
        return self.pdf_cache
    
    def get_general_cache(self) -> LRUCache[Any]:
        """Get general purpose cache"""
        return self.general_cache
    
    def clear_all(self) -> None:
        """Clear all caches"""
        self.template_cache.clear()
        self.prompt_cache.clear()
        self.ai_response_cache.clear()
        self.pdf_cache.clear()
        self.general_cache.clear()
    
    def get_all_stats(self) -> Dict[str, Dict[str, Any]]:
        """
        Get statistics for all caches
        
        Returns:
            Dictionary with stats for each cache
        """
        return {
            'template_cache': self.template_cache.get_stats(),
            'prompt_cache': self.prompt_cache.get_stats(),
            'ai_response_cache': self.ai_response_cache.get_stats(),
            'pdf_cache': self.pdf_cache.get_stats(),
            'general_cache': self.general_cache.get_stats()
        }


# Global cache manager instance
cache_manager = CacheManager()


def generate_cache_key(*args, **kwargs) -> str:
    """
    Generate a cache key from arguments
    
    Args:
        *args: Positional arguments
        **kwargs: Keyword arguments
        
    Returns:
        Hash string to use as cache key
    """
    # Convert args and kwargs to a stable string representation
    key_parts = []
    
    for arg in args:
        if isinstance(arg, (dict, list)):
            import json
            key_parts.append(json.dumps(arg, sort_keys=True))
        else:
            key_parts.append(str(arg))
    
    for k, v in sorted(kwargs.items()):
        if isinstance(v, (dict, list)):
            import json
            key_parts.append(f"{k}={json.dumps(v, sort_keys=True)}")
        else:
            key_parts.append(f"{k}={v}")
    
    # Generate hash
    key_string = "|".join(key_parts)
    return hashlib.md5(key_string.encode()).hexdigest()


def cached(cache_type: str = 'general', key_prefix: str = ''):
    """
    Decorator for caching function results
    
    Args:
        cache_type: Type of cache to use ('template', 'prompt', 'ai_response', 'pdf', 'general')
        key_prefix: Prefix for cache keys
        
    Returns:
        Decorated function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Get appropriate cache
            if cache_type == 'template':
                cache = cache_manager.get_template_cache()
            elif cache_type == 'prompt':
                cache = cache_manager.get_prompt_cache()
            elif cache_type == 'ai_response':
                cache = cache_manager.get_ai_response_cache()
            elif cache_type == 'pdf':
                cache = cache_manager.get_pdf_cache()
            else:
                cache = cache_manager.get_general_cache()
            
            # Generate cache key
            cache_key = f"{key_prefix}:{generate_cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Call function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result)
            
            return result
        
        return wrapper
    return decorator


def invalidate_cache(cache_type: str = 'general', key_prefix: str = '', *args, **kwargs) -> bool:
    """
    Invalidate a specific cache entry
    
    Args:
        cache_type: Type of cache
        key_prefix: Prefix for cache key
        *args: Arguments used to generate cache key
        **kwargs: Keyword arguments used to generate cache key
        
    Returns:
        True if cache entry was found and deleted
    """
    # Get appropriate cache
    if cache_type == 'template':
        cache = cache_manager.get_template_cache()
    elif cache_type == 'prompt':
        cache = cache_manager.get_prompt_cache()
    elif cache_type == 'ai_response':
        cache = cache_manager.get_ai_response_cache()
    elif cache_type == 'pdf':
        cache = cache_manager.get_pdf_cache()
    else:
        cache = cache_manager.get_general_cache()
    
    # Generate cache key
    cache_key = f"{key_prefix}:{generate_cache_key(*args, **kwargs)}"
    
    # Delete from cache
    return cache.delete(cache_key)


# Convenience functions for specific cache types

def cache_template(key_prefix: str = 'template'):
    """Decorator for caching template rendering results"""
    return cached(cache_type='template', key_prefix=key_prefix)


def cache_prompt(key_prefix: str = 'prompt'):
    """Decorator for caching AI prompts"""
    return cached(cache_type='prompt', key_prefix=key_prefix)


def cache_ai_response(key_prefix: str = 'ai_response'):
    """Decorator for caching AI responses"""
    return cached(cache_type='ai_response', key_prefix=key_prefix)


def cache_pdf(key_prefix: str = 'pdf'):
    """Decorator for caching PDF generation results"""
    return cached(cache_type='pdf', key_prefix=key_prefix)
