
import type { Database } from '@/integrations/supabase/types';

// Type aliases from Supabase database
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type AchievementRow = Database['public']['Tables']['achievements']['Row'];
export type UserAchievementRow = Database['public']['Tables']['user_achievements']['Row'];
export type UserStatsRow = Database['public']['Tables']['user_stats']['Row'];

// Extended types that can be used in components
export interface Profile extends ProfileRow {
  // Add any extended properties here
}

export interface Task extends TaskRow {
  // Add any extended properties here
}

export interface Achievement extends AchievementRow {
  // Add any extended properties here
}
