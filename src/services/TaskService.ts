
import { supabase } from '@/integrations/supabase/client';
import { TaskRow } from '@/types/supabase-extensions';
import { AchievementService } from './AchievementService';
import { UserService } from './UserService';

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
    await UserService.updateTaskStats(userData.user.id, { totalIncrement: 1 });
    
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
      
      // Update user stats and score, and get results
      const updateResult = await UserService.recordTaskCompletion(userData.user.id);

      // Check and update achievements
      const unlockedAchievements = await AchievementService.checkAndUpdateAchievements(
        userData.user.id,
        updateResult.newCompletedTasks,
        updateResult.newLevel
      );

      return {
        success: true,
        pointsEarned: updateResult.pointsEarned,
        newScore: updateResult.newScore,
        newLevel: updateResult.newLevel,
        leveledUp: updateResult.leveledUp,
        unlockedAchievements
      };

    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
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
      const wasCompleted = task.completed || false;
      await UserService.updateTaskStats(userData.user.id, {
        totalDecrement: 1,
        completedDecrement: wasCompleted ? 1 : 0
      });
    }
    
    return true;
  }
}
