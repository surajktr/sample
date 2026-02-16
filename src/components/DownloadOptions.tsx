import { useState } from 'react';
import { Download, FileText, BookOpen, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHtmlGenerator } from '@/hooks/useHtmlGenerator';
import type { ScorecardData } from '@/lib/parseSSCHtml';

interface DownloadOptionsProps {
  data: ScorecardData;
}

const DownloadOptions = ({ data }: DownloadOptionsProps) => {
  const [language, setLanguage] = useState<'hindi' | 'english' | 'bilingual'>('hindi');
  const { generateHtml, downloadHtml } = useHtmlGenerator();

  const handleDownload = (mode: 'response-sheet' | 'answer-key' | 'quiz') => {
    const html = generateHtml({ data, language, mode });
    
    const rollNumber = data.candidateInfo?.rollNumber || 'scorecard';
    const languageSuffix = language === 'bilingual' ? 'bilingual' : language;
    
    let filename = '';
    if (mode === 'response-sheet') {
      filename = `response-sheet-${rollNumber}-${languageSuffix}.html`;
    } else if (mode === 'answer-key') {
      filename = `answer-key-${rollNumber}-${languageSuffix}.html`;
    } else if (mode === 'quiz') {
      filename = `quiz-mode-${rollNumber}-${languageSuffix}.html`;
    }
    
    downloadHtml(html, filename);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Options
          </CardTitle>
          <CardDescription>
            Download your analysis in different formats with language preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Language Preference</label>
            <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="bilingual">Bilingual (Both)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Response Sheet
                </CardTitle>
                <CardDescription className="text-xs">
                  Complete analysis with candidate info, section breakdown, and all questions with answer indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleDownload('response-sheet')} 
                  className="w-full"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Answer Key
                </CardTitle>
                <CardDescription className="text-xs">
                  Clean question-answer format with correct answers highlighted. No user response data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleDownload('answer-key')} 
                  className="w-full"
                  size="sm"
                  variant="secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Quiz Mode
                </CardTitle>
                <CardDescription className="text-xs">
                  Interactive HTML file. Click options to reveal answers with instant feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleDownload('quiz')} 
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-semibold mb-1">Language Options:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Hindi:</strong> Shows only Hindi images (filename_HI.jpg)</li>
              <li><strong>English:</strong> Shows only English images (filename_EN.jpg)</li>
              <li><strong>Bilingual:</strong> Shows both Hindi and English images side by side</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadOptions;
