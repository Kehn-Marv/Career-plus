# Version History Component

## Overview

The `VersionHistory` component displays a timeline of all optimized resume versions for a given analysis session. It provides functionality to view, compare, restore, and export any version.

## Features

- **Timeline Display**: Shows all versions in reverse chronological order (newest first)
- **Version Metadata**: Displays timestamp, creator type (Auto-Fix, Localization, Manual), and key metrics
- **Version Preview**: Full-screen modal preview of any version's content
- **Version Restore**: Restore any previous version as the current version
- **Version Export**: Export any version as a PDF
- **Version Comparison**: Compare any version with the current version to see detailed changes
- **Change Summary**: Expandable details showing what changed in each version
- **Visual Indicators**: Current version badge, region badges, ATS scores

## Usage

```tsx
import { VersionHistory } from '@/components/version-history'

function MyComponent() {
  const analysisId = 123

  return (
    <VersionHistory
      analysisId={analysisId}
      onVersionSelect={(version) => {
        console.log('Version selected:', version)
      }}
    />
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `analysisId` | `number` | Yes | The analysis ID to load versions for |
| `onVersionSelect` | `(version: OptimizedResume) => void` | No | Callback when a version is selected for preview |

## State Management

The component integrates with the `useOptimizationStore` to:
- Load version history from IndexedDB
- Restore previous versions
- Export versions as PDFs
- Track loading and error states

## Database Operations

Uses the following database operations from `optimized-resume-operations.ts`:
- `getVersionChangeSummary()` - Get summary of changes for a version
- `compareVersions()` - Compare two versions and get detailed diff
- `getOptimizedResumesByAnalysisId()` - Load all versions for an analysis

## UI Components

### Version Card
Each version is displayed in a card with:
- Version label (e.g., "Version 1", "Current")
- Timestamp and creator type
- Quick stats (ATS score, word count, template)
- Action buttons (Preview, Restore, Export, Expand)
- Expandable details section

### Preview Modal
Full-screen modal showing:
- Contact information
- Summary
- Experience with bullets
- Education
- Skills
- Projects (if present)

### Comparison Modal
Shows detailed comparison between two versions:
- Template changes
- Region changes
- ATS score changes (with trend indicators)
- Content changes (contact, summary, experience, etc.)
- Applied fixes changes (recommendations, ATS fixes, bias fixes)

## Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Screen reader announcements for actions
- Focus management in modals
- Color contrast compliance (WCAG AA)

## Error Handling

- Displays error messages for failed operations
- Graceful fallback for missing data
- Loading states for async operations
- Retry functionality for failed actions

## Empty State

When no versions exist, displays:
- Empty state icon
- Helpful message
- Suggestion to run Auto-Fix

## Version Limit

The system maintains up to 10 versions per analysis session. Older versions are automatically cleaned up when the limit is exceeded (handled by database operations).

## Styling

Uses Tailwind CSS with:
- Gradient backgrounds for visual appeal
- Hover effects for interactivity
- Smooth transitions and animations
- Responsive design for mobile/desktop
- Consistent color scheme with the rest of the app

## Performance Considerations

- Lazy loading of version summaries
- Efficient comparison algorithm
- Minimal re-renders with proper state management
- Cleanup of event listeners and timers

## Future Enhancements

- Side-by-side version comparison view
- Bulk export of multiple versions
- Version tagging/labeling
- Version notes/comments
- Diff highlighting in preview
- Version search/filter
