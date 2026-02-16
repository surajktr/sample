

# CGL Score Sight - Full PRD Implementation Plan

## Summary

Transform the current SSC CGL Mains-only analyzer into a multi-exam platform supporting 25+ exam types across SSC, Railway, IB, Bank, and Police categories. This involves creating a centralized exam configuration system, a new robust edge function with multi-part fetching and CORS fallbacks, dual HTML format parsing, bilingual support, and updated UI components.

---

## Phase 1: Exam Configuration System

**New file: `src/lib/examConfig.ts`**

Create a centralized configuration defining all 24 exam types with their subject structures, marking schemes, and question distributions.

- Define `ExamCategory` type with id, label, emoji for 5 categories (SSC, Railway, IB, Bank, Police)
- Define `SubjectConfig` interface: name, part, totalQuestions, maxMarks, correctMarks, negativeMarks, isQualifying
- Define `ExamConfig` interface: id, name, category, totalQuestions, maxMarks, subjects array
- Implement all 24 exam configs from the PRD (SSC CGL Pre/Mains, CHSL Pre/Mains, CPO, MTS, GD, Steno, RRB NTPC CBT1/2, Group D, JE, ALP, IB ACIO/SA, IBPS PO/Clerk Pre/Mains, SBI PO/Clerk, Delhi Police Constable/Head Constable)
- Export helper functions: `getExamsByCategory()`, `getExamConfig()`, `calculateScore()`

## Phase 2: New Edge Function

**New file: `supabase/functions/analyze-response-sheet/index.ts`**

Replace `fetch-ssc-html` with a comprehensive analysis function that handles both URL formats.

- Accept request body: `{ url, examType, language, html? }`
- **URL Detection**: Distinguish between `ViewCandResponse.aspx` and `AssessmentQPHTMLMode1/.html` formats
- **Multi-Part Fetching**: For ViewCandResponse URLs, auto-detect and fetch parts 1-5 by replacing `ViewCandResponse.aspx` with `ViewCandResponse2.aspx`, etc.
- **CORS Proxy Fallback**: If direct fetch fails, try proxies in order: `r.jina.ai`, `allorigins.win`, `corsproxy.io`, `thingproxy.freeboard.io`
- **HTML Parsing (server-side)**: Parse both formats using string/regex-based extraction (no DOMParser in Deno), extract questions, options, candidate info
- **Score Calculation**: Use exam config to compute section-wise and total scores
- Return structured `AnalysisResult` JSON with candidate info, sections, questions, scores

## Phase 3: Unified Parser

**Rewrite: `src/lib/parseSSCHtml.ts`**

Support both HTML formats with dynamic exam configs instead of hardcoded CGL Mains sections.

- **New interfaces**: Update `QuestionResult` to include `part`, `subject`, `status` as enum ('correct'|'wrong'|'unattempted'|'bonus'), `marksAwarded`, `questionText`, bilingual image URLs (`questionImageUrlHindi`, `questionImageUrlEnglish`)
- **Format detection**: Check for `ViewCandResponse` vs `question-pnl` class presence
- **ViewCandResponse parser**: Parse tables with bgcolor-based correctness (green=correct, red=wrong selected, yellow=correct with tick)
- **AssessmentQPHTMLMode1 parser**: Keep current logic (rightAns/wrngAns classes, menu-tbl for chosen option) but add section-lbl detection for dynamic subject mapping
- **Bilingual image support**: Detect `_HI.jpg` / `_EN.jpg` variants in image URLs
- **Bonus question detection**: If no option has `rightAns` class, mark as bonus
- **Dynamic section mapping**: Use exam config's subject list to map sequential questions to parts based on cumulative question counts
- **Candidate info extraction**: Support all label variations from PRD (Roll No/Roll Number, Candidate Name/Participant Name, etc.)

## Phase 4: Updated UI Components

### 4a. HeroInput Updates (`src/components/HeroInput.tsx`)
- Replace hardcoded `SSC_EXAMS` with dynamic list from `examConfig.ts`
- When category changes, update exam dropdown with `getExamsByCategory(category)`
- Add language toggle (Hindi/English) as a third selector
- Pass `examType` and `language` to the analyze callback

### 4b. Index Page Updates (`src/pages/Index.tsx`)
- Update `handleAnalyze` to accept `{ url, examType, language }`
- Call new `analyze-response-sheet` edge function instead of `fetch-ssc-html`
- If edge function returns HTML (fallback), parse client-side with updated parser
- Store language preference in state for passing to question display

### 4c. Results Components Updates
- **SectionBreakdown**: Make dynamic - use sections from analysis result instead of hardcoded CGL sections
- **QuestionAnalysis**: Add language toggle button, use bilingual image URLs, show bonus status, display marks awarded per question dynamically based on exam config
- **TotalScoreCard**: Remove hardcoded "+3 correct, -1 wrong" label, show actual marking scheme from exam config
- **CandidateInfoCard**: Support all label variations, show exam type name
- **ResultsHeader**: Show exam type name in header

### 4d. QuestionCard Enhancement
- Add status badge supporting 4 states: correct (green), wrong (red), unattempted (gray), bonus (gold)
- Show marks awarded per question (dynamic based on exam config)
- Add Hindi/English language toggle for question and option images
- Show question text when available (alongside or instead of image)

## Phase 5: Edge Function Cleanup

- Keep `fetch-ssc-html` as a simpler fallback but mark as deprecated
- Add `[functions.analyze-response-sheet]` with `verify_jwt = false` to config.toml

---

## Technical Details

### Data Flow

```text
User selects: Category -> Exam -> Language -> Pastes URL
    |
    v
Edge Function: analyze-response-sheet
    |-- Detect URL format (ViewCandResponse vs .html)
    |-- Fetch HTML (direct -> proxy fallback chain)
    |-- For ViewCandResponse: fetch all parts (1-5)
    |-- Return { success, html } or { success, data }
    |
    v
Client-side: parseSSCHtml(html, examConfig, language)
    |-- Detect format, extract questions
    |-- Map to sections using examConfig
    |-- Calculate scores
    |
    v
Render: ResultsDashboard with dynamic sections
```

### Files Changed

| File | Action |
|------|--------|
| `src/lib/examConfig.ts` | Create - all exam configurations |
| `supabase/functions/analyze-response-sheet/index.ts` | Create - new edge function |
| `src/lib/parseSSCHtml.ts` | Rewrite - dual format, dynamic config |
| `src/components/HeroInput.tsx` | Update - dynamic exam lists, language toggle |
| `src/pages/Index.tsx` | Update - new API call, pass exam config |
| `src/components/SectionBreakdown.tsx` | Update - dynamic sections |
| `src/components/QuestionAnalysis.tsx` | Update - language toggle, bonus status |
| `src/components/TotalScoreCard.tsx` | Update - dynamic marking scheme |
| `src/components/CandidateInfoCard.tsx` | Update - flexible label matching |
| `src/components/ResultsHeader.tsx` | Update - show exam type |

### Key Considerations

- The current parser uses browser `DOMParser` which works well for client-side. The edge function will use regex/string parsing since Deno doesn't have native DOMParser (or will use `deno-dom` if available).
- ViewCandResponse format uses bgcolor for answer correctness vs AssessmentQPHTMLMode1 uses CSS classes - both paths need separate parsing logic.
- Bilingual support is image-URL based (`_HI`/`_EN` suffix swap), not translation-based.
- Bonus questions (no correct answer marked) give full marks to all candidates.

