/**
 * Accessibility Checker Utility
 * Verifies screen reader support and ARIA compliance
 * 
 * WCAG 2.1 Requirements:
 * - All interactive elements must have accessible labels
 * - Proper heading hierarchy (h1 → h2 → h3)
 * - ARIA attributes must be valid and correct
 * - Images must have alt text or aria-label
 */

interface AccessibilityIssue {
  element: string;
  issue: string;
  severity: 'error' | 'warning';
  wcagCriterion: string;
}

/**
 * Check if all interactive elements have accessible labels
 */
export function checkInteractiveLabels(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button, index) => {
    const hasText = button.textContent?.trim();
    const hasAriaLabel = button.getAttribute('aria-label');
    const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        element: `button[${index}]`,
        issue: 'Button has no accessible label',
        severity: 'error',
        wcagCriterion: '4.1.2 Name, Role, Value',
      });
    }
  });
  
  // Check links
  const links = document.querySelectorAll('a');
  links.forEach((link, index) => {
    const hasText = link.textContent?.trim();
    const hasAriaLabel = link.getAttribute('aria-label');
    const hasAriaLabelledBy = link.getAttribute('aria-labelledby');
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        element: `a[${index}]`,
        issue: 'Link has no accessible label',
        severity: 'error',
        wcagCriterion: '2.4.4 Link Purpose',
      });
    }
  });
  
  // Check form inputs
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    const hasLabel = document.querySelector(`label[for="${input.id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        element: `${input.tagName.toLowerCase()}[${index}]`,
        issue: 'Form input has no accessible label',
        severity: 'error',
        wcagCriterion: '3.3.2 Labels or Instructions',
      });
    }
  });
  
  return issues;
}

/**
 * Check heading hierarchy
 * Ensures proper h1 → h2 → h3 structure
 */
export function checkHeadingHierarchy(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    
    // Check for h1
    if (index === 0 && level !== 1) {
      issues.push({
        element: heading.tagName,
        issue: 'First heading should be h1',
        severity: 'error',
        wcagCriterion: '1.3.1 Info and Relationships',
      });
    }
    
    // Check for skipped levels
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push({
        element: heading.tagName,
        issue: `Heading level skipped from h${previousLevel} to h${level}`,
        severity: 'warning',
        wcagCriterion: '1.3.1 Info and Relationships',
      });
    }
    
    previousLevel = level;
  });
  
  // Check for multiple h1s
  const h1Count = document.querySelectorAll('h1').length;
  if (h1Count > 1) {
    issues.push({
      element: 'h1',
      issue: `Multiple h1 elements found (${h1Count}). Should have only one per page.`,
      severity: 'warning',
      wcagCriterion: '1.3.1 Info and Relationships',
    });
  }
  
  return issues;
}

/**
 * Check ARIA attributes validity
 */
export function checkAriaAttributes(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Valid ARIA attributes
  const validAriaAttributes = [
    'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden',
    'aria-live', 'aria-atomic', 'aria-relevant', 'aria-busy',
    'aria-controls', 'aria-expanded', 'aria-haspopup', 'aria-pressed',
    'aria-selected', 'aria-checked', 'aria-disabled', 'aria-readonly',
    'aria-required', 'aria-invalid', 'aria-errormessage', 'aria-current',
  ];
  
  // Check all elements with aria-* attributes
  const elementsWithAria = document.querySelectorAll('[aria-hidden], [aria-label], [aria-labelledby], [role]');
  
  elementsWithAria.forEach((element) => {
    // Check aria-hidden on interactive elements
    if (element.getAttribute('aria-hidden') === 'true') {
      const isInteractive = element.matches('button, a, input, textarea, select');
      if (isInteractive) {
        issues.push({
          element: element.tagName.toLowerCase(),
          issue: 'Interactive element should not have aria-hidden="true"',
          severity: 'error',
          wcagCriterion: '4.1.2 Name, Role, Value',
        });
      }
    }
    
    // Check for invalid ARIA attributes
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith('aria-') && !validAriaAttributes.includes(attr.name)) {
        issues.push({
          element: element.tagName.toLowerCase(),
          issue: `Invalid ARIA attribute: ${attr.name}`,
          severity: 'warning',
          wcagCriterion: '4.1.2 Name, Role, Value',
        });
      }
    });
  });
  
  return issues;
}

/**
 * Check images for alt text
 */
export function checkImageAltText(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    const hasAlt = img.hasAttribute('alt');
    const hasAriaLabel = img.getAttribute('aria-label');
    const hasAriaHidden = img.getAttribute('aria-hidden') === 'true';
    const hasRole = img.getAttribute('role') === 'presentation';
    
    // Decorative images should have empty alt or aria-hidden
    // Content images must have descriptive alt text
    if (!hasAlt && !hasAriaLabel && !hasAriaHidden && !hasRole) {
      issues.push({
        element: `img[${index}]`,
        issue: 'Image missing alt text or aria-label',
        severity: 'error',
        wcagCriterion: '1.1.1 Non-text Content',
      });
    }
  });
  
  return issues;
}

/**
 * Run all accessibility checks
 */
export function runAccessibilityAudit(): {
  passed: boolean;
  errors: AccessibilityIssue[];
  warnings: AccessibilityIssue[];
} {
  const allIssues = [
    ...checkInteractiveLabels(),
    ...checkHeadingHierarchy(),
    ...checkAriaAttributes(),
    ...checkImageAltText(),
  ];
  
  const errors = allIssues.filter((issue) => issue.severity === 'error');
  const warnings = allIssues.filter((issue) => issue.severity === 'warning');
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log accessibility audit results to console
 */
export function logAccessibilityReport(): void {
  const { passed, errors, warnings } = runAccessibilityAudit();
  
  console.group('♿ Accessibility Audit Report');
  
  if (passed) {
    console.log('✅ No critical accessibility errors found!');
  } else {
    console.error(`❌ Found ${errors.length} critical accessibility errors`);
  }
  
  if (errors.length > 0) {
    console.group(`🚨 Errors (${errors.length})`);
    errors.forEach(({ element, issue, wcagCriterion }) => {
      console.error(`${element}: ${issue} (${wcagCriterion})`);
    });
    console.groupEnd();
  }
  
  if (warnings.length > 0) {
    console.group(`⚠️ Warnings (${warnings.length})`);
    warnings.forEach(({ element, issue, wcagCriterion }) => {
      console.warn(`${element}: ${issue} (${wcagCriterion})`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Check if screen reader is likely active
 * Note: This is not 100% reliable but provides a hint
 */
export function detectScreenReader(): boolean {
  // Check for common screen reader indicators
  const hasAriaLive = document.querySelectorAll('[aria-live]').length > 0;
  const hasAriaAtomic = document.querySelectorAll('[aria-atomic]').length > 0;
  
  // Check if user is navigating with keyboard
  let keyboardNavigation = false;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      keyboardNavigation = true;
    }
  });
  
  return hasAriaLive || hasAriaAtomic || keyboardNavigation;
}
