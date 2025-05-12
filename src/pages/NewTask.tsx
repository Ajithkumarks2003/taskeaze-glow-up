
import { AppLayout } from '@/components/common/AppLayout';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

export default function NewTask() {
  const { toast } = useToast();
  
  const handleSubmit = (taskData: Partial<Task>) => {
    // In a real app, this would save to backend
    console.log('Task created:', taskData);
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
