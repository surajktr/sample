export interface QuestionResult {
  questionNumber: number;
  sectionQuestionNumber: number;
  status: string;
  chosenOption: number | null;
  isCorrect: boolean;
  correctOption: number | null;
  questionText: string | null;
  questionImageUrl: string | null;
  optionImages: {
    optionNumber: number;
    imageUrl: string | null;
    text: string | null;
    isCorrect: boolean;
    isChosen: boolean;
  }[];
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

export interface CandidateInfo {
  registrationNumber: string;
  rollNumber: string;
  candidateName: string;
  community: string;
  venueName: string;
  examDate: string;
  examTime: string;
  subject: string;
}

export interface ExamConfig {
  name: string;
  sections: SectionConfig[];
}

interface SectionConfig {
  part: string;
  subject: string;
  start: number;
  end: number;
  marksPerCorrect: number;
  negativePerWrong: number;
  maxMarks: number;
  qualifying?: boolean;
}

export interface ScorecardData {
  candidateInfo: CandidateInfo | null;
  sections: SectionResult[];
  questions: QuestionResult[];
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  totalScore: number;
  totalMaxMarks: number;
  qualifyingSection: SectionResult | null;
  baseUrl: string;
  examConfig: ExamConfig;
}

// SSC CGL Mains 2024 section structure
const CGL_MAINS_SECTIONS: SectionConfig[] = [
  { part: 'A', subject: 'Mathematical Abilities', start: 1, end: 30, marksPerCorrect: 3, negativePerWrong: 1, maxMarks: 90 },
  { part: 'B', subject: 'Reasoning & General Intelligence', start: 31, end: 60, marksPerCorrect: 3, negativePerWrong: 1, maxMarks: 90 },
  { part: 'C', subject: 'English Language & Comprehension', start: 61, end: 105, marksPerCorrect: 3, negativePerWrong: 1, maxMarks: 135 },
  { part: 'D', subject: 'General Awareness', start: 106, end: 130, marksPerCorrect: 3, negativePerWrong: 0.5, maxMarks: 75 },
  { part: 'E', subject: 'Computer Knowledge', start: 131, end: 150, marksPerCorrect: 3, negativePerWrong: 0.5, maxMarks: 60, qualifying: true },
];

// RRB NTPC Graduate Level CBT-1
const RRB_NTPC_SECTIONS: SectionConfig[] = [
  { part: 'A', subject: 'Mathematics', start: 1, end: 30, marksPerCorrect: 1, negativePerWrong: 1 / 3, maxMarks: 30 },
  { part: 'B', subject: 'General Intelligence & Reasoning', start: 31, end: 60, marksPerCorrect: 1, negativePerWrong: 1 / 3, maxMarks: 30 },
  { part: 'C', subject: 'General Awareness', start: 61, end: 100, marksPerCorrect: 1, negativePerWrong: 1 / 3, maxMarks: 40 },
];

const EXAM_CONFIGS: Record<string, ExamConfig> = {
  ssc_cgl: { name: 'SSC CGL Mains', sections: CGL_MAINS_SECTIONS },
  rrb_ntpc: { name: 'RRB NTPC', sections: RRB_NTPC_SECTIONS },
};

function detectExamType(candidateInfo: CandidateInfo | null, html: string): ExamConfig {
  const subject = candidateInfo?.subject?.toLowerCase() || '';
  if (subject.includes('rrb') || subject.includes('ntpc') || html.includes('rrb.digialm.com')) {
    return EXAM_CONFIGS.rrb_ntpc;
  }
  return EXAM_CONFIGS.ssc_cgl;
}

export function parseSSCHtml(html: string): ScorecardData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const baseUrl = extractBaseUrl(html);
  const candidateInfo = extractCandidateInfo(doc);
  const examConfig = detectExamType(candidateInfo, html);
  const questions = extractQuestions(doc, baseUrl);
  return calculateScorecard(questions, baseUrl, candidateInfo, examConfig);
}

function extractCandidateInfo(doc: Document): CandidateInfo | null {
  const tables = doc.querySelectorAll('table');
  for (const table of tables) {
    const rows = table.querySelectorAll('tr');
    const info: Record<string, string> = {};
    for (const row of rows) {
      const tds = row.querySelectorAll('td');
      if (tds.length >= 2) {
        const key = tds[0].textContent?.trim() || '';
        const value = tds[1].textContent?.trim() || '';
        if (key) info[key] = value;
      }
    }
    if (info['Roll Number'] || info['Candidate Name'] || info['Registration Number']) {
      return {
        registrationNumber: info['Registration Number'] || '',
        rollNumber: info['Roll Number'] || '',
        candidateName: info['Candidate Name'] || '',
        community: info['Community'] || '',
        venueName: info['Venue Name'] || info['Test Center Name'] || '',
        examDate: info['Exam Date'] || info['Test Date'] || '',
        examTime: info['Exam Time'] || info['Test Time'] || '',
        subject: info['Subject'] || '',
      };
    }
  }
  return null;
}

function extractBaseUrl(html: string): string {
  // SSC pattern
  const sscMatch = html.match(/src="(\/per\/g\d+\/pub\/\d+\/touchstone\/)/);
  if (sscMatch) return 'https://ssc.digialm.com' + sscMatch[1];
  // RRB pattern
  const rrbMatch = html.match(/src="(\/per\/g\d+\/pub\/\d+\/touchstone\/)/);
  if (rrbMatch) return 'https://rrb.digialm.com' + rrbMatch[1];
  if (html.includes('rrb.digialm.com')) return 'https://rrb.digialm.com';
  return 'https://ssc.digialm.com';
}

function resolveImageUrl(src: string, baseUrl: string): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  // Determine domain from baseUrl
  const domain = baseUrl.startsWith('https://rrb') ? 'https://rrb.digialm.com' : 'https://ssc.digialm.com';
  if (src.startsWith('/')) return domain + src;
  return baseUrl + src;
}

function extractQuestions(doc: Document, baseUrl: string): QuestionResult[] {
  const questions: QuestionResult[] = [];
  const questionRows = doc.querySelectorAll('td.rw');
  let sequentialIndex = 0;

  questionRows.forEach((row) => {
    const questionTbl = row.querySelector('table.questionRowTbl');
    const menuTbl = row.querySelector('table.menu-tbl');
    if (!questionTbl || !menuTbl) return;

    sequentialIndex++;

    // Extract section-local question number
    let sectionQuestionNumber = 0;
    const qNumTd = questionTbl.querySelector('td.bold[valign="top"]');
    if (qNumTd) {
      const match = qNumTd.textContent?.trim().match(/Q\.(\d+)/);
      if (match) sectionQuestionNumber = parseInt(match[1]);
    }

    // Extract question image and text
    let questionImageUrl: string | null = null;
    let questionText: string | null = null;
    const allRows = questionTbl.querySelectorAll('tr');
    for (const tr of allRows) {
      const td = tr.querySelector('td.bold[style*="text-align: left"]');
      if (td) {
        const img = td.querySelector('img');
        if (img) {
          questionImageUrl = resolveImageUrl(img.getAttribute('src') || '', baseUrl);
        }
        // Get text content (excluding img alt text)
        const textContent = td.textContent?.trim() || '';
        if (textContent) {
          questionText = textContent;
        }
        break;
      }
    }

    // Extract metadata from menu table
    const menuRows = menuTbl.querySelectorAll('tr');
    let status = '';
    let chosenOption: number | null = null;

    menuRows.forEach((tr) => {
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 2) {
        const label = tds[0].textContent?.trim() || '';
        const value = tds[1].textContent?.trim() || '';
        if (label.includes('Status')) status = value;
        else if (label.includes('Chosen Option')) {
          const num = parseInt(value);
          if (!isNaN(num) && num > 0) chosenOption = num;
        }
      }
    });

    // Extract options
    let correctOption: number | null = null;
    const optionImages: QuestionResult['optionImages'] = [];
    const answerTds = questionTbl.querySelectorAll('td.rightAns, td.wrngAns');

    answerTds.forEach((td) => {
      const fullText = td.textContent?.trim() || '';
      const numMatch = fullText.match(/^(\d+)\.\s*/);
      if (!numMatch) return;

      const optNum = parseInt(numMatch[1]);
      const isRight = td.classList.contains('rightAns');
      if (isRight) correctOption = optNum;

      // Get option image (content image, not tick/cross)
      const img = td.querySelector('img[name]');
      let imageUrl: string | null = null;
      if (img) {
        imageUrl = resolveImageUrl(img.getAttribute('src') || '', baseUrl);
      }

      // Get option text (remove the number prefix and tick/cross icon text)
      let optText: string | null = null;
      const rawText = fullText.replace(/^\d+\.\s*/, '').trim();
      if (rawText) optText = rawText;

      optionImages.push({
        optionNumber: optNum,
        imageUrl,
        text: optText,
        isCorrect: isRight,
        isChosen: chosenOption === optNum,
      });
    });

    const isCorrect = chosenOption !== null && chosenOption === correctOption;

    questions.push({
      questionNumber: sequentialIndex,
      sectionQuestionNumber,
      status,
      chosenOption,
      isCorrect,
      correctOption,
      questionText,
      questionImageUrl,
      optionImages,
    });
  });

  return questions;
}

function calculateScorecard(
  questions: QuestionResult[],
  baseUrl: string,
  candidateInfo: CandidateInfo | null,
  examConfig: ExamConfig
): ScorecardData {
  const sections: SectionResult[] = [];
  let qualifyingSection: SectionResult | null = null;

  for (const section of examConfig.sections) {
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
      score: Math.round(score * 100) / 100,
    };

    if (section.qualifying) {
      qualifyingSection = result;
    } else {
      sections.push(result);
    }
  }

  const totalCorrect = sections.reduce((s, sec) => s + sec.correct, 0);
  const totalWrong = sections.reduce((s, sec) => s + sec.wrong, 0);
  const totalSkipped = sections.reduce((s, sec) => s + sec.skipped, 0);
  const totalScore = Math.round(sections.reduce((s, sec) => s + sec.score, 0) * 100) / 100;
  const totalMaxMarks = sections.reduce((s, sec) => s + sec.maxMarks, 0);

  return {
    candidateInfo,
    sections,
    questions,
    totalCorrect,
    totalWrong,
    totalSkipped,
    totalScore,
    totalMaxMarks,
    qualifyingSection,
    baseUrl,
    examConfig,
  };
}

export function getQuestionsForSection(data: ScorecardData, part: string): QuestionResult[] {
  const sections = data?.examConfig?.sections ?? [];
  const section = sections.find((s) => s.part === part);
  if (!section) return [];
  return data.questions.filter(
    (q) => q.questionNumber >= section.start && q.questionNumber <= section.end
  );
}

export function getExamSections(data: ScorecardData) {
  return data?.examConfig?.sections ?? [];
}
