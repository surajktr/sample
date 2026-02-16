import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ScorecardData } from '@/lib/parseSSCHtml';

interface ResultsHeaderProps {
  data: ScorecardData;
  onBack: () => void;
}

const ResultsHeader = ({ data, onBack }: ResultsHeaderProps) => {
  const examName = data.examConfig?.name || 'Analysis Results';

  return (
    <div className="sticky top-0 z-10 bg-card border-b border-border px-4 sm:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> New Analysis
        </button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h2 className="font-bold text-foreground leading-tight">{examName}</h2>
          <p className="text-xs text-muted-foreground">{data.candidateInfo?.candidateName || ''}</p>
        </div>
      </div>
      <Button variant="default" size="sm" className="gap-2">
        <Download className="w-4 h-4" /> Download Response Sheet
      </Button>
    </div>
  );
};

export default ResultsHeader;
