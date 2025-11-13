"""
Batch Processor for Auto-Fix Operations
Optimizes processing of multiple fixes by batching AI calls and parallel processing
"""

import asyncio
from typing import List, Dict, Any, Callable, TypeVar, Optional
from concurrent.futures import ThreadPoolExecutor
import time

T = TypeVar('T')


class BatchProcessor:
    """
    Batch processor for optimizing multiple operations
    """
    
    def __init__(self, max_workers: int = 5, batch_size: int = 10):
        """
        Initialize batch processor
        
        Args:
            max_workers: Maximum number of parallel workers
            batch_size: Maximum items per batch
        """
        self.max_workers = max_workers
        self.batch_size = batch_size
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
    
    async def process_batch(
        self,
        items: List[T],
        processor: Callable[[T], Any],
        parallel: bool = True
    ) -> List[Any]:
        """
        Process a batch of items
        
        Args:
            items: List of items to process
            processor: Function to process each item
            parallel: Whether to process in parallel
            
        Returns:
            List of processed results
        """
        if not items:
            return []
        
        if parallel and len(items) > 1:
            # Process in parallel
            loop = asyncio.get_event_loop()
            tasks = [
                loop.run_in_executor(self.executor, processor, item)
                for item in items
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions and log them
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    print(f"Error processing item {i}: {result}")
                else:
                    processed_results.append(result)
            
            return processed_results
        else:
            # Process sequentially
            results = []
            for item in items:
                try:
                    result = processor(item)
                    results.append(result)
                except Exception as e:
                    print(f"Error processing item: {e}")
            return results
    
    async def process_in_batches(
        self,
        items: List[T],
        processor: Callable[[List[T]], Any],
        batch_size: Optional[int] = None
    ) -> List[Any]:
        """
        Process items in batches
        
        Args:
            items: List of items to process
            processor: Function that processes a batch of items
            batch_size: Size of each batch (defaults to self.batch_size)
            
        Returns:
            List of batch results
        """
        if not items:
            return []
        
        actual_batch_size = batch_size or self.batch_size
        batches = [
            items[i:i + actual_batch_size]
            for i in range(0, len(items), actual_batch_size)
        ]
        
        results = []
        for batch in batches:
            try:
                result = await asyncio.to_thread(processor, batch)
                results.append(result)
            except Exception as e:
                print(f"Error processing batch: {e}")
        
        return results
    
    def shutdown(self):
        """Shutdown the executor"""
        self.executor.shutdown(wait=True)


class DebouncedProcessor:
    """
    Debounced processor to prevent duplicate calls
    """
    
    def __init__(self, delay: float = 0.5):
        """
        Initialize debounced processor
        
        Args:
            delay: Delay in seconds before processing
        """
        self.delay = delay
        self.pending_tasks: Dict[str, asyncio.Task] = {}
        self.results_cache: Dict[str, Any] = {}
    
    async def process(
        self,
        key: str,
        processor: Callable[[], Any],
        force: bool = False
    ) -> Any:
        """
        Process with debouncing
        
        Args:
            key: Unique key for this operation
            processor: Function to execute
            force: Force immediate execution
            
        Returns:
            Result of processing
        """
        # Check if result is already cached
        if key in self.results_cache and not force:
            return self.results_cache[key]
        
        # Cancel pending task if exists
        if key in self.pending_tasks:
            self.pending_tasks[key].cancel()
        
        if force:
            # Execute immediately
            result = await asyncio.to_thread(processor)
            self.results_cache[key] = result
            return result
        
        # Create debounced task
        async def debounced_task():
            await asyncio.sleep(self.delay)
            result = await asyncio.to_thread(processor)
            self.results_cache[key] = result
            del self.pending_tasks[key]
            return result
        
        task = asyncio.create_task(debounced_task())
        self.pending_tasks[key] = task
        
        return await task
    
    def clear_cache(self, key: Optional[str] = None):
        """
        Clear cached results
        
        Args:
            key: Specific key to clear, or None to clear all
        """
        if key:
            self.results_cache.pop(key, None)
        else:
            self.results_cache.clear()


class ParallelFixProcessor:
    """
    Parallel processor for auto-fix operations
    Optimizes processing of independent fixes
    """
    
    def __init__(self):
        """Initialize parallel fix processor"""
        self.batch_processor = BatchProcessor(max_workers=3)
    
    async def process_fixes_parallel(
        self,
        resume: Dict[str, Any],
        fixes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Process multiple fixes in parallel when possible
        
        Identifies independent fixes that can be processed simultaneously
        and executes them in parallel for better performance.
        
        Args:
            resume: Resume data
            fixes: List of fixes to apply
            
        Returns:
            Resume with all fixes applied
        """
        # Group fixes by dependency
        independent_fixes = []
        dependent_fixes = []
        
        for fix in fixes:
            # Determine if fix is independent
            # Independent fixes: grammar, keyword injection, formatting
            # Dependent fixes: content optimization (needs to be done first)
            fix_type = fix.get('type', 'unknown')
            
            if fix_type in ['grammar', 'keyword', 'format']:
                independent_fixes.append(fix)
            else:
                dependent_fixes.append(fix)
        
        # Process dependent fixes first (sequentially)
        current_resume = resume
        for fix in dependent_fixes:
            current_resume = await self._apply_fix(current_resume, fix)
        
        # Process independent fixes in parallel
        if independent_fixes:
            # Create tasks for each independent fix
            tasks = [
                self._apply_fix(current_resume.copy(), fix)
                for fix in independent_fixes
            ]
            
            # Execute in parallel
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Merge results
            for result in results:
                if not isinstance(result, Exception):
                    current_resume = self._merge_resume_changes(current_resume, result)
        
        return current_resume
    
    async def _apply_fix(
        self,
        resume: Dict[str, Any],
        fix: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Apply a single fix to resume
        
        Args:
            resume: Resume data
            fix: Fix to apply
            
        Returns:
            Resume with fix applied
        """
        # This is a placeholder - actual implementation would call
        # specific fix functions based on fix type
        fix_type = fix.get('type', 'unknown')
        
        if fix_type == 'grammar':
            # Apply grammar fix
            pass
        elif fix_type == 'keyword':
            # Apply keyword injection
            pass
        elif fix_type == 'format':
            # Apply formatting fix
            pass
        
        return resume
    
    def _merge_resume_changes(
        self,
        base_resume: Dict[str, Any],
        updated_resume: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Merge changes from updated resume into base resume
        
        Args:
            base_resume: Base resume
            updated_resume: Resume with updates
            
        Returns:
            Merged resume
        """
        # Deep merge logic
        merged = base_resume.copy()
        
        for key, value in updated_resume.items():
            if key not in merged:
                merged[key] = value
            elif isinstance(value, dict) and isinstance(merged[key], dict):
                merged[key] = self._merge_resume_changes(merged[key], value)
            elif isinstance(value, list) and isinstance(merged[key], list):
                # For lists, prefer the updated version if different
                if value != merged[key]:
                    merged[key] = value
            else:
                # Prefer updated value
                merged[key] = value
        
        return merged
    
    def shutdown(self):
        """Shutdown the processor"""
        self.batch_processor.shutdown()


class BatchAIProcessor:
    """
    Batch processor for AI operations
    Combines multiple AI requests into single calls when possible
    """
    
    def __init__(self):
        """Initialize batch AI processor"""
        self.pending_requests: List[Dict[str, Any]] = []
        self.batch_delay = 0.1  # 100ms delay to collect requests
        self.processing = False
    
    async def add_request(
        self,
        request_type: str,
        data: Dict[str, Any],
        processor: Callable[[List[Dict[str, Any]]], Any]
    ) -> Any:
        """
        Add a request to the batch
        
        Args:
            request_type: Type of request
            data: Request data
            processor: Function to process batch
            
        Returns:
            Result for this specific request
        """
        # Add to pending requests
        request_id = f"{request_type}_{len(self.pending_requests)}"
        request = {
            'id': request_id,
            'type': request_type,
            'data': data,
            'result': None
        }
        self.pending_requests.append(request)
        
        # Wait for batch delay
        await asyncio.sleep(self.batch_delay)
        
        # Process batch if not already processing
        if not self.processing and self.pending_requests:
            self.processing = True
            
            # Get all pending requests
            batch = self.pending_requests.copy()
            self.pending_requests.clear()
            
            # Process batch
            try:
                results = await asyncio.to_thread(processor, batch)
                
                # Distribute results
                for i, req in enumerate(batch):
                    if i < len(results):
                        req['result'] = results[i]
            except Exception as e:
                print(f"Error processing batch: {e}")
            finally:
                self.processing = False
        
        # Find and return result for this request
        for req in self.pending_requests:
            if req['id'] == request_id:
                return req['result']
        
        return None
    
    def can_batch(self, request_type: str) -> bool:
        """
        Check if request type can be batched
        
        Args:
            request_type: Type of request
            
        Returns:
            True if can be batched
        """
        # Define which request types can be batched
        batchable_types = [
            'grammar_fix',
            'keyword_injection',
            'bullet_rewrite'
        ]
        return request_type in batchable_types


# Global instances
batch_processor = BatchProcessor()
debounced_processor = DebouncedProcessor()
parallel_fix_processor = ParallelFixProcessor()
batch_ai_processor = BatchAIProcessor()


def combine_fixes_for_single_ai_call(
    resume: Dict[str, Any],
    issues: List[Dict[str, Any]],
    recommendations: List[Dict[str, Any]]
) -> str:
    """
    Combine multiple fixes into a single comprehensive AI prompt
    
    This reduces the number of AI calls by handling multiple fix types
    in one request.
    
    Args:
        resume: Resume data
        issues: List of issues to fix
        recommendations: List of recommendations to apply
        
    Returns:
        Combined prompt for AI
    """
    import json
    
    resume_json = json.dumps(resume, indent=2)
    
    # Group fixes by type
    grammar_issues = [i for i in issues if i.get('type') == 'grammar']
    keyword_issues = [i for i in issues if i.get('type') == 'keyword']
    format_issues = [i for i in issues if i.get('type') == 'format']
    
    prompt = f"""You are a comprehensive resume optimization expert. Apply ALL of the following improvements in a single pass:

RESUME (JSON):
{resume_json}

GRAMMAR FIXES ({len(grammar_issues)} issues):
{json.dumps(grammar_issues, indent=2)}

KEYWORD OPTIMIZATIONS ({len(keyword_issues)} issues):
{json.dumps(keyword_issues, indent=2)}

FORMAT IMPROVEMENTS ({len(format_issues)} issues):
{json.dumps(format_issues, indent=2)}

RECOMMENDATIONS ({len(recommendations)} items):
{json.dumps(recommendations, indent=2)}

INSTRUCTIONS:
1. Fix ALL grammar errors
2. Inject ALL recommended keywords naturally
3. Apply ALL formatting improvements
4. Implement ALL recommendations
5. Maintain factual accuracy and authentic voice

Return the complete optimized resume as JSON with the same structure."""
    
    return prompt


async def process_fixes_in_parallel(
    resume: Dict[str, Any],
    fixes: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Process independent fixes in parallel
    
    Args:
        resume: Resume data
        fixes: List of fixes to apply
        
    Returns:
        Resume with all fixes applied
    """
    return await parallel_fix_processor.process_fixes_parallel(resume, fixes)
