import { HardDrive } from 'lucide-react';
import { DiskUsage as DiskUsageType } from '@/types/model';
import { Progress } from '@/components/ui/progress';

interface DiskUsageProps {
  data: DiskUsageType;
}

export const DiskUsage = ({ data }: DiskUsageProps) => {
  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-primary';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  return (
    <div className="bg-card rounded-lg p-6 card-glow animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <HardDrive className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Disk Usage</h3>
          <p className="text-xs text-muted-foreground/70 font-mono">/data/models</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-gradient">{data.used}</span>
          <span className="text-sm text-muted-foreground">of {data.total}</span>
        </div>

        <div className="relative">
          <Progress 
            value={data.percentage} 
            className="h-2 bg-secondary"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor(data.percentage)}`}
            style={{ width: `${data.percentage}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground text-right">
          {data.percentage.toFixed(1)}% used
        </p>
      </div>
    </div>
  );
};
