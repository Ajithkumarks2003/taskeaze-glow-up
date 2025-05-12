
import { AppLayout } from '@/components/common/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskRow } from '@/types/supabase-extensions';
import { useToast } from '@/hooks/use-toast';
import { TaskService } from '@/services/TaskService';

export default function NewTask() {
  const { toast } = useToast();
  
  const handleSubmit = async (task: TaskRow) => {
    try {
      console.log('Task created:', task);
      toast({
        title: "Task created",
        description: "Your task has been created successfully."
      });
    } catch (error: any) {
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
