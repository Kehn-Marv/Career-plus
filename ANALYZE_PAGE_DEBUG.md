# Analyze Page Blank Screen - Debugging Guide

## Issue
When clicking on "Analyze", you get a blank white screen with no logs in the terminal.

## Changes Made

### 1. Added Error Boundary
Created `frontend/src/components/ErrorBoundary.tsx` to catch and display React errors that were previously failing silently.

**What it does:**
- Catches JavaScript errors in the component tree
- Displays a user-friendly error message with details
- Shows the error stack trace for debugging
- Provides buttons to reload or go home

### 2. Wrapped App with Error Boundary
Modified `frontend/src/main.tsx` to wrap the entire app with the ErrorBoundary component.

### 3. Added Error Boundary to Routes
Modified `frontend/src/App.tsx` to add an additional ErrorBoundary around the Routes component.

### 4. Enhanced Lazy Loading Error Handling
Modified the Analyze page lazy loading to catch and display import errors.

### 5. Added Console Logging
Added console.log statements to:
- `LoadingSpinner` component - to see if it's rendering
- `Analyze` component - to see if it's being loaded
- Analyze page - to track the analysis ID from URL

## Next Steps - What You Should Do

### 1. Open Browser Developer Console
Press `F12` in your browser to open the developer console and check for:
- **Red error messages** in the Console tab
- **Network errors** in the Network tab (look for failed requests)
- **Any warnings** that might give clues

### 2. Check What You See Now
After these changes, when you navigate to `/analyze`, you should see one of:

**Option A: Error Boundary Screen**
- If you see a red error screen with error details, that's good! It means we caught the error.
- Take a screenshot or copy the error message and share it.

**Option B: Loading Spinner**
- If you see "Loading..." with a spinning circle, the page is stuck loading.
- Check the console for any errors about failed imports.

**Option C: Still Blank White Screen**
- This means the error is happening before React can render anything.
- Check the console for errors.
- Look for any failed network requests in the Network tab.

### 3. Check Console Logs
You should see these console messages:
```
LoadingSpinner rendering...
Analyze component rendering...
Analysis ID from URL: null (or a number if you have ?analysisId=123)
```

If you don't see these, the component isn't loading at all.

### 4. Common Issues to Check

#### Issue 1: Build Errors
The TypeScript build has errors. Run:
```bash
cd frontend
npm run build
```
If it fails, we need to fix those TypeScript errors first.

#### Issue 2: Dev Server Not Running
Make sure the frontend dev server is running:
```bash
cd frontend
npm run dev
```

#### Issue 3: Backend Not Running
If the page loads but analysis fails, check if the backend is running:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

#### Issue 4: Browser Cache
Try a hard refresh:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

Or clear your browser cache and reload.

### 5. What to Share
Please share:
1. **Console errors** (screenshot or copy the text)
2. **Network tab** - any failed requests (red items)
3. **What you see** - blank screen, error screen, or loading spinner?
4. **Browser and version** - Chrome, Firefox, Safari, etc.

## Technical Details

### Why This Happens
A blank white screen in React usually means:
1. **JavaScript error** - Something threw an error before React could render
2. **Failed import** - A lazy-loaded component failed to load
3. **Infinite loop** - Component is stuck in a render loop
4. **CSS issue** - Everything is rendering but invisible (rare)

### What the Error Boundary Does
React's Error Boundaries catch errors during:
- Rendering
- Lifecycle methods
- Constructors of child components

They DON'T catch errors in:
- Event handlers (use try-catch)
- Async code (use try-catch)
- Server-side rendering
- Errors in the error boundary itself

### Why No Terminal Logs
The terminal shows server-side logs (backend) and build errors. Runtime JavaScript errors only appear in the browser console, not the terminal.

## Quick Test
To verify the error boundary is working, you can temporarily add this to `Analyze.tsx`:
```typescript
export default function Analyze() {
  throw new Error('Test error - remove this line!')
  // rest of component...
}
```

If you see the error boundary screen, it's working! Then remove that line.
