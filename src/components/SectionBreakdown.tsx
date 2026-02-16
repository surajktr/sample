import { BarChart3, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import type { ScorecardData } from '@/lib/parseSSCHtml';
import { useState } from 'react';

interface SectionBreakdownProps {
  data: ScorecardData;
}

const SectionBreakdown = ({ data }: SectionBreakdownProps) => {
  const [showBreakdown, setShowBreakdown] = useState(true);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-lg">Subject-wise Breakdown</h3>
        </div>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium text-xs"
        >
          {showBreakdown ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Hide
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Show
            </>
          )}
          {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showBreakdown && (
        <>
          <div className="grid grid-cols-8 gap-2 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            <div>Part</div>
            <div className="col-span-2">Subject</div>
            <div className="text-center">Correct</div>
            <div className="text-center text-red-500 dark:text-red-400">Wrong</div>
            <div className="text-center">Skipped</div>
            <div className="text-center">Bonus</div>
            <div className="text-right">Score</div>
          </div>

      {data.sections.map((sec) => (
            <div key={sec.part} className="grid grid-cols-8 gap-2 px-6 py-4 border-b border-border/50 items-center hover:bg-muted/20 transition-colors">
              <div>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {sec.part}
                </span>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-foreground text-sm">{sec.subject}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">+{sec.marksPerCorrect} / -{sec.negativePerWrong}</p>
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
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground font-bold">
                  {sec.skipped}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 text-amber-600 font-bold dark:bg-amber-950/30 dark:text-amber-400">
                  {sec.bonus}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-foreground">{sec.score.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground ml-0.5">/{sec.maxMarks}</span>
              </div>
            </div>
          ))}

      {data.qualifyingSection && (
            <div className="grid grid-cols-8 gap-2 px-6 py-4 border-b border-border/50 items-center bg-muted/10">
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
                <p className="text-[10px] text-muted-foreground mt-0.5">+{data.qualifyingSection.marksPerCorrect} / -{data.qualifyingSection.negativePerWrong}</p>
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
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground font-bold">
                  {data.qualifyingSection.skipped}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 text-amber-600 font-bold dark:bg-amber-950/30 dark:text-amber-400">
                  {data.qualifyingSection.bonus}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-foreground">{data.qualifyingSection.score.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground ml-0.5">/{data.qualifyingSection.maxMarks}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SectionBreakdown;
