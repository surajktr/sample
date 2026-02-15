import { useState } from 'react';
import type { QuestionResult, ScorecardData } from '@/lib/parseSSCHtml';
import { getQuestionsForSection, CGL_MAINS_SECTIONS } from '@/lib/parseSSCHtml';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, MinusCircle, FileText, Filter } from 'lucide-react';

type StatusFilter = 'all' | 'correct' | 'wrong' | 'skipped';

interface QuestionDetailProps {
  data: ScorecardData;
}

const QuestionDetail = ({ data }: QuestionDetailProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const allSections = CGL_MAINS_SECTIONS;

  const filterQuestions = (questions: QuestionResult[]) => {
    if (statusFilter === 'all') return questions;
    return questions.filter((q) => {
      if (statusFilter === 'correct') return q.isCorrect;
      if (statusFilter === 'wrong') return q.chosenOption !== null && !q.isCorrect;
      if (statusFilter === 'skipped') return q.chosenOption === null;
      return true;
    });
  };

  const getStatusCount = (questions: QuestionResult[], status: StatusFilter) => {
    if (status === 'all') return questions.length;
    return questions.filter((q) => {
      if (status === 'correct') return q.isCorrect;
      if (status === 'wrong') return q.chosenOption !== null && !q.isCorrect;
      if (status === 'skipped') return q.chosenOption === null;
      return true;
    }).length;
  };

  // Get all questions for filter counts
  const allQuestions = data.questions;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Question Analysis</h2>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All ({getStatusCount(allQuestions, 'all')})</option>
            <option value="correct">Correct ({getStatusCount(allQuestions, 'correct')})</option>
            <option value="wrong">Wrong ({getStatusCount(allQuestions, 'wrong')})</option>
            <option value="skipped">Skipped ({getStatusCount(allQuestions, 'skipped')})</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="A" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          {allSections.map((sec) => (
            <TabsTrigger key={sec.part} value={sec.part} className="text-xs sm:text-sm">
              {sec.part}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <QuestionList questions={filterQuestions(allQuestions)} />
        </TabsContent>

        {allSections.map((sec) => {
          const questions = getQuestionsForSection(data, sec.part);
          return (
            <TabsContent key={sec.part} value={sec.part}>
              <p className="text-sm text-muted-foreground mb-4">
                {sec.subject} — {questions.length} questions
              </p>
              <QuestionList questions={filterQuestions(questions)} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

function QuestionList({ questions }: { questions: QuestionResult[] }) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MinusCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p>No questions match the selected filters</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <QuestionCard key={q.questionNumber} question={q} />
      ))}
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionResult }) {
  const isCorrect = question.isCorrect;
  const isWrong = question.chosenOption !== null && !isCorrect;
  const isSkipped = question.chosenOption === null;

  const getStatusBadge = () => {
    if (isCorrect) {
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(var(--correct-bg))', color: 'hsl(var(--correct))' }}>
          +{(CGL_MAINS_SECTIONS.find(s => question.questionNumber >= s.start && question.questionNumber <= s.end)?.marksPerCorrect || 3).toFixed(1)}
        </span>
      );
    }
    if (isWrong) {
      const section = CGL_MAINS_SECTIONS.find(s => question.questionNumber >= s.start && question.questionNumber <= s.end);
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(var(--wrong-bg))', color: 'hsl(var(--wrong))' }}>
          -{(section?.negativePerWrong || 1).toFixed(1)}
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
        0.0
      </span>
    );
  };

  const getOptionClass = (opt: QuestionResult['optionImages'][0]) => {
    if (opt.isChosen && opt.isCorrect) return { bg: 'hsl(var(--correct-bg) / 0.5)', border: 'hsl(var(--correct))' };
    if (opt.isChosen && !opt.isCorrect) return { bg: 'hsl(var(--wrong-bg) / 0.5)', border: 'hsl(var(--wrong))' };
    if (!opt.isChosen && opt.isCorrect && !isCorrect) return { bg: 'hsl(var(--right-answer-bg) / 0.5)', border: 'hsl(var(--right-answer))' };
    return { bg: 'transparent', border: 'hsl(var(--border))' };
  };

  const getOptionLabelClass = (opt: QuestionResult['optionImages'][0]) => {
    if (opt.isChosen && opt.isCorrect) return { bg: 'hsl(var(--correct))', color: 'white' };
    if (opt.isChosen && !opt.isCorrect) return { bg: 'hsl(var(--wrong))', color: 'white' };
    if (!opt.isChosen && opt.isCorrect && !isCorrect) return { bg: 'hsl(var(--right-answer))', color: 'white' };
    return { bg: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' };
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            Q.{question.sectionQuestionNumber || question.questionNumber}
          </span>
          {getStatusBadge()}
        </div>
      </div>

      {/* Question Image */}
      {question.questionImageUrl && (
        <div className="mb-3 overflow-x-auto bg-background rounded-lg p-2">
          <img
            src={question.questionImageUrl}
            alt={`Question ${question.sectionQuestionNumber}`}
            className="max-w-full h-auto"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Options */}
      {question.optionImages.length > 0 && (
        <div className="space-y-2">
          {question.optionImages.map((opt) => {
            const optStyle = getOptionClass(opt);
            const labelStyle = getOptionLabelClass(opt);
            return (
              <div
                key={opt.optionNumber}
                className="flex items-center gap-2 rounded-lg p-2 transition-colors"
                style={{ backgroundColor: optStyle.bg, border: `1px solid ${optStyle.border}` }}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
                  style={{ backgroundColor: labelStyle.bg, color: labelStyle.color }}
                >
                  {opt.optionNumber}
                </span>
                {opt.imageUrl ? (
                  <img
                    src={opt.imageUrl}
                    alt={`Option ${opt.optionNumber}`}
                    className="max-w-full h-auto max-h-16"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Option {opt.optionNumber}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuestionDetail;
