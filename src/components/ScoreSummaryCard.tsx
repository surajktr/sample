import { Trophy, TrendingUp, Target } from 'lucide-react';
import type { ScorecardData } from '@/lib/parseSSCHtml';

interface ScoreSummaryCardProps {
  data: ScorecardData;
}

const ScoreSummaryCard = ({ data }: ScoreSummaryCardProps) => {
  const percentage = (data.totalScore / data.totalMaxMarks) * 100;
  const totalQuestions = data.totalCorrect + data.totalWrong + data.totalSkipped;
  const attempted = data.totalCorrect + data.totalWrong;
  const attemptRate = totalQuestions > 0 ? (attempted / totalQuestions) * 100 : 0;
  const accuracy = attempted > 0 ? (data.totalCorrect / attempted) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Main Score Display */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Total Score</h2>
              <p className="text-xs text-muted-foreground">+3 correct, -1 / -0.5 wrong</p>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-5xl font-extrabold text-foreground tracking-tight">
              {data.totalScore.toFixed(1)}
            </span>
            <span className="text-lg text-muted-foreground">/ {data.totalMaxMarks}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {percentage.toFixed(1)}% of maximum score
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-px bg-border">
          <div className="bg-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'hsl(var(--correct))' }}>
              {data.totalCorrect}
            </p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="bg-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'hsl(var(--wrong))' }}>
              {data.totalWrong}
            </p>
            <p className="text-xs text-muted-foreground">Wrong</p>
          </div>
          <div className="bg-card p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {data.totalSkipped}
            </p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 gap-px bg-border border-t border-border">
          <div className="bg-card p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-lg font-bold text-foreground">{accuracy.toFixed(1)}%</p>
            </div>
          </div>
          <div className="bg-card p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Attempt Rate</p>
              <p className="text-lg font-bold text-foreground">{attemptRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreSummaryCard;
