import type { ScorecardData, QuestionResult } from '@/lib/parseSSCHtml';

type LanguageOption = 'hindi' | 'english' | 'bilingual';
type DownloadMode = 'response-sheet' | 'answer-key' | 'quiz';

interface HtmlGeneratorOptions {
  data: ScorecardData;
  language: LanguageOption;
  mode: DownloadMode;
}

export const useHtmlGenerator = () => {
  const generateHtml = ({ data, language, mode }: HtmlGeneratorOptions): string => {
    if (mode === 'response-sheet') {
      return generateResponseSheet(data, language);
    } else if (mode === 'answer-key') {
      return generateAnswerKey(data, language);
    } else if (mode === 'quiz') {
      return generateQuizMode(data, language);
    }
    return '';
  };

  const downloadHtml = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return { generateHtml, downloadHtml };
};

const getQuestionImageUrl = (question: QuestionResult, language: LanguageOption): string | null => {
  if (language === 'english' && question.questionImageUrlEnglish) {
    return question.questionImageUrlEnglish;
  }
  if (language === 'hindi' && question.questionImageUrlHindi) {
    return question.questionImageUrlHindi;
  }
  return question.questionImageUrl;
};

const generateResponseSheet = (data: ScorecardData, language: LanguageOption): string => {
  const allSections = [...data.sections, ...(data.qualifyingSection ? [data.qualifyingSection] : [])];
  
  const candidateInfoHtml = data.candidateInfo ? `
    <div class="candidate-info">
      <h2>Candidate Information</h2>
      <table class="info-table">
        <tr><td><strong>Roll Number:</strong></td><td>${data.candidateInfo.rollNumber}</td></tr>
        <tr><td><strong>Name:</strong></td><td>${data.candidateInfo.candidateName}</td></tr>
        <tr><td><strong>Venue:</strong></td><td>${data.candidateInfo.venueName}</td></tr>
        <tr><td><strong>Exam Date:</strong></td><td>${data.candidateInfo.examDate}</td></tr>
        <tr><td><strong>Exam Time:</strong></td><td>${data.candidateInfo.examTime}</td></tr>
        <tr><td><strong>Subject:</strong></td><td>${data.candidateInfo.subject}</td></tr>
      </table>
    </div>
  ` : '';

  const sectionBreakdownHtml = `
    <div class="section-breakdown">
      <h2>Section-wise Breakdown</h2>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Subject</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Skipped</th>
            <th>Bonus</th>
            <th>Score</th>
            <th>Max Marks</th>
          </tr>
        </thead>
        <tbody>
          ${allSections.map(sec => `
            <tr>
              <td>${sec.part}</td>
              <td>${sec.subject}</td>
              <td class="correct">${sec.correct}</td>
              <td class="wrong">${sec.wrong}</td>
              <td class="skipped">${sec.skipped}</td>
              <td class="bonus">${sec.bonus}</td>
              <td><strong>${sec.score}</strong></td>
              <td>${sec.maxMarks}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2"><strong>Total</strong></td>
            <td class="correct"><strong>${data.totalCorrect}</strong></td>
            <td class="wrong"><strong>${data.totalWrong}</strong></td>
            <td class="skipped"><strong>${data.totalSkipped}</strong></td>
            <td class="bonus"><strong>-</strong></td>
            <td><strong>${data.totalScore}</strong></td>
            <td><strong>${data.totalMaxMarks}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const questionsHtml = data.questions.map(q => {
    const questionImageUrl = getQuestionImageUrl(q, language);
    const marksDisplay = q.marksAwarded > 0 ? `+${q.marksAwarded}` : q.marksAwarded;
    
    const questionImages = language === 'bilingual' 
      ? `
        ${q.questionImageUrlHindi ? `<div class="question-image"><div class="lang-label">Hindi</div><img src="${q.questionImageUrlHindi}" alt="Question ${q.sectionQuestionNumber} (Hindi)" /></div>` : ''}
        ${q.questionImageUrlEnglish ? `<div class="question-image"><div class="lang-label">English</div><img src="${q.questionImageUrlEnglish}" alt="Question ${q.sectionQuestionNumber} (English)" /></div>` : ''}
      `
      : questionImageUrl ? `<div class="question-image"><img src="${questionImageUrl}" alt="Question ${q.sectionQuestionNumber}" /></div>` : '';

    return `
      <div class="question-card status-${q.status}">
        <div class="question-header">
          <div class="question-meta">
            <span class="question-number">Q.${q.sectionQuestionNumber || q.questionNumber}</span>
            <span class="status-badge ${q.status}">${q.status}</span>
            <span class="section-info">${q.part} · ${q.subject}</span>
            ${q.status === 'bonus' ? '<span class="bonus-note">BONUS - No correct answer marked</span>' : ''}
          </div>
          <span class="marks marks-${q.marksAwarded > 0 ? 'positive' : q.marksAwarded < 0 ? 'negative' : 'zero'}">${marksDisplay} marks</span>
        </div>
        ${q.questionText ? `<div class="question-text">${q.questionText.replace(/\n/g, '<br>')}</div>` : ''}
        ${questionImages}
        <div class="options">
          ${q.optionImages.map(opt => {
            const optionLabel = String.fromCharCode(64 + opt.optionNumber);
            const isCorrectAnswer = opt.isCorrect;
            const isWrongChosen = opt.isChosen && !opt.isCorrect;
            const isCorrectChosen = opt.isChosen && opt.isCorrect;
            
            let optionClass = 'option';
            if (isCorrectAnswer && !isWrongChosen) optionClass += ' correct-answer';
            if (isWrongChosen) optionClass += ' wrong-chosen';
            if (isCorrectAnswer && q.status === 'wrong' && !isWrongChosen) optionClass += ' highlight-correct';
            
            return `
              <div class="${optionClass}">
                <span class="option-label">${optionLabel}</span>
                <div class="option-content">
                  ${opt.imageUrl ? `<img src="${opt.imageUrl}" alt="Option ${optionLabel}" />` : ''}
                  ${opt.text ? `<div class="option-text">${opt.text.replace(/\n/g, '<br>')}</div>` : ''}
                  ${!opt.imageUrl && !opt.text ? '<span class="no-content">No content</span>' : ''}
                </div>
                ${isCorrectChosen ? '<span class="indicator correct-indicator">✓</span>' : ''}
                ${isWrongChosen ? '<span class="indicator wrong-indicator">✗</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Response Sheet - ${data.candidateInfo?.rollNumber || 'Scorecard'}</title>
      <style>
        ${getResponseSheetStyles()}
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Response Sheet Analysis</h1>
        ${candidateInfoHtml}
        ${sectionBreakdownHtml}
        <div class="questions-section">
          <h2>Question-wise Analysis</h2>
          ${questionsHtml}
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateAnswerKey = (data: ScorecardData, language: LanguageOption): string => {
  const questionsHtml = data.questions.map(q => {
    const questionImageUrl = getQuestionImageUrl(q, language);
    
    const questionImages = language === 'bilingual' 
      ? `
        ${q.questionImageUrlHindi ? `<div class="question-image"><div class="lang-label">Hindi</div><img src="${q.questionImageUrlHindi}" alt="Question ${q.sectionQuestionNumber} (Hindi)" /></div>` : ''}
        ${q.questionImageUrlEnglish ? `<div class="question-image"><div class="lang-label">English</div><img src="${q.questionImageUrlEnglish}" alt="Question ${q.sectionQuestionNumber} (English)" /></div>` : ''}
      `
      : questionImageUrl ? `<div class="question-image"><img src="${questionImageUrl}" alt="Question ${q.sectionQuestionNumber}" /></div>` : '';

    return `
      <div class="question-card">
        <div class="question-header">
          <div class="question-meta">
            <span class="question-number">Q.${q.sectionQuestionNumber || q.questionNumber}</span>
            <span class="section-info">${q.part} · ${q.subject}</span>
            ${q.status === 'bonus' ? '<span class="bonus-note">BONUS</span>' : ''}
          </div>
        </div>
        ${q.questionText ? `<div class="question-text">${q.questionText.replace(/\n/g, '<br>')}</div>` : ''}
        ${questionImages}
        <div class="options">
          ${q.optionImages.map(opt => {
            const optionLabel = String.fromCharCode(64 + opt.optionNumber);
            const isCorrectAnswer = opt.isCorrect;
            
            return `
              <div class="option ${isCorrectAnswer ? 'correct-answer' : ''}">
                <span class="option-label">${optionLabel}</span>
                <div class="option-content">
                  ${opt.imageUrl ? `<img src="${opt.imageUrl}" alt="Option ${optionLabel}" />` : ''}
                  ${opt.text ? `<div class="option-text">${opt.text.replace(/\n/g, '<br>')}</div>` : ''}
                  ${!opt.imageUrl && !opt.text ? '<span class="no-content">No content</span>' : ''}
                </div>
                ${isCorrectAnswer ? '<span class="indicator correct-indicator">✓</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Answer Key</title>
      <style>
        ${getAnswerKeyStyles()}
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Answer Key</h1>
        <div class="questions-section">
          ${questionsHtml}
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateQuizMode = (data: ScorecardData, language: LanguageOption): string => {
  const questionsHtml = data.questions.map((q, index) => {
    const questionImageUrl = getQuestionImageUrl(q, language);
    
    const questionImages = language === 'bilingual' 
      ? `
        ${q.questionImageUrlHindi ? `<div class="question-image"><div class="lang-label">Hindi</div><img src="${q.questionImageUrlHindi}" alt="Question ${q.sectionQuestionNumber} (Hindi)" /></div>` : ''}
        ${q.questionImageUrlEnglish ? `<div class="question-image"><div class="lang-label">English</div><img src="${q.questionImageUrlEnglish}" alt="Question ${q.sectionQuestionNumber} (English)" /></div>` : ''}
      `
      : questionImageUrl ? `<div class="question-image"><img src="${questionImageUrl}" alt="Question ${q.sectionQuestionNumber}" /></div>` : '';

    return `
      <div class="question-card" id="question-${index}">
        <div class="question-header">
          <div class="question-meta">
            <span class="question-number">Q.${q.sectionQuestionNumber || q.questionNumber}</span>
            <span class="section-info">${q.part} · ${q.subject}</span>
            ${q.status === 'bonus' ? '<span class="bonus-note">BONUS</span>' : ''}
          </div>
        </div>
        ${q.questionText ? `<div class="question-text">${q.questionText.replace(/\n/g, '<br>')}</div>` : ''}
        ${questionImages}
        <div class="options" id="options-${index}">
          ${q.optionImages.map(opt => {
            const optionLabel = String.fromCharCode(64 + opt.optionNumber);
            const isCorrectAnswer = opt.isCorrect;
            
            return `
              <div class="option" data-correct="${isCorrectAnswer}" onclick="selectOption(${index}, this)">
                <span class="option-label">${optionLabel}</span>
                <div class="option-content">
                  ${opt.imageUrl ? `<img src="${opt.imageUrl}" alt="Option ${optionLabel}" />` : ''}
                  ${opt.text ? `<div class="option-text">${opt.text.replace(/\n/g, '<br>')}</div>` : ''}
                  ${!opt.imageUrl && !opt.text ? '<span class="no-content">No content</span>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="quiz-controls">
          <button class="show-answer-btn" onclick="showAnswer(${index})">Show Answer</button>
          <div class="feedback" id="feedback-${index}"></div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quiz Mode</title>
      <style>
        ${getQuizModeStyles()}
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Quiz Mode</h1>
        <p class="instructions">Click on an option to check if it's correct, or click "Show Answer" to reveal the correct answer.</p>
        <div class="questions-section">
          ${questionsHtml}
        </div>
      </div>
      <script>
        ${getQuizModeScript()}
      </script>
    </body>
    </html>
  `;
};

const getResponseSheetStyles = (): string => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; padding: 15px; font-size: 13px; line-height: 1.4; }
  .container { max-width: 100%; margin: 0 auto; }
  h1 { color: #1a1a1a; margin-bottom: 15px; font-size: 22px; font-weight: 600; }
  h2 { color: #333; margin: 20px 0 12px; font-size: 16px; font-weight: 600; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
  .candidate-info { margin-bottom: 20px; }
  .info-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .info-table td { padding: 4px 8px; border: 1px solid #ddd; }
  .info-table td:first-child { background: #f5f5f5; width: 140px; font-weight: 500; }
  .breakdown-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
  .breakdown-table th, .breakdown-table td { padding: 6px; border: 1px solid #ddd; text-align: center; }
  .breakdown-table th { background: #f5f5f5; font-weight: 600; }
  .breakdown-table .correct { color: #059669; font-weight: 600; }
  .breakdown-table .wrong { color: #dc2626; font-weight: 600; }
  .breakdown-table .skipped { color: #6b7280; }
  .breakdown-table .bonus { color: #d97706; font-weight: 600; }
  .breakdown-table .total-row { background: #f9fafb; font-weight: 600; }
  .questions-section { margin-top: 20px; }
  .question-card { border-bottom: 1px solid #e5e7eb; padding: 12px 0; page-break-inside: avoid; }
  .question-card:last-child { border-bottom: none; }
  .question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
  .question-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .question-number { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; }
  .status-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
  .status-badge.correct { background: #10b981; color: white; }
  .status-badge.wrong { background: #ef4444; color: white; }
  .status-badge.bonus { background: #f59e0b; color: white; }
  .status-badge.unattempted { background: #6b7280; color: white; }
  .section-info { font-size: 11px; color: #6b7280; }
  .bonus-note { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .marks { padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; }
  .marks-positive { background: #d1fae5; color: #065f46; }
  .marks-negative { background: #fee2e2; color: #991b1b; }
  .marks-zero { background: #f3f4f6; color: #6b7280; }
  .question-text { margin: 8px 0; line-height: 1.5; color: #374151; white-space: pre-wrap; }
  .question-image { margin: 8px 0; }
  .question-image img { max-width: 100%; height: auto; display: block; }
  .lang-label { font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
  .options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 8px; }
  @media (max-width: 600px) { .options { grid-template-columns: 1fr; } }
  .option { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; display: flex; gap: 8px; align-items: flex-start; position: relative; font-size: 12px; }
  .option.correct-answer { border-color: #10b981; background: #f0fdf4; }
  .option.wrong-chosen { border-color: #ef4444; background: #fef2f2; }
  .option.highlight-correct { border-color: #f59e0b; background: #fffbeb; }
  .option-label { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; background: #e5e7eb; color: #6b7280; }
  .option.correct-answer .option-label { background: #10b981; color: white; }
  .option.wrong-chosen .option-label { background: #ef4444; color: white; }
  .option-content { flex: 1; min-width: 0; }
  .option-content img { max-width: 100%; height: auto; display: block; margin-bottom: 4px; }
  .option-text { line-height: 1.4; color: #374151; white-space: pre-wrap; }
  .no-content { color: #9ca3af; font-size: 11px; }
  .indicator { position: absolute; top: 6px; right: 6px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
  .correct-indicator { background: #10b981; color: white; }
  .wrong-indicator { background: #ef4444; color: white; }
  @media print { body { padding: 10px; font-size: 11px; } .question-card { page-break-inside: avoid; } }
`;

const getAnswerKeyStyles = (): string => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; padding: 15px; font-size: 13px; line-height: 1.4; }
  .container { max-width: 100%; margin: 0 auto; }
  h1 { color: #1a1a1a; margin-bottom: 15px; font-size: 22px; text-align: center; font-weight: 600; }
  .questions-section { margin-top: 15px; }
  .question-card { border-bottom: 1px solid #e5e7eb; padding: 12px 0; page-break-inside: avoid; }
  .question-card:last-child { border-bottom: none; }
  .question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
  .question-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .question-number { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; }
  .section-info { font-size: 11px; color: #6b7280; }
  .bonus-note { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .question-text { margin: 8px 0; line-height: 1.5; color: #374151; white-space: pre-wrap; }
  .question-image { margin: 8px 0; }
  .question-image img { max-width: 100%; height: auto; display: block; }
  .lang-label { font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
  .options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 8px; }
  @media (max-width: 600px) { .options { grid-template-columns: 1fr; } }
  .option { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; display: flex; gap: 8px; align-items: flex-start; position: relative; font-size: 12px; }
  .option.correct-answer { border-color: #10b981; background: #f0fdf4; }
  .option-label { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; background: #e5e7eb; color: #6b7280; }
  .option.correct-answer .option-label { background: #10b981; color: white; }
  .option-content { flex: 1; min-width: 0; }
  .option-content img { max-width: 100%; height: auto; display: block; margin-bottom: 4px; }
  .option-text { line-height: 1.4; color: #374151; white-space: pre-wrap; }
  .no-content { color: #9ca3af; font-size: 11px; }
  .indicator { position: absolute; top: 6px; right: 6px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
  .correct-indicator { background: #10b981; color: white; }
  @media print { body { padding: 10px; font-size: 11px; } .question-card { page-break-inside: avoid; } }
`;

const getQuizModeStyles = (): string => `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; padding: 15px; font-size: 13px; line-height: 1.4; }
  .container { max-width: 100%; margin: 0 auto; }
  h1 { color: #1a1a1a; margin-bottom: 12px; font-size: 22px; text-align: center; font-weight: 600; }
  .instructions { text-align: center; color: #6b7280; margin-bottom: 20px; font-size: 12px; }
  .questions-section { margin-top: 15px; }
  .question-card { border-bottom: 1px solid #e5e7eb; padding: 12px 0; }
  .question-card:last-child { border-bottom: none; }
  .question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px; }
  .question-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .question-number { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; }
  .section-info { font-size: 11px; color: #6b7280; }
  .bonus-note { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .question-text { margin: 8px 0; line-height: 1.5; color: #374151; white-space: pre-wrap; }
  .question-image { margin: 8px 0; }
  .question-image img { max-width: 100%; height: auto; display: block; }
  .lang-label { font-size: 11px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
  .options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 8px; }
  @media (max-width: 600px) { .options { grid-template-columns: 1fr; } }
  .option { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; display: flex; gap: 8px; align-items: flex-start; cursor: pointer; transition: all 0.2s; font-size: 12px; }
  .option:hover { border-color: #3b82f6; background: #eff6ff; }
  .option.selected-correct { border-color: #10b981; background: #f0fdf4; cursor: default; }
  .option.selected-wrong { border-color: #ef4444; background: #fef2f2; cursor: default; }
  .option.revealed-correct { border-color: #10b981; background: #f0fdf4; }
  .option-label { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; background: #e5e7eb; color: #6b7280; }
  .option.selected-correct .option-label, .option.revealed-correct .option-label { background: #10b981; color: white; }
  .option.selected-wrong .option-label { background: #ef4444; color: white; }
  .option-content { flex: 1; min-width: 0; }
  .option-content img { max-width: 100%; height: auto; display: block; margin-bottom: 4px; }
  .option-text { line-height: 1.4; color: #374151; white-space: pre-wrap; }
  .no-content { color: #9ca3af; font-size: 11px; }
  .quiz-controls { margin-top: 12px; display: flex; gap: 12px; align-items: center; }
  .show-answer-btn { background: #3b82f6; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-size: 12px; }
  .show-answer-btn:hover { background: #2563eb; }
  .show-answer-btn:disabled { background: #9ca3af; cursor: not-allowed; }
  .feedback { font-weight: 600; font-size: 13px; }
  .feedback.correct { color: #10b981; }
  .feedback.wrong { color: #ef4444; }
`;

const getQuizModeScript = (): string => `
  function selectOption(questionIndex, optionElement) {
    const optionsContainer = document.getElementById('options-' + questionIndex);
    const options = optionsContainer.querySelectorAll('.option');
    const feedback = document.getElementById('feedback-' + questionIndex);
    const showAnswerBtn = optionsContainer.parentElement.querySelector('.show-answer-btn');
    
    // Check if already answered
    const alreadyAnswered = Array.from(options).some(opt => 
      opt.classList.contains('selected-correct') || opt.classList.contains('selected-wrong')
    );
    if (alreadyAnswered) return;
    
    const isCorrect = optionElement.getAttribute('data-correct') === 'true';
    
    if (isCorrect) {
      optionElement.classList.add('selected-correct');
      feedback.textContent = '✓ Correct!';
      feedback.className = 'feedback correct';
    } else {
      optionElement.classList.add('selected-wrong');
      feedback.textContent = '✗ Wrong! Click "Show Answer" to see the correct answer.';
      feedback.className = 'feedback wrong';
    }
    
    showAnswerBtn.disabled = false;
  }
  
  function showAnswer(questionIndex) {
    const optionsContainer = document.getElementById('options-' + questionIndex);
    const options = optionsContainer.querySelectorAll('.option');
    const feedback = document.getElementById('feedback-' + questionIndex);
    const showAnswerBtn = optionsContainer.parentElement.querySelector('.show-answer-btn');
    
    options.forEach(opt => {
      if (opt.getAttribute('data-correct') === 'true') {
        opt.classList.add('revealed-correct');
      }
    });
    
    feedback.textContent = 'Answer revealed';
    feedback.className = 'feedback';
    showAnswerBtn.disabled = true;
  }
`;
