
import { toast } from 'sonner';
import { Achievement } from '@/types/achievement';

export class NotificationService {
  static showAchievementUnlocked(achievement: Achievement) {
    toast('Achievement Unlocked!', {
      description: `${achievement.name}: ${achievement.description}`,
      duration: 5000,
      icon: achievement.icon || '🏆',
      className: 'achievement-toast',
      style: {
        background: 'linear-gradient(to right, rgba(236, 72, 153, 0.2), rgba(167, 139, 250, 0.2))',
        border: '1px solid rgba(236, 72, 153, 0.3)',
        color: 'white',
      },
    });
  }
  
  static showLevelUp(newLevel: number) {
    toast('Level Up!', {
      description: `You've reached level ${newLevel}!`,
      duration: 5000,
      icon: '🚀',
      className: 'level-up-toast',
      style: {
        background: 'linear-gradient(to right, rgba(167, 139, 250, 0.2), rgba(124, 58, 237, 0.2))',
        border: '1px solid rgba(167, 139, 250, 0.3)',
        color: 'white',
      },
    });
  }
  
  static showTaskComplete(pointsEarned: number) {
    toast('Task Completed!', {
      description: `You earned ${pointsEarned} points`,
      duration: 3000,
      icon: '✅',
    });
  }
  
  static showError(title: string, description: string) {
    toast(title, {
      description,
      duration: 5000,
      icon: '❌',
      style: {
        background: 'rgba(220, 38, 38, 0.2)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        color: 'white',
      },
    });
  }
}
