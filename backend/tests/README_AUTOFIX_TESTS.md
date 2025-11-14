# Auto-Fix Integration Tests - Quick Reference

## Overview

Comprehensive test suite for the intelligent auto-fix resume feature covering end-to-end workflows, error scenarios, and performance benchmarks.

## Test Files

1. **test_autofix_e2e.py** - End-to-end workflow tests
2. **test_autofix_errors.py** - Error handling and resilience tests
3. **test_autofix_performance.py** - Performance and benchmarking tests

## Quick Start

### Run All Auto-Fix Tests
```bash
python -m pytest backend/tests/test_autofix_*.py -v
```

### Run Specific Test Suites

#### End-to-End Tests
```bash
python -m pytest backend/tests/test_autofix_e2e.py -v
```

#### Error Scenario Tests
```bash
python -m pytest backend/tests/test_autofix_errors.py -v
```

#### Performance Tests
```bash
python -m pytest backend/tests/test_autofix_performance.py -v
```

### Run Individual Tests

```bash
# Test complete workflow
python -m pytest backend/tests/test_autofix_e2e.py::TestAutoFixE2E::test_complete_autofix_workflow -v

# Test PDF generation
python -m pytest backend/tests/test_autofix_e2e.py::TestAutoFixE2E::test_pdf_generation_workflow -v

# Test error handling
python -m pytest backend/tests/test_autofix_errors.py::TestAutoFixErrors::test_ai_service_failure -v

# Test performance
python -m pytest backend/tests/test_autofix_performance.py::TestAutoFixPerformance::test_end_to_end_performance -v
```

## Test Categories

### 15.1: Complete Auto-Fix Workflow
Tests the full optimization flow from request to PDF generation.

**Key Tests:**
- `test_complete_autofix_workflow` - Full E2E flow
- `test_pdf_generation_workflow` - PDF creation
- `test_various_resume_types` - Different resume formats
- `test_ats_score_improvements` - Optimization verification
- `test_processing_time_performance` - Speed validation

### 15.2: Error Scenarios
Tests error handling, retry logic, and failure recovery.

**Key Tests:**
- `test_invalid_resume_json` - Invalid input handling
- `test_ai_service_failure` - AI service errors
- `test_pdf_generation_invalid_template` - Template errors
- `test_rate_limiting_autofix` - Rate limit behavior
- `test_concurrent_requests` - Concurrent handling

### 15.3: Performance Testing
Tests processing speed, throughput, and resource usage.

**Key Tests:**
- `test_small_resume_processing_time` - Small resume speed
- `test_medium_resume_processing_time` - Medium resume speed
- `test_large_resume_processing_time` - Large resume speed
- `test_end_to_end_performance` - Complete workflow timing
- `test_identify_bottlenecks` - Performance analysis

## Expected Results

### Performance Benchmarks
- Small resume (1 job): < 15 seconds
- Medium resume (3 jobs): < 25 seconds
- Large resume (6+ jobs): < 30 seconds
- PDF generation: < 10 seconds

### Success Criteria
- All E2E tests pass with real AI integration
- Error tests verify graceful failure handling
- Performance tests meet time requirements
- Rate limiting is active and working

## Troubleshooting

### WeasyPrint Import Errors
Tests automatically mock WeasyPrint to avoid dependency issues. If you see import errors, ensure the mock is properly configured at the top of each test file.

### Rate Limiting Issues
If tests fail due to rate limiting (429 errors), run tests individually or increase the delay between tests:

```bash
# Run with delays
python -m pytest backend/tests/test_autofix_e2e.py -v --tb=short -x
```

### AI Service Timeouts
Some tests may timeout if the AI service is slow. Increase timeout in pytest.ini:

```ini
[pytest]
timeout = 120
```

## Test Output Examples

### Successful E2E Test
```
✅ Auto-fix completed in 5.40s
✅ Applied 3 fixes
✅ PDF generated successfully (12345 bytes)
```

### Performance Test
```
✅ Small resume (1 job): 7.23s
✅ Medium resume (3 jobs): 15.67s
✅ Large resume (6 jobs): 24.89s
✅ End-to-end performance:
   - Auto-fix: 18.45s
   - PDF gen: 2.31s
   - Total: 20.76s
```

### Error Test
```
✅ Invalid JSON handled with status 400
✅ AI service failure handled: AI service unavailable
✅ Rate limiting test: 3 rate limited out of 10
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Auto-Fix Tests
  run: |
    cd backend
    python -m pytest tests/test_autofix_*.py -v --tb=short
```

### Test Coverage
```bash
# Run with coverage
python -m pytest backend/tests/test_autofix_*.py --cov=app --cov-report=html
```

## Notes

- Tests use real AI integration (Gemini API)
- WeasyPrint is mocked to avoid system dependencies
- Rate limiting is active - tests may need delays
- Performance tests measure actual processing time
- All tests are independent and can run in any order

## Related Documentation

- [Task 15 Testing Summary](../../TASK_15_TESTING_SUMMARY.md)
- [Auto-Fix README](../app/AUTO_FIX_README.md)
- [WeasyPrint Setup](../WEASYPRINT_SETUP.md)
