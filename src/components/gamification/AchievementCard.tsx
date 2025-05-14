import { Achievement } from '@/types/achievement';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const progress = achievement.progress || 0;
  const progressPercentage = Math.min((progress / achievement.required_progress) * 100, 100);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      achievement.unlocked ? 'bg-dark-card border-neon-pink/50' : 'bg-dark-card/50 border-dark-border'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                {achievement.name}
              </h3>
              {!achievement.unlocked && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {achievement.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Progress: {progress}/{achievement.required_progress}
            </span>
            {achievement.unlocked ? (
              <span className="text-neon-pink">
                Unlocked {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {progressPercentage}% complete
              </span>
            )}
          </div>
        </div>
      </CardContent>
      {achievement.unlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/5 to-neon-violet/5" />
      )}
    </Card>
  );
}
