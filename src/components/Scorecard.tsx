import type { ScorecardData } from '@/lib/parseSSCHtml';
import { BarChart3 } from 'lucide-react';

interface ScorecardProps {
  data: ScorecardData;
}

const Scorecard = ({ data }: ScorecardProps) => {
  const nonQualifying = data.sections;
  const qualifying = data.qualifyingSection;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Section-wise Breakdown</h2>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {nonQualifying.map((section) => (
          <SectionCard key={section.part} section={section} />
        ))}

        {/* Total Card */}
        <div className="bg-primary/5 rounded-xl border-2 border-primary/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-foreground">Total</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <StatCell value={data.totalCorrect} label="Correct" color="correct" />
            <StatCell value={data.totalWrong} label="Wrong" color="wrong" />
            <StatCell value={data.totalSkipped} label="Skip" color="muted" />
            <div>
              <p className="text-lg font-bold text-foreground">{data.totalScore.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">/{data.totalMaxMarks}</p>
            </div>
          </div>
        </div>

        {qualifying && (
          <SectionCard section={qualifying} isQualifying />
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-left font-semibold">Part</th>
              <th className="px-4 py-3 text-left font-semibold">Subject</th>
              <th className="px-4 py-3 text-center font-semibold">Marks</th>
              <th className="px-4 py-3 text-center font-semibold">Correct</th>
              <th className="px-4 py-3 text-center font-semibold">Wrong</th>
              <th className="px-4 py-3 text-center font-semibold">Skipped</th>
              <th className="px-4 py-3 text-right font-semibold">Score</th>
            </tr>
          </thead>
          <tbody>
            {nonQualifying.map((section) => (
              <tr key={section.part} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {section.part}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{section.subject}</p>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-xs text-muted-foreground">+{section.marksPerCorrect} / -{section.negativePerWrong}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold" style={{ color: 'hsl(var(--correct))' }}>{section.correct}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold" style={{ color: 'hsl(var(--wrong))' }}>{section.wrong}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-muted-foreground">{section.skipped}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-lg font-bold text-foreground">{section.score.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">/{section.maxMarks}</span>
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="border-t-2 border-primary/20 bg-primary/5">
              <td className="px-4 py-4 font-bold text-foreground" colSpan={3}>Total</td>
              <td className="px-4 py-4 text-center">
                <span className="font-bold" style={{ color: 'hsl(var(--correct))' }}>{data.totalCorrect}</span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="font-bold" style={{ color: 'hsl(var(--wrong))' }}>{data.totalWrong}</span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="font-bold text-muted-foreground">{data.totalSkipped}</span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="text-xl font-bold text-foreground">{data.totalScore.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/{data.totalMaxMarks}</span>
              </td>
            </tr>

            {/* Qualifying */}
            {qualifying && (
              <tr className="border-t border-border bg-muted/20">
                <td className="px-4 py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {qualifying.part}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-medium text-foreground">{qualifying.subject}</span>
                  <span className="ml-2 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Qualifying</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-xs text-muted-foreground">+{qualifying.marksPerCorrect} / -{qualifying.negativePerWrong}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold" style={{ color: 'hsl(var(--correct))' }}>{qualifying.correct}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold" style={{ color: 'hsl(var(--wrong))' }}>{qualifying.wrong}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-muted-foreground">{qualifying.skipped}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-lg font-bold text-foreground">{qualifying.score.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">/{qualifying.maxMarks}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function SectionCard({ section, isQualifying = false }: { section: { part: string; subject: string; correct: number; wrong: number; skipped: number; score: number; maxMarks: number; marksPerCorrect: number; negativePerWrong: number }; isQualifying?: boolean }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs">
            {section.part}
          </span>
          <span className="font-medium text-foreground text-sm">{section.subject}</span>
        </div>
        {isQualifying && (
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Qualifying</span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 text-center mb-2">
        <StatCell value={section.correct} label="Correct" color="correct" />
        <StatCell value={section.wrong} label="Wrong" color="wrong" />
        <StatCell value={section.skipped} label="Skip" color="muted" />
        <div>
          <p className="text-lg font-bold text-foreground">{section.score.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">/{section.maxMarks}</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">+{section.marksPerCorrect} / -{section.negativePerWrong}</p>
    </div>
  );
}

function StatCell({ value, label, color }: { value: number; label: string; color: string }) {
  const colorStyle = color === 'muted' ? {} : { color: `hsl(var(--${color}))` };
  return (
    <div>
      <p className={`text-lg font-bold ${color === 'muted' ? 'text-muted-foreground' : ''}`} style={colorStyle}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default Scorecard;
