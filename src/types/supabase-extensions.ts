
import type { Database } from '@/integrations/supabase/types';
import { Task as AppTask } from '@/types/task';

// Type aliases from Supabase database
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type AchievementRow = Database['public']['Tables']['achievements']['Row'];
export type UserAchievementRow = Database['public']['Tables']['user_achievements']['Row'];
export type UserStatsRow = Database['public']['Tables']['user_stats']['Row'];

// Extended types that can be used in components
export interface Profile extends ProfileRow {
  avatar_id?: string; // Add avatar_id field to support the current implementation
}

// Converting from TaskRow (database) to Task (application)
export function mapTaskRowToTask(taskRow: TaskRow): AppTask {
  return {
    id: taskRow.id,
    title: taskRow.title,
    description: taskRow.description || undefined,
    completed: taskRow.completed,
    createdAt: taskRow.created_at,
    dueDate: taskRow.due_date || undefined,
    priority: taskRow.priority as AppTask['priority'],
    tags: taskRow.tags || [],
    points: taskRow.points,
    userId: taskRow.user_id
  };
}

export interface Achievement extends AchievementRow {
  progress?: number;
  unlocked?: boolean;
  unlockedAt?: string;
  required_progress: number; // Make sure required_progress is included and required
  icon: string | null;       // Make sure icon is included
}

export interface UserAchievement extends UserAchievementRow {
  achievement?: Achievement;
}
