import { type ExamConfig, getExamConfig, getSubjectRanges } from './examConfig';

export interface QuestionResult {
  questionNumber: number;
  sectionQuestionNumber: number;
  part: string;
  subject: string;
  status: 'correct' | 'wrong' | 'unattempted' | 'bonus';
  chosenOption: number | null;
  isCorrect: boolean;
  correctOption: number | null;
  marksAwarded: number;
  questionImageUrl: string | null;
  questionImageUrlHindi: string | null;
  questionImageUrlEnglish: string | null;
  questionText: string | null;
  optionImages: { optionNumber: number; imageUrl: string | null; text: string | null; isCorrect: boolean; isChosen: boolean }[];
}

export interface SectionResult {
  part: string;
  subject: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  bonus: number;
  marksPerCorrect: number;
  negativePerWrong: number;
  maxMarks: number;
  score: number;
  isQualifying?: boolean;
}

export interface CandidateInfo {
  rollNumber: string;
  candidateName: string;
  venueName: string;
  examDate: string;
  examTime: string;
  subject: string;
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
  examConfig: ExamConfig | null;
}

// Label variations for candidate info
const LABEL_MAP: Record<string, keyof CandidateInfo> = {
  'Roll Number': 'rollNumber',
  'Roll No': 'rollNumber',
  'Roll No.': 'rollNumber',
  'Candidate Name': 'candidateName',
  'Participant Name': 'candidateName',
  'Name': 'candidateName',
  'Venue Name': 'venueName',
  'Centre Name': 'venueName',
  'Test Center Name': 'venueName',
  'Exam Date': 'examDate',
  'Test Date': 'examDate',
  'Examination Date': 'examDate',
  'Exam Time': 'examTime',
  'Test Time': 'examTime',
  'Shift': 'examTime',
  'Exam Shift': 'examTime',
  'Subject': 'subject',
  'Exam Level': 'subject',
  'Post Name': 'subject',
};

export function parseSSCHtml(html: string, examType?: string): ScorecardData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const baseUrl = extractBaseUrl(html);
  const candidateInfo = extractCandidateInfo(doc);
  const examConfig = examType ? getExamConfig(examType) || null : null;
  
  // Detect format
  const isViewCandFormat = html.includes('ViewCandResponse') || html.includes('bgcolor="green"') || html.includes('bgcolor="red"');
  
  let questions: QuestionResult[];
  if (isViewCandFormat) {
    questions = extractViewCandQuestions(doc, baseUrl, examConfig);
  } else {
    questions = extractAssessmentQuestions(doc, baseUrl, examConfig);
  }

  return calculateScorecard(questions, baseUrl, candidateInfo, examConfig);
}

function extractBaseUrl(html: string): string {
  const match = html.match(/src="(\/per\/g\d+\/pub\/\d+\/touchstone\/)/);
  if (match) return 'https://ssc.digialm.com' + match[1];
  const match2 = html.match(/src="(https?:\/\/[^"]+\/touchstone\/)/);
  if (match2) return match2[1];
  return 'https://ssc.digialm.com';
}

function resolveImageUrl(src: string, baseUrl: string): string {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  if (src.startsWith('data:')) return src;
  if (src.startsWith('/')) return 'https://ssc.digialm.com' + src;
  return baseUrl + src;
}

function getBilingualUrls(url: string | null): { hindi: string | null; english: string | null } {
  if (!url) return { hindi: null, english: null };
  // Handle both uppercase (_HI.jpg, _EN.jpg) and lowercase (_hi.jpg, _en.jpg) suffixes
  if (url.toLowerCase().includes('_hi.')) {
    return { 
      hindi: url, 
      english: url.replace(/_hi\./i, '_en.') 
    };
  }
  if (url.toLowerCase().includes('_en.')) {
    return { 
      hindi: url.replace(/_en\./i, '_hi.'), 
      english: url 
    };
  }
  return { hindi: null, english: null };
}

function autoFormatLongText(text: string): string {
  // If already multi-line, keep as-is.
  if (text.includes('\n')) return text;
  // Only apply to long strings; avoid over-formatting short questions.
  if (text.length < 160) return text;

  // Insert line breaks after sentence terminators.
  // Handles cases like: ". ...? ..." and ". ... The".
  return text
    .replace(/([.?!])\s+(?=[A-Z(])/g, '$1\n')
    .replace(/;\s+(?=[A-Z(])/g, ';\n');
}

function extractTextWithLineBreaks(element: Element | null): string | null {
  if (!element) return null;
  
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as Element;
  
  // Remove img tags
  clone.querySelectorAll('img').forEach(img => img.remove());
  
  // Normalize superscripts so math like cm^2 / cm^3 are readable in plain text
  clone.querySelectorAll('sup').forEach(sup => {
    const value = (sup.textContent || '').trim();
    let replacement = '';
    if (value === '2') replacement = '²';
    else if (value === '3') replacement = '³';
    else if (value === '1') replacement = '¹';
    else if (value === '0') replacement = '⁰';
    else if (value.toLowerCase() === 'st' || value.toLowerCase() === 'nd' || 
             value.toLowerCase() === 'rd' || value.toLowerCase() === 'th') {
      // For ordinals like 1st, 2nd, 3rd, 4th - just append directly without ^
      replacement = value;
    }
    else replacement = '^' + value;
    sup.replaceWith(document.createTextNode(replacement));
  });
  
  // Replace <br> tags with newlines
  clone.querySelectorAll('br').forEach(br => {
    br.replaceWith('\n');
  });
  
  // Get text content
  let text = clone.textContent || '';

  // Remove HTML/CSS artifacts from Word/Excel content
  text = text.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
  text = text.replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags
  text = text.replace(/&[^;]+;/g, ' '); // Replace HTML entities with space
  text = text.replace(/\{[^}]*\}/g, ''); // Remove CSS-like content
  text = text.replace(/mso-data-placement:[^;]*;?/g, ''); // Remove MS Office specific styles

  // IB/Railway pages often separate statements with tabs; treat them as line breaks.
  text = text.replace(/\t+/g, '\n');
  
  // Clean up: trim each line and remove excessive whitespace
  text = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  text = autoFormatLongText(text);
  
  return text || null;
}

function extractOptionText(element: Element | null): string | null {
  if (!element) return null;
  
  // Clone the element
  const clone = element.cloneNode(true) as Element;
  
  // Remove img tags
  clone.querySelectorAll('img').forEach(img => img.remove());
  
  // Normalize superscripts for math units (e.g., cm², m³)
  clone.querySelectorAll('sup').forEach(sup => {
    const value = (sup.textContent || '').trim();
    let replacement = '';
    if (value === '2') replacement = '²';
    else if (value === '3') replacement = '³';
    else if (value === '1') replacement = '¹';
    else if (value === '0') replacement = '⁰';
    else if (value.toLowerCase() === 'st' || value.toLowerCase() === 'nd' || 
             value.toLowerCase() === 'rd' || value.toLowerCase() === 'th') {
      // For ordinals like 1st, 2nd, 3rd, 4th - just append directly without ^
      replacement = value;
    }
    else replacement = '^' + value;
    sup.replaceWith(document.createTextNode(replacement));
  });
  
  // Replace <br> tags with newlines
  clone.querySelectorAll('br').forEach(br => {
    br.replaceWith('\n');
  });
  
  // Get text content
  let text = clone.textContent || '';
  
  // Treat tabs as line breaks (common in IB/Railway statement-style questions)
  text = text.replace(/\t+/g, '\n');
  
  // Remove HTML/CSS artifacts from Word/Excel content
  text = text.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
  text = text.replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags
  text = text.replace(/&[^;]+;/g, ' '); // Replace HTML entities with space
  text = text.replace(/\{[^}]*\}/g, ''); // Remove CSS-like content
  text = text.replace(/mso-data-placement:[^;]*;?/g, ''); // Remove MS Office specific styles
  text = text.replace(/mso-[^:]+:[^;]*;?/g, ''); // Remove MS Office specific styles
  text = text.replace(/lang=[^;]*;?/g, ''); // Remove language attributes
  text = text.replace(/style="[^"]*"/g, ''); // Remove inline styles
  text = text.replace(/class="[^"]*"/g, ''); // Remove class attributes

  // Remove option marker prefix (e.g., "1.", "2.", "A)", "B.", "C:")
  text = text.replace(/^\s*(?:\d+|[A-D])[)\.:]\s*/i, '');
  
  // Clean up: trim each line
  text = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  text = autoFormatLongText(text);
  
  return text || null;
}

function mapQuestionToSection(qNum: number, examConfig: ExamConfig | null): { part: string; subject: string; correctMarks: number; negativeMarks: number } {
  if (!examConfig) {
    // Fallback: SSC CGL Mains default
    const defaultConfig = getExamConfig('SSC_CGL_MAINS');
    if (defaultConfig) {
      const ranges = getSubjectRanges(defaultConfig);
      for (const r of ranges) {
        if (qNum >= r.start && qNum <= r.end) return { part: r.part, subject: r.subject, correctMarks: r.correctMarks, negativeMarks: r.negativeMarks };
      }
    }
    return { part: '?', subject: 'Unknown', correctMarks: 3, negativeMarks: 1 };
  }
  const ranges = getSubjectRanges(examConfig);
  for (const r of ranges) {
    if (qNum >= r.start && qNum <= r.end) return { part: r.part, subject: r.subject, correctMarks: r.correctMarks, negativeMarks: r.negativeMarks };
  }
  return { part: '?', subject: 'Unknown', correctMarks: 1, negativeMarks: 0.25 };
}

function extractCandidateInfo(doc: Document): CandidateInfo | null {
  const tables = doc.querySelectorAll('table');
  for (const table of tables) {
    const rows = table.querySelectorAll('tr');
    const info: Partial<CandidateInfo> = {};
    let found = false;
    for (const row of rows) {
      const tds = row.querySelectorAll('td');
      if (tds.length >= 2) {
        const key = tds[0].textContent?.trim().replace(/:$/, '').trim() || '';
        const value = tds[1].textContent?.trim() || '';
        const mappedKey = LABEL_MAP[key];
        if (mappedKey && value) {
          (info as any)[mappedKey] = value;
          found = true;
        }
      }
    }
    if (found && (info.rollNumber || info.candidateName)) {
      return {
        rollNumber: info.rollNumber || '',
        candidateName: info.candidateName || '',
        venueName: info.venueName || '',
        examDate: info.examDate || '',
        examTime: info.examTime || '',
        subject: info.subject || '',
      };
    }
  }
  return null;
}

// ---- AssessmentQPHTMLMode1 format (current logic) ----
function extractAssessmentQuestions(doc: Document, baseUrl: string, examConfig: ExamConfig | null): QuestionResult[] {
  const questions: QuestionResult[] = [];
  const questionRows = doc.querySelectorAll('td.rw');
  let sequentialIndex = 0;

  questionRows.forEach((row) => {
    const questionTbl = row.querySelector('table.questionRowTbl');
    const menuTbl = row.querySelector('table.menu-tbl');
    if (!questionTbl || !menuTbl) return;
    sequentialIndex++;

    let sectionQuestionNumber = 0;
    const qNumTd = questionTbl.querySelector('td.bold[valign="top"]');
    if (qNumTd) {
      const match = qNumTd.textContent?.trim().match(/Q\.(\d+)/);
      if (match) sectionQuestionNumber = parseInt(match[1]);
    }

    let questionImageUrl: string | null = null;
    let questionText: string | null = null;
    const allRows = questionTbl.querySelectorAll('tr');
    for (const tr of allRows) {
      const td = tr.querySelector('td.bold[style*="text-align: left"]');
      if (td) {
        const img = td.querySelector('img');
        if (img) {
          questionImageUrl = resolveImageUrl(img.getAttribute('src') || '', baseUrl);
        } else {
          // Only extract text if there's no image in the question
          const text = extractTextWithLineBreaks(td);
          if (text && text.length > 5) questionText = text;
        }
        break;
      }
    }

    const menuRows = menuTbl.querySelectorAll('tr');
    let statusText = '';
    let chosenOption: number | null = null;
    menuRows.forEach((tr) => {
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 2) {
        const label = tds[0].textContent?.trim() || '';
        const value = tds[1].textContent?.trim() || '';
        if (label.includes('Status')) statusText = value;
        else if (label.includes('Chosen Option')) {
          const num = parseInt(value);
          if (!isNaN(num) && num > 0) chosenOption = num;
        }
      }
    });

    let correctOption: number | null = null;
    const optionImages: QuestionResult['optionImages'] = [];
    const answerTds = questionTbl.querySelectorAll('td.rightAns, td.wrngAns');
    let hasRightAns = false;

    answerTds.forEach((td) => {
      const text = td.textContent?.trim() || '';
      const numMatch = text.match(/^(\d+)\./);
      if (!numMatch) return;
      const optNum = parseInt(numMatch[1]);
      const isRight = td.classList.contains('rightAns');
      if (isRight) { correctOption = optNum; hasRightAns = true; }
      
      // Find option image (exclude tick/cross images)
      let imageUrl: string | null = null;
      const imgs = td.querySelectorAll('img');
      for (const img of imgs) {
        const src = img.getAttribute('src') || '';
        // Skip tick and cross indicator images
        if (!src.includes('tick.png') && !src.includes('cross.png')) {
          imageUrl = resolveImageUrl(src, baseUrl);
          break;
        }
      }
      
      const optionText = extractOptionText(td);
      optionImages.push({ optionNumber: optNum, imageUrl, text: optionText, isCorrect: isRight, isChosen: chosenOption === optNum });
    });

    const sectionInfo = mapQuestionToSection(sequentialIndex, examConfig);
    const isBonus = !hasRightAns;
    const isCorrect = !isBonus && chosenOption !== null && chosenOption === correctOption;
    const isWrong = !isBonus && chosenOption !== null && chosenOption !== correctOption;

    let status: QuestionResult['status'] = 'unattempted';
    let marksAwarded = 0;
    if (isBonus) { status = 'bonus'; marksAwarded = sectionInfo.correctMarks; }
    else if (isCorrect) { status = 'correct'; marksAwarded = sectionInfo.correctMarks; }
    else if (isWrong) { status = 'wrong'; marksAwarded = -sectionInfo.negativeMarks; }

    const bilingual = getBilingualUrls(questionImageUrl);

    questions.push({
      questionNumber: sequentialIndex,
      sectionQuestionNumber,
      part: sectionInfo.part,
      subject: sectionInfo.subject,
      status,
      chosenOption,
      isCorrect,
      correctOption,
      marksAwarded: Math.round(marksAwarded * 1000) / 1000,
      questionImageUrl,
      questionImageUrlHindi: bilingual.hindi,
      questionImageUrlEnglish: bilingual.english,
      questionText,
      optionImages,
    });
  });

  return questions;
}

// ---- ViewCandResponse format (bgcolor-based) ----
function extractViewCandQuestions(doc: Document, baseUrl: string, examConfig: ExamConfig | null): QuestionResult[] {
  const questions: QuestionResult[] = [];
  // Split by PART_SEPARATOR if multi-part
  const tables = doc.querySelectorAll('table');
  let sequentialIndex = 0;

  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tr'));
    let i = 0;
    while (i < rows.length) {
      const row = rows[i];
      const firstTd = row.querySelector('td');
      const text = firstTd?.textContent?.trim() || '';
      const qMatch = text.match(/Q\.?\s*No[:\s]*(\d+)/i) || text.match(/Q\.(\d+)/);

      if (qMatch) {
        sequentialIndex++;
        const qNum = sequentialIndex;
        let questionImageUrl: string | null = null;
        const img = row.querySelector('img');
        if (img) questionImageUrl = resolveImageUrl(img.getAttribute('src') || '', baseUrl);

        // Read option rows (next 4-5 rows with bgcolor or option numbers)
        const optionImages: QuestionResult['optionImages'] = [];
        let correctOption: number | null = null;
        let chosenOption: number | null = null;
        let j = i + 1;

        while (j < rows.length && optionImages.length < 5) {
          const optRow = rows[j];
          const bgColor = optRow.getAttribute('bgcolor')?.toLowerCase() || '';
          const optTd = optRow.querySelector('td');
          const optText = optTd?.textContent?.trim() || '';
          const optMatch = optText.match(/^(\d+)\./);

          if (optMatch) {
            const optNum = parseInt(optMatch[1]);
            const isGreen = bgColor === 'green' || bgColor === '#00ff00' || bgColor === 'lime';
            const isYellow = bgColor === 'yellow' || bgColor === '#ffff00';
            const isRed = bgColor === 'red' || bgColor === '#ff0000';

            const isCorrectOpt = isGreen || isYellow;
            if (isCorrectOpt) correctOption = optNum;
            if (isRed) chosenOption = optNum;

            const optImg = optRow.querySelector('img');
            let imgUrl: string | null = null;
            if (optImg) imgUrl = resolveImageUrl(optImg.getAttribute('src') || '', baseUrl);

            const optText = extractOptionText(optRow.querySelector('td'));
            optionImages.push({ optionNumber: optNum, imageUrl: imgUrl, text: optText, isCorrect: isCorrectOpt, isChosen: isRed });
            j++;
          } else {
            break;
          }
        }

        // If no red chosen, check for green+tick (correct answered)
        if (!chosenOption && correctOption) {
          // Check if any option row had a tick image indicating user chose it
          const greenOpt = optionImages.find(o => o.isCorrect);
          if (greenOpt) { chosenOption = greenOpt.optionNumber; greenOpt.isChosen = true; }
        }

        const sectionInfo = mapQuestionToSection(qNum, examConfig);
        const isBonus = correctOption === null;
        const isCorrect = !isBonus && chosenOption === correctOption;
        const isWrong = !isBonus && chosenOption !== null && chosenOption !== correctOption;

        let status: QuestionResult['status'] = 'unattempted';
        let marksAwarded = 0;
        if (isBonus) { status = 'bonus'; marksAwarded = sectionInfo.correctMarks; }
        else if (isCorrect) { status = 'correct'; marksAwarded = sectionInfo.correctMarks; }
        else if (isWrong) { status = 'wrong'; marksAwarded = -sectionInfo.negativeMarks; }

        const bilingual = getBilingualUrls(questionImageUrl);

        questions.push({
          questionNumber: qNum,
          sectionQuestionNumber: parseInt(qMatch[1]) || qNum,
          part: sectionInfo.part,
          subject: sectionInfo.subject,
          status,
          chosenOption,
          isCorrect,
          correctOption,
          marksAwarded: Math.round(marksAwarded * 1000) / 1000,
          questionImageUrl,
          questionImageUrlHindi: bilingual.hindi,
          questionImageUrlEnglish: bilingual.english,
          questionText: null,
          optionImages,
        });

        i = j;
      } else {
        i++;
      }
    }
  }

  return questions;
}

function calculateScorecard(questions: QuestionResult[], baseUrl: string, candidateInfo: CandidateInfo | null, examConfig: ExamConfig | null): ScorecardData {
  const sections: SectionResult[] = [];
  let qualifyingSection: SectionResult | null = null;

  const config = examConfig || getExamConfig('SSC_CGL_MAINS');
  if (config) {
    const ranges = getSubjectRanges(config);
    for (const range of ranges) {
      const sectionQs = questions.filter(q => q.questionNumber >= range.start && q.questionNumber <= range.end);
      const correct = sectionQs.filter(q => q.status === 'correct').length;
      const wrong = sectionQs.filter(q => q.status === 'wrong').length;
      const bonus = sectionQs.filter(q => q.status === 'bonus').length;
      const skipped = sectionQs.filter(q => q.status === 'unattempted').length;
      const score = correct * range.correctMarks + bonus * range.correctMarks - wrong * range.negativeMarks;

      const result: SectionResult = {
        part: range.part,
        subject: range.subject,
        totalQuestions: range.end - range.start + 1,
        correct,
        wrong,
        skipped,
        bonus,
        marksPerCorrect: range.correctMarks,
        negativePerWrong: range.negativeMarks,
        maxMarks: range.maxMarks,
        score: Math.round(score * 10) / 10,
        isQualifying: range.isQualifying,
      };

      if (range.isQualifying) {
        qualifyingSection = result;
      } else {
        sections.push(result);
      }
    }
  }

  const nonQualifying = sections;
  const totalCorrect = nonQualifying.reduce((s, sec) => s + sec.correct, 0);
  const totalWrong = nonQualifying.reduce((s, sec) => s + sec.wrong, 0);
  const totalSkipped = nonQualifying.reduce((s, sec) => s + sec.skipped, 0);
  const totalScore = Math.round(nonQualifying.reduce((s, sec) => s + sec.score, 0) * 10) / 10;
  const totalMaxMarks = nonQualifying.reduce((s, sec) => s + sec.maxMarks, 0);

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
    examConfig: config || null,
  };
}

export function getQuestionsForSection(data: ScorecardData, part: string): QuestionResult[] {
  return data.questions.filter(q => q.part === part);
}
