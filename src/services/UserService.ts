
import { supabase } from '@/integrations/supabase/client';
import { POINTS } from '@/utils/scoreUtils';
import { calculateLevel } from '@/utils/scoreUtils';

interface TaskStatsUpdate {
  totalIncrement?: number;
  totalDecrement?: number;
  completedIncrement?: number;
  completedDecrement?: number;
}

export class UserService {
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  static async updateTaskStats(userId: string, updates: TaskStatsUpdate) {
    try {
      // Get current stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (statsError && statsError.code !== 'PGRST116') { // PGRST116 is "No rows found"
        throw statsError;
      }

      // Calculate new values
      const currentStats = stats || { 
        user_id: userId, 
        completed_tasks: 0, 
        total_tasks: 0,
        streaks: 0,
        last_active_date: new Date().toISOString().split('T')[0]
      };
      
      const newTotalTasks = (currentStats.total_tasks || 0) + 
        (updates.totalIncrement || 0) - 
        (updates.totalDecrement || 0);
      
      const newCompletedTasks = (currentStats.completed_tasks || 0) + 
        (updates.completedIncrement || 0) - 
        (updates.completedDecrement || 0);

      // Prepare update object
      const updateData = {
        user_id: userId,
        total_tasks: Math.max(0, newTotalTasks),
        completed_tasks: Math.max(0, newCompletedTasks),
        last_active_date: new Date().toISOString().split('T')[0]
      };

      // Perform upsert (insert or update)
      const { error: updateError } = await supabase
        .from('user_stats')
        .upsert(updateData, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;
      
      return {
        newTotalTasks,
        newCompletedTasks
      };
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Don't throw here as it's not critical
      return { newTotalTasks: 0, newCompletedTasks: 0 };
    }
  }

  static async recordTaskCompletion(userId: string) {
    try {
      // First, get current profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('score, level')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Calculate new score
      const currentScore = profile.score || 0;
      const pointsEarned = POINTS.TASK_COMPLETION;
      const newScore = currentScore + pointsEarned;
      const newLevel = calculateLevel(newScore);
      const leveledUp = newLevel > (profile.level || 1);

      // Update profile with new score and level
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          score: newScore,
          level: newLevel
        })
        .eq('id', userId);

      if (updateProfileError) throw updateProfileError;

      // Update user stats
      const statsUpdate = await this.updateTaskStats(userId, { 
        completedIncrement: 1 
      });
      
      return {
        pointsEarned,
        newScore,
        newLevel,
        leveledUp,
        newCompletedTasks: statsUpdate.newCompletedTasks
      };
    } catch (error) {
      console.error('Error recording task completion:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId: string, profileData: Partial<ProfileUpdate>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

// Define types for updates
interface ProfileUpdate {
  name: string;
  avatar_url?: string;
  email?: string;
}
