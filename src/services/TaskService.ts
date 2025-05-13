
import { supabase } from '@/integrations/supabase/client';
import { TaskRow } from '@/types/supabase-extensions';

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
      throw error;
    }
    
    return data || [];
  }
  
  static async createTask(taskData: Omit<TaskRow, 'id' | 'created_at' | 'user_id' | 'completed' | 'points'>) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
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
      throw error;
    }
    
    return data;
  }
  
  static async completeTask(id: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: true })
      .eq('id', id)
      .eq('user_id', userData.user.id) // Ensure user can only complete their own tasks
      .select()
      .single();
      
    if (error) {
      throw error;
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
      throw error;
    }
    
    return true;
  }
}
