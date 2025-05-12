
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  score: number;
  level: number;
  joinedAt: string;
  stats: {
    completedTasks: number;
    totalTasks: number;
    streaks: number;
  };
}
