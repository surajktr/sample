## 5. Question Display

**File**: `src/components/QuestionCard.tsx`

**Features**:
- Question number with status badge
- Question image display (with Hindi/English variants)
- Question text display with formatted line breaks
- 4 options with visual indicators:
  - Green label = correct answer
  - Red label = wrong answer selected by user
  - Orange highlight = correct answer (when user selected wrong)
  - Default = unselected options
- Marks awarded display (+3, -1, 0)
- Bonus question indicator with note

**Text Formatting**:
- Preserves line breaks from HTML
- Detects option markers (A), B., C:, etc.)
- Auto-formats long questions with sentence breaks
- Extracts question images and text
- Extracts 4 options with images/text
- Detects selected vs correct answers
- Identifies bonus questions (no correct answer marked)

---

## 6. Bilingual Support

**Image URL Pattern**:
- Hindi: `filename_HI.jpg`
- English: `filename_EN.jpg`

**Features**:
- Language toggle in QuestionsTable
- Automatic language variant detection
- Falls back to default if variant not available

---

## 7. Download Features

**File**: `src/hooks/useHtmlGenerator.ts`

**Download Types**:

**a) Response Sheet**:
- Complete analysis with candidate info
- Section-wise breakdown table
- All questions with answer indicators
- Shows user response vs correct answer
- Available in Hindi/English/Bilingual

**b) Answer Key (Normal Mode)**:
- Clean question-answer format
- Correct answers highlighted
- No user response data

**c) Quiz Mode**:
- Interactive HTML file
- Click options to reveal answers
- Shows correct/wrong feedback
- "Show Answer" button for each question

**Language Options**:
- Hindi only
- English only
- Bilingual (both Hindi and English images)

---

