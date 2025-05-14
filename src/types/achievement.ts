export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  required_progress: number;
  progress?: number;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  unlocked: boolean;
  unlocked_at?: string;
}
