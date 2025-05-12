
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Achievement } from '@/types/achievement';
import { Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { name, description, unlocked, icon, progress } = achievement;
  
  return (
    <Card className={cn(
      "bg-dark-card border-dark-border transition-all overflow-hidden",
      unlocked 
        ? "neon-border" 
        : "opacity-70 hover:opacity-80",
    )}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            {name}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-dark-accent flex items-center justify-center">
            {unlocked ? (
              <Award className="h-4 w-4 text-neon-pink" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {progress !== undefined && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1 flex justify-between">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-dark-accent rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  unlocked 
                    ? "bg-gradient-to-r from-neon-pink to-neon-violet" 
                    : "bg-muted-foreground"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
