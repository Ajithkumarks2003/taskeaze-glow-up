
import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon?: ReactNode;
  className?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
}

export function StatsCard({ 
  title, 
  value, 
  description,
  icon,
  className,
  trend
}: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up': return 'text-emerald-500';
      case 'down': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };
  
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };
  
  return (
    <Card className={cn("bg-dark-card border-dark-border overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>
          </div>
          
          {icon && (
            <div className="h-10 w-10 rounded-full bg-dark-accent flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center">
          <p className="text-sm text-muted-foreground flex-1">{description}</p>
          
          {trend && (
            <div className={cn("text-xs font-medium flex items-center", getTrendColor())}>
              <span className="mr-1">{getTrendIcon()}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
