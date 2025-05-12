
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon?: string;
  progress?: number;
  requiredProgress?: number;
}
