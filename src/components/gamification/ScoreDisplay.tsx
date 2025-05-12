
import { useState, useEffect } from 'react';
import { CircularProgress } from './CircularProgress';
import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number;
  level: number;
  className?: string;
  compact?: boolean;
}

export function ScoreDisplay({ score, level, className, compact = false }: ScoreDisplayProps) {
  // Calculate progress to next level (just for display)
  const nextLevelThreshold = level * 100;
  const prevLevelThreshold = (level - 1) * 100;
  const currentProgress = score - prevLevelThreshold;
  const progressPercent = Math.min(100, (currentProgress / (nextLevelThreshold - prevLevelThreshold)) * 100);
  
  // Animation effect when score changes
  const [animatedScore, setAnimatedScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (score !== animatedScore) {
      setIsAnimating(true);
      
      // Animate score counting up
      const diff = score - animatedScore;
      const increment = Math.max(1, Math.ceil(diff / 10));
      const timer = setInterval(() => {
        setAnimatedScore(prev => {
          const newScore = prev + increment;
          if (newScore >= score) {
            clearInterval(timer);
            setIsAnimating(false);
            return score;
          }
          return newScore;
        });
      }, 50);
      
      return () => clearInterval(timer);
    }
  }, [score, animatedScore]);
  
  if (compact) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Badge className="bg-dark-accent border border-neon-pink/30 text-neon-pink px-2 py-0.5">
          <Award className="w-3 h-3 mr-1" />
          <span>Level {level}</span>
        </Badge>
        <Badge className="ml-2 bg-dark-accent border border-neon-violet/30 text-neon-violet px-2 py-0.5">
          {animatedScore} pts
        </Badge>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center", className)}>
      <CircularProgress 
        value={progressPercent} 
        size={compact ? 60 : 80} 
        strokeWidth={compact ? 4 : 6}
        className={isAnimating ? "animate-pulse" : ""}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">LEVEL</span>
          <span className="text-xl font-bold">{level}</span>
        </div>
      </CircularProgress>
      
      <div className="ml-4">
        <h3 className="text-sm text-muted-foreground">SCORE</h3>
        <p className={cn(
          "text-2xl font-bold",
          isAnimating ? "text-neon-pink" : "text-white"
        )}>
          {animatedScore}
        </p>
        <div className="text-xs text-muted-foreground">
          {currentProgress}/{nextLevelThreshold - prevLevelThreshold} to next level
        </div>
      </div>
    </div>
  );
}
