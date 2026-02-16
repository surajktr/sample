import { useState } from 'react';
import type { QuestionResult, ScorecardData } from '@/lib/parseSSCHtml';
import { getQuestionsForSection } from '@/lib/parseSSCHtml';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, MinusCircle, Star } from 'lucide-react';

interface QuestionDetailProps {
  data: ScorecardData;
}

const QuestionDetail = ({ data }: QuestionDetailProps) => {
  const allSections = [...data.sections, ...(data.qualifyingSection ? [data.qualifyingSection] : [])];

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-foreground mb-4">Question-wise Details</h2>

      <Tabs defaultValue={allSections[0]?.part || 'A'} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          {allSections.map((sec) => (
            <TabsTrigger key={sec.part} value={sec.part} className="text-xs sm:text-sm">
              {sec.part}. {sec.subject.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {allSections.map((sec) => {
          const questions = getQuestionsForSection(data, sec.part);
          return (
            <TabsContent key={sec.part} value={sec.part}>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {sec.subject} — {questions.length} questions
                </p>
                {questions.map((q) => (
                  <QuestionCard key={q.questionNumber} question={q} />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

function QuestionCard({ question }: { question: QuestionResult }) {
  const statusColor = question.status === 'correct'
    ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
    : question.status === 'wrong'
    ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
    : question.status === 'bonus'
    ? 'border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
    : 'border-border bg-card';

  const StatusIcon = question.status === 'correct'
    ? CheckCircle2
    : question.status === 'wrong'
    ? XCircle
    : question.status === 'bonus'
    ? Star
    : MinusCircle;

  const statusIconColor = question.status === 'correct'
    ? 'text-emerald-500'
    : question.status === 'wrong'
    ? 'text-red-500'
    : question.status === 'bonus'
    ? 'text-amber-500'
    : 'text-muted-foreground';

  return (
    <div className={`rounded-xl border-2 p-4 ${statusColor} transition-colors`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            Q.{question.sectionQuestionNumber || question.questionNumber}
          </span>
          <StatusIcon className={`w-5 h-5 ${statusIconColor}`} />
          <span className="text-xs text-muted-foreground">{question.status}</span>
          <span className="text-[10px] text-muted-foreground">{question.part} · {question.subject}</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {question.marksAwarded > 0 ? `+${question.marksAwarded}` : question.marksAwarded}
        </span>
      </div>

      {question.questionImageUrl && (
        <div className="mb-3 overflow-x-auto bg-background rounded-lg p-2">
          <img src={question.questionImageUrl} alt={`Question ${question.sectionQuestionNumber}`} className="max-w-full h-auto" loading="lazy" />
        </div>
      )}

      {question.optionImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.optionImages.map((opt) => {
            let optBorder = 'border-border';
            if (opt.isCorrect) optBorder = 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30';
            else if (opt.isChosen && !opt.isCorrect) optBorder = 'border-red-400 bg-red-50/70 dark:bg-red-950/30';

            return (
              <div key={opt.optionNumber} className={`flex items-start gap-2 rounded-lg border p-2 ${optBorder}`}>
                <span className="text-xs font-bold text-muted-foreground mt-1 shrink-0">{opt.optionNumber}.</span>
                {opt.imageUrl ? (
                  <img src={opt.imageUrl} alt={`Option ${opt.optionNumber}`} className="max-w-full h-auto" loading="lazy" />
                ) : (
                  <span className="text-sm text-muted-foreground">No image</span>
                )}
                {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />}
                {opt.isChosen && !opt.isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-1" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuestionDetail;
