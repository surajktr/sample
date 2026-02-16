import { Trophy, Target, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { ScorecardData } from '@/lib/parseSSCHtml';

interface TotalScoreCardProps {
  data: ScorecardData;
}

const TotalScoreCard = ({ data }: TotalScoreCardProps) => {
  const percentage = data.totalMaxMarks > 0 ? (data.totalScore / data.totalMaxMarks) * 100 : 0;
  const totalAttempted = data.totalCorrect + data.totalWrong;
  const totalQuestions = totalAttempted + data.totalSkipped;
  const accuracy = totalAttempted > 0 ? (data.totalCorrect / totalAttempted) * 100 : 0;
  const attemptRate = totalQuestions > 0 ? (totalAttempted / totalQuestions) * 100 : 0;

  // Get marking scheme from exam config
  const markingLabel = data.examConfig
    ? `+${data.examConfig.subjects[0]?.correctMarks} correct, -${data.examConfig.subjects[0]?.negativeMarks} wrong`
    : '';

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-primary" />
        <div>
          <h3 className="font-bold text-foreground">Total Score</h3>
          {markingLabel && <p className="text-xs text-muted-foreground">{markingLabel}</p>}
        </div>
      </div>

      <div className="flex items-end gap-4 mb-3">
        <div>
          <span className="text-5xl font-extrabold text-foreground">{data.totalScore.toFixed(1)}</span>
          <span className="text-lg text-muted-foreground ml-1">/ {data.totalMaxMarks}</span>
        </div>
        <div className="flex gap-2 mb-2">
          <StatBadge value={data.totalCorrect} label="Correct" color="emerald" />
          <StatBadge value={data.totalWrong} label="Wrong" color="red" />
          <StatBadge value={data.totalSkipped} label="Skipped" color="gray" />
        </div>
      </div>

      <Progress value={percentage} className="h-2.5 mb-1" />
      <p className="text-xs text-muted-foreground mb-4">{percentage.toFixed(1)}% of maximum score</p>

      <div className="flex gap-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="font-bold text-foreground">{accuracy.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Attempt Rate</p>
            <p className="font-bold text-foreground">{attemptRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatBadge({ value, label, color }: { value: number; label: string; color: 'emerald' | 'red' | 'gray' }) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    red: 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400',
    gray: 'bg-muted text-muted-foreground',
  };
  return (
    <div className={`flex flex-col items-center rounded-lg px-3 py-1.5 ${styles[color]}`}>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}

export default TotalScoreCard;
