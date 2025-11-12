# Localization Components

This directory contains components for regional resume localization.

## Components

### RegionSelector

A component that allows users to optimize their resume for specific geographic regions (US, UK, EU, APAC).

**Features:**
- Region selection with visual flags and descriptions
- Preview modal showing regional formatting changes
- Automatic PDF generation with region-specific filename format
- Integration with optimization store for state management
- Error handling with user-friendly messages

**Usage:**
```tsx
import { RegionSelector } from '@/components/localization'

<RegionSelector
  analysisId={analysisId}
  onLocalizationComplete={(result) => {
    console.log('Localization completed:', result)
  }}
/>
```

**Props:**
- `analysisId` (number): The ID of the analysis session
- `onLocalizationComplete` (optional): Callback function called when localization completes

**Workflow:**
1. User selects a region (US, UK, EU, or APAC)
2. Preview modal displays regional features and changes
3. User confirms and applies localization
4. System applies regional formatting rules to the optimized resume
5. PDF is generated with region-specific template
6. File is automatically downloaded with format: `Resume_[Region]_[JobTitle]_[Date].pdf`

**Regional Features:**

**US (United States):**
- No photo or personal details
- MM/DD/YYYY date format
- Skills-first approach
- Quantifiable achievements

**UK (United Kingdom):**
- Optional photo
- DD/MM/YYYY date format
- CV terminology
- Nationality if relevant

**EU (European Union):**
- Photo expected
- DD.MM.YYYY date format
- Date of birth included
- Detailed personal info

**APAC (Asia-Pacific):**
- Photo required
- YYYY/MM/DD date format
- Personal details section
- Formal tone

### LocalizationModal

A modal component that displays localization advice from the backend API.

**Note:** This component is currently used for displaying backend-generated localization recommendations. The RegionSelector component provides the full localization workflow including PDF generation and download.

## Integration

The localization components integrate with:
- **Optimization Store** (`@/store/optimization-store`): For state management and localization actions
- **Regional Formatter** (`@/lib/localization/regional-formatter`): For applying regional formatting rules
- **PDF Generator** (`@/lib/pdf/pdf-generator`): For generating and downloading PDFs
- **Orchestrator** (`@/lib/orchestrator/orchestrator`): For coordinating the localization workflow

## Error Handling

The RegionSelector component handles errors gracefully:
- Missing optimized resume: Prompts user to run Auto Fix first
- PDF generation failures: Displays error message with details
- Network errors: Shows user-friendly error messages
- Template not found: Provides specific error information

All errors are logged to the console for debugging purposes.
