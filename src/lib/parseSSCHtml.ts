export interface QuestionResult {
  questionNumber: number;
  status: string; // "Answered", "Not Answered", "Marked For Review", etc.
  chosenOption: number | null;
  isCorrect: boolean;
  correctOption: number | null;
}

export interface SectionResult {
  part: string;
  subject: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  marksPerCorrect: number;
  negativePerWrong: number;
  maxMarks: number;
  score: number;
}

export interface ScorecardData {
  sections: SectionResult[];
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  totalScore: number;
  totalMaxMarks: number;
  qualifyingSection: SectionResult | null;
}

// SSC CGL Mains 2024 section structure
const CGL_MAINS_SECTIONS = [
  { part: 'A', subject: 'Mathematical Abilities', start: 1, end: 30, marksPerCorrect: 3, negativePerWrong: 1, maxMarks: 90 },
  { part: 'B', subject: 'Reasoning & General Intelligence', start: 31, end: 60, marksPerCorrect: 3, negativePerWrong: 1, maxMarks: 90 },
  { part: 'C', subject: 'English Language & Comprehension', start: 61, end: 105, marksPerCorrect: 3, negativePerWrong: 1, maxMarks: 135 },
  { part: 'D', subject: 'General Awareness', start: 106, end: 130, marksPerCorrect: 3, negativePerWrong: 0.5, maxMarks: 75 },
  { part: 'E', subject: 'Computer Knowledge', start: 131, end: 150, marksPerCorrect: 3, negativePerWrong: 0.5, maxMarks: 60, qualifying: true },
];

export function parseSSCHtml(html: string): ScorecardData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const questions = extractQuestions(doc);
  return calculateScorecard(questions);
}

function extractQuestions(doc: Document): QuestionResult[] {
  const questions: QuestionResult[] = [];

  // Find all question rows - each <td class="rw"> contains one question
  const questionRows = doc.querySelectorAll('td.rw');
  let sequentialIndex = 0;

  questionRows.forEach((row) => {
    const questionTbl = row.querySelector('table.questionRowTbl');
    const menuTbl = row.querySelector('table.menu-tbl');

    if (!questionTbl || !menuTbl) return;

    // Use sequential index (1-based) as the question number since
    // SSC answer keys reset Q.numbers per section (Q.1-Q.30 each)
    sequentialIndex++;

    // Extract metadata from menu table
    const menuRows = menuTbl.querySelectorAll('tr');
    let status = '';
    let chosenOption: number | null = null;

    menuRows.forEach((tr) => {
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 2) {
        const label = tds[0].textContent?.trim() || '';
        const value = tds[1].textContent?.trim() || '';

        if (label.includes('Status')) {
          status = value;
        } else if (label.includes('Chosen Option')) {
          const num = parseInt(value);
          if (!isNaN(num) && num > 0) chosenOption = num;
        }
      }
    });

    // Determine correct answer from rightAns class
    let correctOption: number | null = null;
    const answerTds = questionTbl.querySelectorAll('td.rightAns, td.wrngAns');
    answerTds.forEach((td) => {
      if (td.classList.contains('rightAns')) {
        const text = td.textContent?.trim() || '';
        const match = text.match(/^(\d+)\./);
        if (match) correctOption = parseInt(match[1]);
      }
    });

    const isCorrect = chosenOption !== null && chosenOption === correctOption;

    questions.push({
      questionNumber: sequentialIndex,
      status,
      chosenOption,
      isCorrect,
      correctOption,
    });
  });

  return questions;
}

function calculateScorecard(questions: QuestionResult[]): ScorecardData {
  const sections: SectionResult[] = [];
  let qualifyingSection: SectionResult | null = null;

  for (const section of CGL_MAINS_SECTIONS) {
    // Filter questions belonging to this section by question number range
    const sectionQuestions = questions.filter(
      (q) => q.questionNumber >= section.start && q.questionNumber <= section.end
    );

    const correct = sectionQuestions.filter((q) => q.isCorrect).length;
    const answered = sectionQuestions.filter(
      (q) => q.status === 'Answered' || (q.chosenOption !== null && q.chosenOption > 0)
    ).length;
    const wrong = answered - correct;
    const skipped = section.end - section.start + 1 - answered;
    const score = correct * section.marksPerCorrect - wrong * section.negativePerWrong;

    const result: SectionResult = {
      part: section.part,
      subject: section.subject,
      totalQuestions: section.end - section.start + 1,
      correct,
      wrong,
      skipped,
      marksPerCorrect: section.marksPerCorrect,
      negativePerWrong: section.negativePerWrong,
      maxMarks: section.maxMarks,
      score: Math.round(score * 10) / 10,
    };

    if ((section as any).qualifying) {
      qualifyingSection = result;
    } else {
      sections.push(result);
    }
  }

  const totalCorrect = sections.reduce((s, sec) => s + sec.correct, 0);
  const totalWrong = sections.reduce((s, sec) => s + sec.wrong, 0);
  const totalSkipped = sections.reduce((s, sec) => s + sec.skipped, 0);
  const totalScore = Math.round(sections.reduce((s, sec) => s + sec.score, 0) * 10) / 10;
  const totalMaxMarks = sections.reduce((s, sec) => s + sec.maxMarks, 0);

  return {
    sections,
    totalCorrect,
    totalWrong,
    totalSkipped,
    totalScore,
    totalMaxMarks,
    qualifyingSection,
  };
}
