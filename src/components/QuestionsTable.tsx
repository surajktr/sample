import { useState } from 'react';
import type { QuestionResult, ScorecardData } from '@/lib/parseSSCHtml';
import { getQuestionsForSection } from '@/lib/parseSSCHtml';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import QuestionCard from './QuestionCard';

interface QuestionsTableProps {
  data: ScorecardData;
}

const QuestionsTable = ({ data }: QuestionsTableProps) => {
  const [language, setLanguage] = useState<'hindi' | 'english' | 'bilingual'>('hindi');
  const allSections = [...data.sections, ...(data.qualifyingSection ? [data.qualifyingSection] : [])];

  const cycleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'hindi') return 'english';
      if (prev === 'english') return 'bilingual';
      return 'hindi';
    });
  };

  const languageLabel = language === 'hindi' ? 'हिंदी' : language === 'english' ? 'English' : 'Both';

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Question-wise Details</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={cycleLanguage}
          className="gap-2"
        >
          <Languages className="w-4 h-4" />
          {languageLabel}
        </Button>
      </div>

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
                  <QuestionCard key={q.questionNumber} question={q} language={language} />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default QuestionsTable;
