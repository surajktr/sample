import { useEffect, useState } from 'react';
import { FileText, ListChecks, Calculator, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const steps = [
  { icon: FileText, label: 'Fetching response sheet...' },
  { icon: ListChecks, label: 'Extracting questions & answers...' },
  { icon: Calculator, label: 'Calculating scores...' },
  { icon: CheckCircle2, label: 'Preparing analysis...' },
];

const AnalyzingLoader = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 95));
    }, 100);
    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing Response Sheet</h2>
      <p className="text-muted-foreground mb-6">Pleas wait while we process your data</p>
      <Progress value={progress} className="h-3 mb-8" />
      <div className="space-y-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= activeStep;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl px-5 py-4 transition-all duration-500 ${
                isActive
                  ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                  : 'bg-muted/50 border border-transparent'
              }`}
            >
              <div className={`p-2 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`font-medium ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyzingLoader;
