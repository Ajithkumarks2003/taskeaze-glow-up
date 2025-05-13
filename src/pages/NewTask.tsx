
import { AppLayout } from '@/components/common/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskRow } from '@/types/supabase-extensions';
import { useToast } from '@/hooks/use-toast';
import { TaskService } from '@/services/TaskService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NewTask() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (taskData: Omit<TaskRow, 'id' | 'created_at' | 'user_id' | 'completed' | 'points'>) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create tasks.",
          variant: "destructive",
        });
        return;
      }
      
      // This will now create the task and associate it with the current user
      await TaskService.createTask(taskData);
      
      // Update user stats to increment total_tasks
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!statsError) {
        if (statsData) {
          // Update existing stats
          await supabase
            .from('user_stats')
            .update({
              total_tasks: statsData.total_tasks + 1,
              last_active_date: new Date().toISOString().split('T')[0]
            })
            .eq('user_id', user.id);
        } else {
          // Create new stats
          await supabase
            .from('user_stats')
            .insert({
              user_id: user.id,
              total_tasks: 1,
              completed_tasks: 0,
              last_active_date: new Date().toISOString().split('T')[0]
            });
        }
      }
      
      toast({
        title: "Task created",
        description: "Your task has been created successfully."
      });
      navigate('/tasks');
    } catch (error: any) {
      console.error("Task creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create task: " + error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create New Task</h1>
          <p className="text-muted-foreground">Add a new task to your list</p>
        </div>
        
        <TaskForm onSubmit={handleSubmit} />
      </div>
    </AppLayout>
  );
}

// Add missing supabase import
import { supabase } from '@/integrations/supabase/client';
