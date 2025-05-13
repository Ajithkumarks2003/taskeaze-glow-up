
import { supabase } from '@/integrations/supabase/client';
import { TaskRow, mapTaskRowToTask } from '@/types/supabase-extensions';
import { Task } from '@/types/task';

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
  
  static async completeTask(id: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Get the task first to calculate user stats update
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .maybeSingle();
      
    if (taskError) {
      console.error('Get task error:', taskError);
      throw taskError;
    }
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Update the task to completed
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: true })
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .select()
      .single();
      
    if (error) {
      console.error('Complete task error:', error);
      throw error;
    }
    
    // Update user stats
    if (!task.completed) { // Only update stats if the task wasn't already completed
      try {
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userData.user.id)
          .maybeSingle();
        
        if (statsError && statsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Get stats error:', statsError);
        }
        
        // If stats exist, update them; otherwise, create new stats
        if (statsData) {
          await supabase
            .from('user_stats')
            .update({
              completed_tasks: statsData.completed_tasks + 1,
              last_active_date: new Date().toISOString().split('T')[0]
            })
            .eq('user_id', userData.user.id);
        } else {
          await supabase
            .from('user_stats')
            .insert({
              user_id: userData.user.id,
              completed_tasks: 1,
              total_tasks: 1,
              last_active_date: new Date().toISOString().split('T')[0]
            });
        }
      } catch (statsUpdateError) {
        console.error('Update stats error:', statsUpdateError);
        // Don't throw here, as we still want to return the completed task
      }
    }
    
    return data;
  }
  
  static async deleteTask(id: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user.id); // Ensure user can only delete their own tasks
      
    if (error) {
      console.error('Delete task error:', error);
      throw error;
    }
    
    return true;
  }
}
