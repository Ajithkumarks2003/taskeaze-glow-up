
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TaskService } from '@/services/TaskService';
import { TaskRow } from '@/types/supabase-extensions';
import { Task } from '@/types/task';

interface TaskFormProps {
  existingTask?: TaskRow;
  onSubmit?: (task: Omit<TaskRow, 'id' | 'created_at' | 'user_id' | 'completed' | 'points'>) => void;
}

type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export function TaskForm({ existingTask, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(
    (existingTask?.priority as TaskPriority) || 'Medium'
  );
  const [dueDate, setDueDate] = useState(
    existingTask?.due_date ? new Date(existingTask.due_date).toISOString().split('T')[0] : ''
  );
  const [tags, setTags] = useState(existingTask?.tags?.join(', ') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Process tags
      const processedTags = tags
        ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];
        
      const taskData = {
        title,
        description,
        priority: priority as TaskPriority,
        tags: processedTags,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      };
      
      if (onSubmit) {
        onSubmit(taskData);
      } else if (existingTask) {
        const savedTask = await TaskService.updateTask(existingTask.id, taskData);
        
        toast({
          title: 'Task updated',
          description: 'Your task has been updated successfully'
        });
        
        navigate('/tasks');
      } else {
        const savedTask = await TaskService.createTask(taskData);
        
        toast({
          title: 'Task created',
          description: 'Your new task has been created'
        });
        
        navigate('/tasks');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: existingTask 
          ? 'Failed to update task: ' + error.message 
          : 'Failed to create task: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePriorityChange = (value: string) => {
    setPriority(value as TaskPriority);
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader>
        <CardTitle>{existingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              className="bg-dark-accent text-foreground border-dark-border"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="bg-dark-accent text-foreground border-dark-border resize-none min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={priority} 
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="bg-dark-accent border-dark-border">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-dark-accent border-dark-border">
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-dark-accent text-foreground border-dark-border"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
              className="bg-dark-accent text-foreground border-dark-border"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-dark-border hover:bg-dark-hover"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !title}
            className="bg-gradient-to-r from-neon-pink to-neon-violet"
          >
            {isSubmitting 
              ? (existingTask ? 'Updating...' : 'Creating...') 
              : (existingTask ? 'Update Task' : 'Create Task')
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
