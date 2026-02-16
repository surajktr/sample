import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { QuestionResult, ScorecardData } from '@/lib/parseSSCHtml';
import { getQuestionsForSection } from '@/lib/parseSSCHtml';

interface QuestionAnalysisProps {
  data: ScorecardData;
  language?: string;
}

const QuestionAnalysis = ({ data, language = 'hindi' }: QuestionAnalysisProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const allSections = [...data.sections, ...(data.qualifyingSection ? [data.qualifyingSection] : [])];

  const questions =
    activeTab === 'all'
      ? data.questions
      : getQuestionsForSection(data, activeTab);

  const tabs = [
    { key: 'all', label: `All (${data.questions.length})` },
    ...allSections.map((s) => ({
      key: s.part,
      label: `${s.part}: ${s.subject.split(' ')[0]}... (${s.totalQuestions})`,
    })),
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="flex items-center gap-3 p-6 pb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground text-lg">Question Analysis</h3>
      </div>

      <div className="px-6 flex gap-2 overflow-x-auto pb-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border">
        {questions.map((q) => (
          <QuestionRow key={q.questionNumber} question={q} language={language} />
        ))}
      </div>
    </div>
  );
};

function QuestionRow({ question, language }: { question: QuestionResult; language: string }) {
  const scoreText = question.status === 'bonus'
    ? `+${question.marksAwarded}`
    : question.status === 'correct'
    ? `+${question.marksAwarded}`
    : question.status === 'wrong'
    ? `${question.marksAwarded}`
    : '0.0';

  const scoreColor = question.status === 'correct' || question.status === 'bonus'
    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400'
    : question.status === 'wrong'
    ? 'text-red-500 bg-red-50 dark:bg-red-950/30 dark:text-red-400'
    : 'text-muted-foreground bg-muted';

  const statusBadge = question.status === 'bonus'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    : '';

  // Choose image URL based on language preference
  const imgUrl = language === 'english' && question.questionImageUrlEnglish
    ? question.questionImageUrlEnglish
    : language === 'hindi' && question.questionImageUrlHindi
    ? question.questionImageUrlHindi
    : question.questionImageUrl;

  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="font-bold text-foreground">Q.{question.sectionQuestionNumber || question.questionNumber}</span>
        <span className="text-[10px] text-muted-foreground">{question.part} · {question.subject}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${scoreColor}`}>{scoreText}</span>
        {question.status === 'bonus' && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusBadge}`}>BONUS</span>
        )}
      </div>

      {question.questionText && (
        <p className="text-sm text-foreground mb-3">{question.questionText}</p>
      )}

      {imgUrl && (
        <div className="mb-4 bg-background rounded-lg p-3 overflow-x-auto">
          <img src={imgUrl} alt={`Question ${question.sectionQuestionNumber}`} className="max-w-full h-auto" loading="lazy" />
        </div>
      )}

      {question.optionImages.length > 0 && (
        <div className="space-y-2">
          {question.optionImages.map((opt) => {
            const isCorrectAnswer = opt.isCorrect;
            const isWrongChosen = opt.isChosen && !opt.isCorrect;
            const optLabel = String.fromCharCode(64 + opt.optionNumber);

            let rowStyle = '';
            let circleStyle = 'bg-muted text-muted-foreground';
            if (isCorrectAnswer) {
              rowStyle = 'bg-emerald-50/70 dark:bg-emerald-950/20';
              circleStyle = 'bg-emerald-500 text-white';
            } else if (isWrongChosen) {
              rowStyle = 'bg-red-50/70 dark:bg-red-950/20';
              circleStyle = 'bg-red-500 text-white';
            }

            return (
              <div key={opt.optionNumber} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${rowStyle} transition-colors`}>
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 ${circleStyle}`}>
                  {optLabel}
                </span>
                {opt.imageUrl ? (
                  <img src={opt.imageUrl} alt={`Option ${optLabel}`} className="max-w-full h-auto" loading="lazy" />
                ) : (
                  <span className="text-sm text-muted-foreground">No image</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuestionAnalysis;
