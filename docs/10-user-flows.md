# User Flows

Detailed user journey mappings for Career+ platform.

## 🎯 Primary User Flows

### 1. First-Time User Onboarding

```mermaid
graph TB
    START([User Lands on Homepage])
    UPLOAD[Click Upload Resume]
    MODAL[File Upload Modal]
    DRAG[Drag & Drop Area]
    BROWSE[File Browser]
    VALIDATE{File Validation}
    PARSE[Parsing & Analysis]
    EXTRACT[Extract Text]
    SECTIONS[Parse Sections]
    ATS[Calculate ATS Score]
    AI[Generate AI Insights]
    DASHBOARD[Analysis Dashboard]
    EXPLORE{Explore Features}
    AUTOFIX[AutoFix]
    BIAS[Bias Detection]
    LOCAL[Regional Localization]
    TEMPLATE[Template Gallery]
    CHAT[Chat Assistant]
    SUCCESS([Onboarding Complete])
    
    START --> UPLOAD
    UPLOAD --> MODAL
    MODAL --> DRAG
    MODAL --> BROWSE
    DRAG --> VALIDATE
    BROWSE --> VALIDATE
    
    VALIDATE -->|Valid| PARSE
    VALIDATE -->|Invalid| MODAL
    
    PARSE --> EXTRACT
    EXTRACT --> SECTIONS
    SECTIONS --> ATS
    ATS --> AI
    AI --> DASHBOARD
    
    DASHBOARD --> EXPLORE
    EXPLORE --> AUTOFIX
    EXPLORE --> BIAS
    EXPLORE --> LOCAL
    EXPLORE --> TEMPLATE
    EXPLORE --> CHAT
    
    AUTOFIX --> SUCCESS
    BIAS --> SUCCESS
    LOCAL --> SUCCESS
    TEMPLATE --> SUCCESS
    CHAT --> SUCCESS
    
    %% Styling
    classDef start fill:#e8f5e8,stroke:#4caf50,stroke-width:3px
    classDef process fill:#e1f5fe,stroke:#0288d1
    classDef decision fill:#fff3e0,stroke:#ff9800
    classDef feature fill:#f3e5f5,stroke:#9c27b0
    classDef success fill:#e8f5e8,stroke:#4caf50,stroke-width:3px
    
    class START,SUCCESS start
    class UPLOAD,MODAL,DRAG,BROWSE,PARSE,EXTRACT,SECTIONS,ATS,AI,DASHBOARD process
    class VALIDATE,EXPLORE decision
    class AUTOFIX,BIAS,LOCAL,TEMPLATE,CHAT feature
```

**Success Criteria:**
- User uploads resume successfully
- Analysis completes within 10 seconds
- User understands their ATS score
- User takes at least one action (AutoFix, Bias Check, etc.)

---

### 2. Resume Optimization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant M as AutoFix Modal
    participant AI as AI Service
    participant DB as Database
    
    Note over U,DB: Resume Optimization Flow
    
    U->>D: Review ATS Score (72/100)
    U->>D: Click "AutoFix" Button
    D->>M: Open Modal
    M->>M: Show Loading State
    M->>AI: Send Bullets for Rewriting
    
    Note over AI: Processing (15-30s)
    
    AI-->>M: Return Improved Bullets
    M->>M: Show Before/After Comparison
    
    loop For Each Suggestion
        M->>U: Display Comparison
        alt User Accepts
            U->>M: Click Accept
            M->>DB: Update Bullet
        else User Skips
            U->>M: Click Skip
            M->>M: Keep Original
        end
    end
    
    M->>DB: Create New Version
    M->>D: Calculate New Score
    D->>D: Update Dashboard (85/100)
    D->>U: Show Success Message
    D->>D: Update Version History
```

**Success Criteria:**
- User accepts at least 50% of suggestions
- ATS score improves by 10+ points
- User understands what changed and why
- New version saved automatically

---

### 3. Bias Detection & Removal Flow

```mermaid
graph TB
    START([Analysis Dashboard])
    CLICK[Click Check for Bias]
    MODAL[Bias Analysis Modal]
    SCAN[Scanning for Biased Language]
    ANALYZE[Analyze Text]
    REPORT[Display Bias Report]
    FILTER{Filter by Category?}
    AGE[Age Issues: 3]
    GENDER[Gender Issues: 2]
    RACE[Race Issues: 0]
    OTHER[Other Issues: 1]
    REVIEW[Review Each Issue]
    APPLY{Apply Fixes?}
    ONE[Apply One-by-One]
    ALL[Apply All]
    SAVE[Save Changes]
    VERSION[Create New Version]
    SUCCESS[Show Success Message]
    DASHBOARD([Return to Dashboard])
    
    START --> CLICK
    CLICK --> MODAL
    MODAL --> SCAN
    SCAN --> ANALYZE
    ANALYZE --> REPORT
    REPORT --> FILTER
    
    FILTER -->|Yes| AGE
    FILTER -->|Yes| GENDER
    FILTER -->|Yes| RACE
    FILTER -->|Yes| OTHER
    FILTER -->|No| REVIEW
    
    AGE --> REVIEW
    GENDER --> REVIEW
    RACE --> REVIEW
    OTHER --> REVIEW
    
    REVIEW --> APPLY
    APPLY -->|Individual| ONE
    APPLY -->|Bulk| ALL
    
    ONE --> SAVE
    ALL --> SAVE
    SAVE --> VERSION
    VERSION --> SUCCESS
    SUCCESS --> DASHBOARD
    
    %% Styling
    classDef start fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef process fill:#e1f5fe,stroke:#0288d1
    classDef decision fill:#fff3e0,stroke:#ff9800
    classDef category fill:#f3e5f5,stroke:#9c27b0
    classDef success fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    
    class START,DASHBOARD start
    class CLICK,MODAL,SCAN,ANALYZE,REPORT,REVIEW,ONE,ALL,SAVE,VERSION,SUCCESS process
    class FILTER,APPLY decision
    class AGE,GENDER,RACE,OTHER category
```

**Success Criteria:**
- User identifies all bias issues
- User fixes at least 80% of issues
- Bias score improves significantly
- User understands why changes were needed

---

### 4. Regional Localization Flow

```
Analysis Dashboard
    ↓
User sees "Optimize for Region" section
    ├─ 🇺🇸 US
    ├─ 🇬🇧 UK
    ├─ 🇪🇺 EU
    └─ 🌏 APAC
    ↓
User clicks region button (e.g., US)
    ↓
Localization Modal Opens
    ├─ Shows loading state
    └─ "Analyzing for US market..."
    ↓
Analysis completes (1-2 seconds)
    ↓
Localization Advice Displayed
    ├─ Tab 1: Recommendations
    │   ├─ Use "Resume" not "CV"
    │   ├─ Remove photo
    │   └─ Add phone with +1
    ├─ Tab 2: Format Changes
    │   ├─ Date format: MM/DD/YYYY
    │   ├─ Section order
    │   └─ Length guidelines
    ├─ Tab 3: Terminology
    │   ├─ CV → Resume
    │   ├─ Mobile → Cell phone
    │   └─ Postcode → ZIP code
    └─ Tab 4: Cultural Notes
        ├─ Emphasize achievements
        ├─ Use action verbs
        └─ Keep to 1-2 pages
    ↓
User reviews advice
    ↓
User clicks "Got it"
    ↓
Modal closes
    ↓
User applies changes manually
    (or uses AutoFix with region context)
```

**Success Criteria:**
- User understands regional differences
- User applies at least 3 recommendations
- Resume adapted for target region
- User feels confident about regional fit

---

### 5. Template Selection & Export Flow

```
Analysis Dashboard
    ↓
User clicks "Choose Template" button
    ↓
Template Gallery Opens
    ├─ Grid of templates
    ├─ Each shows:
    │   ├─ Preview thumbnail
    │   ├─ Template name
    │   ├─ ATS score
    │   └─ [Preview] button
    └─ Filters:
        ├─ Industry
        ├─ Experience level
        └─ ATS score
    ↓
User clicks [Preview] on template
    ↓
Template Preview Modal
    ├─ Full-size preview
    ├─ User's data populated
    ├─ [Use This Template] button
    └─ [Compare] button
    ↓
User clicks [Use This Template]
    ↓
Confirmation
    ├─ "Template applied"
    └─ "Ready to export"
    ↓
User clicks "Export PDF"
    ↓
Export Options Modal
    ├─ File name
    ├─ Template selection
    ├─ Include/exclude sections
    └─ [Download PDF] button
    ↓
PDF generation (2-5 seconds)
    ↓
Download starts
    ↓
Success message
    ├─ "Resume exported successfully"
    └─ "Saved to Downloads folder"
```

**Success Criteria:**
- User previews at least 2 templates
- User selects appropriate template
- PDF exports successfully
- PDF is ATS-compatible

---

### 6. Version History & Restore Flow

```
Analysis Dashboard
    ↓
User clicks "Version History" button
    ↓
Version History Panel Opens
    ├─ Timeline view
    ├─ Each version shows:
    │   ├─ Version number
    │   ├─ Timestamp
    │   ├─ Changes made
    │   ├─ ATS score
    │   └─ [Restore] [Export] buttons
    └─ Current version highlighted
    ↓
User clicks [Restore] on old version
    ↓
Confirmation Modal
    ├─ "Restore version X?"
    ├─ "Current changes will be saved as new version"
    └─ [Confirm] [Cancel]
    ↓
User confirms
    ↓
Version restored
    ├─ Current version saved
    ├─ Old version becomes current
    └─ Analysis re-run
    ↓
Success message
    ├─ "Version X restored"
    └─ "New version created from current state"
    ↓
Return to Analysis Dashboard
    ├─ Restored content displayed
    └─ Version history updated
```

**Success Criteria:**
- User can view all versions
- User successfully restores old version
- Current work is not lost
- User understands version system

---

### 7. AI Chat Assistant Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Chat Interface
    participant AI as AI Service
    participant DB as Database
    
    Note over U,DB: AI Chat Assistant Flow
    
    U->>C: Click "Chat" Button
    C->>DB: Load Chat History
    DB-->>C: Return Previous Messages
    C->>C: Display Suggested Questions
    
    alt User Types Question
        U->>C: Type Custom Question
    else User Clicks Suggestion
        U->>C: Click Suggested Question
    end
    
    C->>C: Show "AI is typing..."
    C->>DB: Get Resume Context
    DB-->>C: Resume Data & Analysis
    C->>AI: Send Question + Context
    
    Note over AI: Processing (3-10s)
    
    AI-->>C: Stream Response
    C->>C: Display Response
    C->>DB: Save Message
    C->>DB: Save Response
    
    loop Follow-up Questions
        U->>C: Ask Follow-up
        C->>AI: Send with Context
        AI-->>C: Stream Response
        C->>DB: Save Conversation
    end
    
    alt User Applies Suggestion
        U->>C: Apply Recommendation
        C->>DB: Update Resume
        C->>U: Show Success
    end
```

**Success Criteria:**
- User gets relevant answers
- AI provides actionable advice
- User asks at least 2 questions
- User applies at least 1 suggestion

---

## 🔄 Secondary User Flows

### 8. Returning User Flow

```
Landing Page
    ↓
User sees "Recent Resumes" section
    ├─ Last 5 resumes
    ├─ Each shows:
    │   ├─ File name
    │   ├─ Last modified
    │   ├─ ATS score
    │   └─ [Open] button
    └─ [Upload New] button
    ↓
User clicks [Open] on resume
    ↓
Analysis Dashboard loads
    ├─ Previous analysis displayed
    ├─ Version history available
    └─ Can continue editing
```

### 9. Job Description Matching Flow

```
Analysis Dashboard
    ↓
User clicks "Match to Job" button
    ↓
Job Description Modal
    ├─ Paste job description
    └─ [Analyze Match] button
    ↓
Matching analysis (5-10 seconds)
    ↓
Match Report
    ├─ Match score: X%
    ├─ Matched keywords
    ├─ Missing keywords
    ├─ Suggested additions
    └─ [Optimize for This Job] button
    ↓
User clicks [Optimize]
    ↓
AutoFix runs with job context
    ↓
Resume optimized for specific job
```

### 10. Comparison Flow

```
Version History
    ↓
User selects 2 versions
    ↓
Clicks [Compare] button
    ↓
Comparison View
    ├─ Side-by-side display
    ├─ Differences highlighted
    ├─ Score comparison
    └─ Change summary
    ↓
User can:
    ├─ Restore either version
    ├─ Export either version
    └─ Merge changes (future)
```

---

## 📊 User Flow Metrics

### Key Performance Indicators

| Flow | Success Rate Target | Avg. Time | Drop-off Points |
|------|-------------------|-----------|-----------------|
| Onboarding | 85% | 2 min | File upload, Analysis wait |
| AutoFix | 70% | 3 min | Review suggestions |
| Bias Detection | 80% | 2 min | Understanding issues |
| Localization | 90% | 1 min | None |
| Template Export | 95% | 1 min | PDF generation |
| Version Restore | 85% | 30 sec | Confirmation |
| Chat Assistant | 75% | 5 min | Getting relevant answers |

### Optimization Opportunities

1. **Reduce Analysis Time**: Target < 5 seconds
2. **Improve AutoFix Acceptance**: Add more context
3. **Simplify Bias Fixes**: One-click apply all
4. **Faster PDF Export**: Optimize generation
5. **Better Chat Suggestions**: More relevant prompts

---

## 🎨 User Experience Principles

### 1. Progressive Disclosure
- Show basic features first
- Reveal advanced features as needed
- Don't overwhelm new users

### 2. Immediate Feedback
- Show loading states
- Provide progress indicators
- Confirm all actions

### 3. Reversible Actions
- Allow undo/redo
- Save versions automatically
- Confirm destructive actions

### 4. Clear Navigation
- Always show current location
- Provide breadcrumbs
- Easy return to dashboard

### 5. Contextual Help
- Tooltips for complex features
- Inline documentation
- AI chat for questions

---

**Next**: [Onboarding Flow](./11-onboarding-flow.md)
