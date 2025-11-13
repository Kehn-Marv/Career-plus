"""
Test script for auto-fix infrastructure
Verifies that all modules can be imported and basic functionality works
"""

import sys
import json

def test_imports():
    """Test that all modules can be imported"""
    print("Testing module imports...")
    
    try:
        from app.resume_optimizer import (
            optimize_resume_content,
            build_optimization_prompt,
            format_issues_for_prompt,
            format_recommendations_for_prompt,
            parse_json_response,
            validate_resume_structure
        )
        print("✓ resume_optimizer module imported successfully")
    except Exception as e:
        print(f"✗ Failed to import resume_optimizer: {e}")
        return False
    
    try:
        from app.grammar_fixer import (
            fix_grammar_and_ats,
            build_grammar_prompt,
            improve_ats_phrasing,
            convert_passive_to_active,
            ensure_consistent_verb_tense,
            improve_parallel_structure,
            apply_ats_phrasing_improvements
        )
        print("✓ grammar_fixer module imported successfully")
    except Exception as e:
        print(f"✗ Failed to import grammar_fixer: {e}")
        return False
    
    try:
        from app.keyword_injector import (
            inject_keywords_intelligently,
            extract_missing_keywords,
            build_keyword_injection_prompt,
            determine_keyword_placements
        )
        print("✓ keyword_injector module imported successfully")
    except Exception as e:
        print(f"✗ Failed to import keyword_injector: {e}")
        return False
    
    try:
        from app.template_engine import template_engine
        print("✓ template_engine module imported successfully")
    except Exception as e:
        print(f"✗ Failed to import template_engine: {e}")
        return False
    
    return True


def test_template_engine():
    """Test template engine functionality"""
    print("\nTesting template engine...")
    
    try:
        from app.template_engine import template_engine
        
        # List templates
        templates = template_engine.list_templates()
        print(f"✓ Found {len(templates)} templates: {list(templates.keys())}")
        
        # Test rendering with sample data
        sample_resume = {
            "name": "John Doe",
            "contact": {
                "email": "john@example.com",
                "phone": "555-1234",
                "location": "New York, NY"
            },
            "summary": "Experienced software engineer with 5 years of experience.",
            "experience": [
                {
                    "title": "Software Engineer",
                    "company": "Tech Corp",
                    "dates": "2020 - Present",
                    "location": "New York, NY",
                    "description": [
                        "Developed web applications",
                        "Led team of 3 developers"
                    ]
                }
            ],
            "education": [
                {
                    "degree": "BS Computer Science",
                    "institution": "University",
                    "dates": "2015 - 2019"
                }
            ],
            "skills": ["Python", "JavaScript", "React"],
            "certifications": ["AWS Certified Developer"]
        }
        
        # Try rendering each template
        for template_id in templates.keys():
            html = template_engine.render(template_id, sample_resume)
            if len(html) > 0:
                print(f"✓ Successfully rendered '{template_id}' template ({len(html)} chars)")
            else:
                print(f"✗ Failed to render '{template_id}' template")
                return False
        
        # Test PDF generation with first template
        try:
            first_template = list(templates.keys())[0]
            pdf_bytes = template_engine.generate_pdf(first_template, sample_resume)
            if len(pdf_bytes) > 0:
                print(f"✓ Successfully generated PDF ({len(pdf_bytes)} bytes)")
            else:
                print("✗ Generated empty PDF")
                return False
        except Exception as e:
            print(f"⚠ PDF generation test skipped (WeasyPrint may not be installed): {e}")
            # Don't fail the test if WeasyPrint isn't available
        
        return True
        
    except Exception as e:
        print(f"✗ Template engine test failed: {e}")
        return False


def test_prompt_builders():
    """Test prompt building functions"""
    print("\nTesting prompt builders...")
    
    try:
        from app.resume_optimizer import (
            build_optimization_prompt,
            format_issues_for_prompt,
            format_recommendations_for_prompt
        )
        from app.grammar_fixer import build_grammar_prompt
        from app.keyword_injector import build_keyword_injection_prompt
        
        sample_resume = {
            "summary": "Software engineer",
            "experience": [],
            "education": [],
            "skills": ["Python"]
        }
        
        sample_issues = [
            {
                "severity": "critical",
                "title": "Missing keywords",
                "description": "Resume lacks important keywords",
                "suggestion": "Add relevant keywords"
            }
        ]
        
        sample_recommendations = [
            {
                "type": "keyword",
                "suggestedText": "React, Node.js",
                "explanation": "Add these technologies",
                "impact": 8
            }
        ]
        
        # Test optimization prompt
        opt_prompt = build_optimization_prompt(
            sample_resume,
            sample_issues,
            sample_recommendations,
            "Software engineer position"
        )
        print(f"✓ Built optimization prompt ({len(opt_prompt)} chars)")
        
        # Test grammar prompt
        grammar_prompt = build_grammar_prompt(sample_resume)
        print(f"✓ Built grammar prompt ({len(grammar_prompt)} chars)")
        
        # Test keyword injection prompt
        keyword_placements = {"skills": ["React", "Node.js"]}
        keyword_prompt = build_keyword_injection_prompt(
            sample_resume,
            keyword_placements,
            "Software engineer position"
        )
        print(f"✓ Built keyword injection prompt ({len(keyword_prompt)} chars)")
        
        return True
        
    except Exception as e:
        print(f"✗ Prompt builder test failed: {e}")
        return False


def test_json_parsing():
    """Test JSON response parsing"""
    print("\nTesting JSON parsing...")
    
    try:
        from app.resume_optimizer import parse_json_response, validate_resume_structure
        
        # Test valid JSON
        valid_json = '{"summary": "Test", "experience": [], "education": [], "skills": []}'
        result = parse_json_response(valid_json)
        print("✓ Parsed valid JSON")
        
        # Test JSON with markdown code blocks
        markdown_json = '''```json
{
  "summary": "Test",
  "experience": [],
  "education": [],
  "skills": []
}
```'''
        result = parse_json_response(markdown_json)
        print("✓ Parsed JSON with markdown code blocks")
        
        # Test validation
        validate_resume_structure(result)
        print("✓ Validated resume structure")
        
        return True
        
    except Exception as e:
        print(f"✗ JSON parsing test failed: {e}")
        return False


def test_keyword_extraction():
    """Test keyword extraction from recommendations"""
    print("\nTesting keyword extraction...")
    
    try:
        from app.keyword_injector import extract_missing_keywords, determine_keyword_placements
        
        recommendations = [
            {
                "type": "keyword",
                "suggestedText": "Python, JavaScript, React"
            },
            {
                "type": "content",
                "suggestedText": "Improve summary"
            },
            {
                "type": "keyword",
                "suggested_text": "Node.js, Docker"  # Test alternate key
            }
        ]
        
        keywords = extract_missing_keywords(recommendations)
        print(f"✓ Extracted {len(keywords)} keywords: {keywords}")
        
        if len(keywords) > 0:
            # Test keyword placement determination
            sample_resume = {
                "summary": "Software engineer",
                "experience": [],
                "skills": ["Python"]
            }
            placements = determine_keyword_placements(keywords, sample_resume, "Software engineer position")
            print(f"✓ Determined placements: {placements}")
            return True
        else:
            print("✗ No keywords extracted")
            return False
        
    except Exception as e:
        print(f"✗ Keyword extraction test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_ats_phrasing_improvements():
    """Test ATS phrasing improvement functions"""
    print("\nTesting ATS phrasing improvements...")
    
    try:
        from app.grammar_fixer import (
            improve_ats_phrasing,
            convert_passive_to_active,
            ensure_consistent_verb_tense,
            improve_parallel_structure,
            apply_ats_phrasing_improvements
        )
        
        # Test weak verb replacement
        weak_text = "I helped with the project and worked on the implementation"
        improved_text = improve_ats_phrasing(weak_text)
        if "facilitated" in improved_text or "developed" in improved_text:
            print("✓ Weak verb replacement works")
        else:
            print(f"✗ Weak verb replacement failed: {improved_text}")
            return False
        
        # Test passive to active voice conversion
        passive_text = "was responsible for managing the team"
        active_text = convert_passive_to_active(passive_text)
        if "managed" in active_text.lower():
            print("✓ Passive to active voice conversion works")
        else:
            print(f"✗ Passive to active conversion failed: {active_text}")
            return False
        
        # Test verb tense consistency
        experience_items = [
            {
                "title": "Software Engineer",
                "company": "Tech Corp",
                "dates": "2020 - 2022",
                "description": ["Manage team", "Develop software"]
            },
            {
                "title": "Senior Engineer",
                "company": "Tech Corp",
                "dates": "2022 - Present",
                "description": ["Lead projects", "Create solutions"]
            }
        ]
        consistent_items = ensure_consistent_verb_tense(experience_items)
        # Past role should have past tense
        if "managed" in consistent_items[0]["description"][0].lower():
            print("✓ Verb tense consistency works")
        else:
            print(f"✗ Verb tense consistency failed: {consistent_items[0]['description']}")
            return False
        
        # Test parallel structure
        bullets = ["the project was completed", "Managed team", "developing software."]
        improved_bullets = improve_parallel_structure(bullets)
        # All should start with capital, no periods, no articles
        if all(b[0].isupper() and not b.endswith('.') for b in improved_bullets):
            print("✓ Parallel structure improvement works")
        else:
            print(f"✗ Parallel structure failed: {improved_bullets}")
            return False
        
        # Test comprehensive ATS phrasing improvements
        sample_resume = {
            "summary": "I helped with projects and was responsible for team management",
            "experience": [
                {
                    "title": "Engineer",
                    "company": "Corp",
                    "dates": "2020 - 2022",
                    "description": ["worked on features", "was given tasks"]
                }
            ]
        }
        improved_resume = apply_ats_phrasing_improvements(sample_resume)
        if "facilitated" in improved_resume["summary"] or "managed" in improved_resume["summary"]:
            print("✓ Comprehensive ATS phrasing improvements work")
        else:
            print(f"✗ Comprehensive improvements failed: {improved_resume['summary']}")
            return False
        
        return True
        
    except Exception as e:
        print(f"✗ ATS phrasing improvements test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_weasyprint():
    """Test WeasyPrint availability (optional)"""
    print("\nTesting WeasyPrint (optional)...")
    
    try:
        from weasyprint import HTML
        
        html = HTML(string='<h1>Test PDF</h1>')
        pdf = html.write_pdf()
        
        if len(pdf) > 0:
            print(f"✓ WeasyPrint is working! Generated PDF ({len(pdf)} bytes)")
            return True
        else:
            print("✗ WeasyPrint generated empty PDF")
            return False
            
    except Exception as e:
        print(f"⚠ WeasyPrint not available: {e}")
        print("  This is optional for development. See WEASYPRINT_SETUP.md for installation.")
        return True  # Don't fail the test if WeasyPrint isn't available


def main():
    """Run all tests"""
    print("=" * 60)
    print("Auto-Fix Infrastructure Test Suite")
    print("=" * 60)
    
    tests = [
        ("Module Imports", test_imports),
        ("Template Engine", test_template_engine),
        ("Prompt Builders", test_prompt_builders),
        ("JSON Parsing", test_json_parsing),
        ("Keyword Extraction", test_keyword_extraction),
        ("ATS Phrasing Improvements", test_ats_phrasing_improvements),
        ("WeasyPrint", test_weasyprint)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n✗ Test '{test_name}' crashed: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Auto-fix infrastructure is ready.")
        return 0
    else:
        print(f"\n⚠ {total - passed} test(s) failed. Please review the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
