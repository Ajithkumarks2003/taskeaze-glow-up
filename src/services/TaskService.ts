
import { supabase } from '@/integrations/supabase/client';
import { TaskRow, mapTaskRowToTask } from '@/types/supabase-extensions';
import { Task } from '@/types/task';
import { POINTS, calculateLevel } from '@/utils/scoreUtils';

export class TaskService {
  static async getUserTasks() {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
    
    return data || [];
  }
  
  static async createTask(taskData: Omit<TaskRow, 'id' | 'created_at' | 'user_id' | 'completed' | 'points'>) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Ensure priority is one of the valid options
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    const priority = validPriorities.includes(taskData.priority as string) 
      ? taskData.priority 
      : 'Medium';
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        priority,
        user_id: userData.user.id,
        completed: false,
        points: 10 // Default points for new task
      })
      .select()
      .single();
      
    if (error) {
      console.error('Create task error:', error);
      throw error;
    }
    
    // Update user stats
    try {
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userData.user.id)
        .maybeSingle();
        
      if (!statsError && stats) {
        await supabase
          .from('user_stats')
          .update({
            total_tasks: (stats.total_tasks || 0) + 1,
            last_active_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', userData.user.id);
      } else if (!stats) {
        // Create initial stats for user
        await supabase
          .from('user_stats')
          .insert({
            user_id: userData.user.id,
            completed_tasks: 0,
            total_tasks: 1,
            last_active_date: new Date().toISOString().split('T')[0]
          });
      }
    } catch (statsError) {
      console.error('Error updating stats:', statsError);
      // Don't throw here as the task was created successfully
    }
    
    return data;
  }
  
  static async updateTask(id: string, taskData: Partial<TaskRow>) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .eq('user_id', userData.user.id) // Ensure user can only update their own tasks
      .select()
      .single();
      
    if (error) {
      console.error('Update task error:', error);
      throw error;
    }
    
    return data;
  }
  
  static async completeTask(taskId: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    try {
      // First, get current profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('score, level')
        .eq('id', userData.user.id)
        .single();

      if (profileError) throw profileError;

      // Calculate new score
      const currentScore = profile.score || 0;
      const pointsEarned = POINTS.TASK_COMPLETION;
      const newScore = currentScore + pointsEarned;
      const newLevel = calculateLevel(newScore);
      const leveledUp = newLevel > (profile.level || 1);

      // Update task as completed
      const { error: taskError } = await supabase
        .from('tasks')
        .update({ 
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', userData.user.id);

      if (taskError) throw taskError;

      // Update profile with new score and level
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          score: newScore,
          level: newLevel
        })
        .eq('id', userData.user.id);

      if (updateProfileError) throw updateProfileError;

      // Update user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('completed_tasks')
        .eq('user_id', userData.user.id)
        .single();

      if (!statsError) {
        const newCompletedTasks = (stats?.completed_tasks || 0) + 1;
        
        await supabase
          .from('user_stats')
          .update({
            completed_tasks: newCompletedTasks,
            last_active_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', userData.user.id);
      }

      // Check and update achievements
      const unlockedAchievements = await this.checkAndUpdateAchievements(
        userData.user.id,
        (stats?.completed_tasks || 0) + 1,
        newLevel
      );

      return {
        success: true,
        pointsEarned,
        newScore,
        newLevel,
        leveledUp,
        unlockedAchievements
      };

    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }
  
  static async checkAndUpdateAchievements(userId: string, completedTasks: number, level: number) {
    const unlockedAchievements = [];
    
    try {
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');
  
      if (achievementsError) throw achievementsError;
  
      for (const achievement of achievements || []) {
        let progress = 0;
        let isUnlocked = false;
  
        // Check if achievement ID starts with specific prefixes to determine type
        if (achievement.id.startsWith('task-master-') || achievement.id === 'first-task') {
          // Task-based achievement
          progress = Math.min(completedTasks, achievement.required_progress);
          isUnlocked = completedTasks >= achievement.required_progress;
        } else if (achievement.id.startsWith('level-')) {
          // Level-based achievement
          progress = Math.min(level, achievement.required_progress);
          isUnlocked = level >= achievement.required_progress;
        }
  
        // First get current user achievement
        const { data: existingAchievement, error: existingError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .maybeSingle();
  
        // Only update if achievement doesn't exist or is not unlocked yet
        if (!existingAchievement || !existingAchievement.unlocked) {
          // Update achievement progress
          const { data: updatedAchievement, error: updateError } = await supabase
            .from('user_achievements')
            .upsert({
              user_id: userId,
              achievement_id: achievement.id,
              progress: progress,
              unlocked: isUnlocked,
              unlocked_at: isUnlocked ? new Date().toISOString() : null
            }, {
              onConflict: 'user_id,achievement_id'
            })
            .select()
            .maybeSingle();
  
          if (updateError) throw updateError;
  
          // If newly unlocked (not previously unlocked), award bonus points
          if (isUnlocked && (!existingAchievement || !existingAchievement.unlocked)) {
            // Add to unlocked achievements list to notify user
            unlockedAchievements.push({
              ...achievement,
              progress,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            });
            
            // Award bonus points
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('score, level')
              .eq('id', userId)
              .single();
  
            if (profileError) throw profileError;
  
            const newScore = (profile?.score || 0) + POINTS.ACHIEVEMENT_UNLOCK;
            const newLevel = calculateLevel(newScore);
  
            const { error: updateScoreError } = await supabase
              .from('profiles')
              .update({
                score: newScore,
                level: newLevel
              })
              .eq('id', userId);
  
            if (updateScoreError) throw updateScoreError;
          }
        }
      }
      
      return unlockedAchievements;
      
    } catch (error) {
      console.error('Error updating achievements:', error);
      return [];
    }
  }
  
  static async deleteTask(id: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // First check if the task was completed
    const { data: task, error: getError } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .maybeSingle();
      
    if (getError) {
      console.error('Get task error:', getError);
      throw getError;
    }
    
    // Delete the task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id);
      
    if (error) {
      console.error('Delete task error:', error);
      throw error;
    }
    
    // Update user stats if the task exists
    if (task) {
      try {
        const { data: stats, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userData.user.id)
          .maybeSingle();
          
        if (!statsError && stats) {
          const completedTasks = task.completed ? Math.max(0, stats.completed_tasks - 1) : stats.completed_tasks;
          const totalTasks = Math.max(0, stats.total_tasks - 1);
          
          await supabase
            .from('user_stats')
            .update({
              total_tasks: totalTasks,
              completed_tasks: completedTasks,
              last_active_date: new Date().toISOString().split('T')[0]
            })
            .eq('user_id', userData.user.id);
        }
      } catch (statsError) {
        console.error('Error updating stats:', statsError);
      }
    }
    
    return true;
  }
}
