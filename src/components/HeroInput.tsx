import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, BarChart3, Download, Search, Globe } from 'lucide-react';
import { EXAM_CATEGORIES, getExamsByCategory } from '@/lib/examConfig';

interface HeroInputProps {
  onAnalyze: (url: string, examType: string, language: string) => void;
  loading: boolean;
}

const HeroInput = ({ onAnalyze, loading }: HeroInputProps) => {
  const [category, setCategory] = useState('SSC');
  const [examType, setExamType] = useState('SSC_CGL_MAINS');
  const [language, setLanguage] = useState('hindi');
  const [url, setUrl] = useState('');

  const exams = getExamsByCategory(category);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    const newExams = getExamsByCategory(val);
    if (newExams.length > 0) setExamType(newExams[0].id);
  };

  const handleSubmit = () => {
    if (url.trim()) onAnalyze(url.trim(), examType, language);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-muted/40 to-background">
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Analyze Your{' '}
          <span className="text-primary">Response Sheet</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Get detailed score analysis, section-wise breakdown, and question-level insights
          from your exam response sheet in seconds.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="bg-card h-12">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {EXAM_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span>{c.emoji}</span> {c.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger className="bg-card h-12">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-card h-12">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hindi">
                <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Hindi</span>
              </SelectItem>
              <SelectItem value="english">
                <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> English</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 items-center bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            placeholder="Paste your response sheet URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="border-0 shadow-none focus-visible:ring-0 h-12 text-base"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !url.trim()}
            size="lg"
            className="shrink-0 rounded-xl px-8"
          >
            Analyze
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14 max-w-3xl w-full">
        {[
          { icon: FileText, title: 'Extract Data', desc: 'Automatically extract all question and answer data from your response sheet.' },
          { icon: BarChart3, title: 'Detailed Analytics', desc: 'Get section-wise breakdown with accuracy and attempt rate analysis.' },
          { icon: Download, title: 'Download PDF', desc: 'Generate a comprehensive PDF report with all sections and questions.' },
        ].map((f, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
              <f.icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroInput;
