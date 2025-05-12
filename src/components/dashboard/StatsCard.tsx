
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("bg-dark-card border-dark-border overflow-hidden", className)}>
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-dark-accent flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-2xl font-bold">{value}</div>
        
        {(description || trend) && (
          <div className="flex items-center mt-2">
            {trend && (
              <div className={cn(
                "text-xs font-medium mr-2",
                trend.positive ? "text-emerald-500" : "text-red-500"
              )}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
