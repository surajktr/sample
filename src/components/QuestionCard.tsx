import { CheckCircle2, XCircle, MinusCircle, Star } from 'lucide-react';
import type { QuestionResult } from '@/lib/parseSSCHtml';
import { Badge } from '@/components/ui/badge';

interface QuestionCardProps {
  question: QuestionResult;
  language?: 'hindi' | 'english' | 'bilingual';
}

const QuestionCard = ({ question, language = 'hindi' }: QuestionCardProps) => {
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

  const statusBadgeVariant = question.status === 'correct'
    ? 'default'
    : question.status === 'wrong'
    ? 'destructive'
    : question.status === 'bonus'
    ? 'secondary'
    : 'outline';

  const marksDisplay = question.marksAwarded > 0 
    ? `+${question.marksAwarded}` 
    : question.marksAwarded;

  const getQuestionImageUrl = () => {
    if (language === 'english' && question.questionImageUrlEnglish) {
      return question.questionImageUrlEnglish;
    }
    if (language === 'hindi' && question.questionImageUrlHindi) {
      return question.questionImageUrlHindi;
    }
    return question.questionImageUrl;
  };

  const questionImageUrl = getQuestionImageUrl();

  return (
    <div className={`rounded-xl border-2 p-4 ${statusColor} transition-colors`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            Q.{question.sectionQuestionNumber || question.questionNumber}
          </span>
          <StatusIcon className={`w-5 h-5 ${statusIconColor}`} />
          <Badge variant={statusBadgeVariant} className="text-xs">
            {question.status}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {question.part} · {question.subject}
          </span>
          {question.status === 'bonus' && (
            <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              BONUS - No correct answer marked
            </Badge>
          )}
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${
          question.marksAwarded > 0 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
            : question.marksAwarded < 0
            ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
            : 'bg-muted text-muted-foreground'
        }`}>
          {marksDisplay} marks
        </span>
      </div>

      {question.questionText && (
        <div className="mb-3 text-sm text-foreground whitespace-pre-wrap">
          {question.questionText}
        </div>
      )}

      {language === 'bilingual' ? (
        <div className="space-y-3 mb-3">
          {question.questionImageUrlHindi && (
            <div className="overflow-x-auto bg-background rounded-lg p-2">
              <div className="text-xs text-muted-foreground mb-1 font-semibold">Hindi</div>
              <img 
                src={question.questionImageUrlHindi} 
                alt={`Question ${question.sectionQuestionNumber} (Hindi)`} 
                className="max-w-full h-auto" 
                loading="lazy" 
              />
            </div>
          )}
          {question.questionImageUrlEnglish && (
            <div className="overflow-x-auto bg-background rounded-lg p-2">
              <div className="text-xs text-muted-foreground mb-1 font-semibold">English</div>
              <img 
                src={question.questionImageUrlEnglish} 
                alt={`Question ${question.sectionQuestionNumber} (English)`} 
                className="max-w-full h-auto" 
                loading="lazy" 
              />
            </div>
          )}
        </div>
      ) : questionImageUrl && (
        <div className="mb-3 overflow-x-auto bg-background rounded-lg p-2">
          <img 
            src={questionImageUrl} 
            alt={`Question ${question.sectionQuestionNumber}`} 
            className="max-w-full h-auto" 
            loading="lazy" 
          />
        </div>
      )}

      {question.optionImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.optionImages.map((opt) => {
            const isCorrectAnswer = opt.isCorrect;
            const isWrongChosen = opt.isChosen && !opt.isCorrect;
            const isCorrectChosen = opt.isChosen && opt.isCorrect;
            
            let optBorder = 'border-border bg-card';
            let labelStyle = 'bg-muted text-muted-foreground';
            
            if (isCorrectAnswer && !isWrongChosen) {
              optBorder = 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30';
              labelStyle = 'bg-emerald-500 text-white';
            }
            
            if (isWrongChosen) {
              optBorder = 'border-red-400 bg-red-50/70 dark:bg-red-950/30';
              labelStyle = 'bg-red-500 text-white';
            }
            
            if (isCorrectAnswer && question.status === 'wrong' && !isWrongChosen) {
              optBorder = 'border-orange-400 bg-orange-50/70 dark:bg-orange-950/30';
            }

            const optionLabel = String.fromCharCode(64 + opt.optionNumber);

            return (
              <div 
                key={opt.optionNumber} 
                className={`flex items-start gap-2 rounded-lg border-2 p-2 ${optBorder} transition-colors`}
              >
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${labelStyle}`}>
                  {optionLabel}
                </span>
                <div className="flex-1 min-w-0">
                  {opt.imageUrl && (
                    <img 
                      src={opt.imageUrl} 
                      alt={`Option ${optionLabel}`} 
                      className="max-w-full h-auto mb-1" 
                      loading="lazy" 
                    />
                  )}
                  {opt.text && (
                    <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                      {opt.text}
                    </div>
                  )}
                  {!opt.imageUrl && !opt.text && (
                    <span className="text-sm text-muted-foreground">No content</span>
                  )}
                </div>
                {isCorrectChosen && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                )}
                {isWrongChosen && (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
