
import { AppLayout } from '@/components/common/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskRow } from '@/types/supabase-extensions';
import { useToast } from '@/hooks/use-toast';
import { TaskService } from '@/services/TaskService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NewTask() {
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
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
      
      // Create the task using our service
      await TaskService.createTask(taskData);
      
      // Refresh profile to get updated stats
      await refreshProfile();
      
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
