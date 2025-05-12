
import { supabase } from '@/integrations/supabase/client';
import { TaskRow } from '@/types/supabase-extensions';

export class TaskService {
  static async getUserTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data;
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
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  static async updateTask(id: string, taskData: Partial<TaskRow>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  static async completeTask(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: true })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  static async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    return true;
  }
}
