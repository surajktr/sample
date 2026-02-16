import { BarChart3 } from 'lucide-react';
import type { ScorecardData } from '@/lib/parseSSCHtml';

interface SectionBreakdownProps {
  data: ScorecardData;
}

const SectionBreakdown = ({ data }: SectionBreakdownProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-6 pb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground text-lg">Section-wise Breakdown</h3>
      </div>

      <div className="grid grid-cols-7 gap-2 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <div>Part</div>
        <div className="col-span-2">Subject</div>
        <div className="text-center">Marks</div>
        <div className="text-center text-emerald-600 dark:text-emerald-400">Correct</div>
        <div className="text-center text-red-500 dark:text-red-400">Wrong</div>
        <div className="text-right">Score</div>
      </div>

      {data.sections.map((sec) => (
        <div key={sec.part} className="grid grid-cols-7 gap-2 px-6 py-4 border-b border-border/50 items-center hover:bg-muted/20 transition-colors">
          <div>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm">
              {sec.part}
            </span>
          </div>
          <div className="col-span-2">
            <p className="font-medium text-foreground text-sm">{sec.subject}</p>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            +{sec.marksPerCorrect} / -{sec.negativePerWrong}
          </div>
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-950/30 dark:text-emerald-400">
              {sec.correct}
            </span>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-500 font-bold dark:bg-red-950/30 dark:text-red-400">
              {sec.wrong}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-foreground">{sec.score.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-0.5">/{sec.maxMarks}</span>
          </div>
        </div>
      ))}

      {data.qualifyingSection && (
        <div className="grid grid-cols-7 gap-2 px-6 py-4 border-b border-border/50 items-center bg-muted/10">
          <div>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm">
              {data.qualifyingSection.part}
            </span>
          </div>
          <div className="col-span-2">
            <p className="font-medium text-foreground text-sm">
              {data.qualifyingSection.subject}
              <span className="ml-2 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Qualifying</span>
            </p>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            +{data.qualifyingSection.marksPerCorrect} / -{data.qualifyingSection.negativePerWrong}
          </div>
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-950/30 dark:text-emerald-400">
              {data.qualifyingSection.correct}
            </span>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-500 font-bold dark:bg-red-950/30 dark:text-red-400">
              {data.qualifyingSection.wrong}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-foreground">{data.qualifyingSection.score.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground ml-0.5">/{data.qualifyingSection.maxMarks}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionBreakdown;
