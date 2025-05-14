
import { useState } from 'react';
import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Check, Clock, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Achievement } from '@/types/achievement';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => Promise<{unlockedAchievements?: Achievement[]}>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onComplete, onEdit, onDelete }: TaskCardProps) {
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-emerald-600 text-white';
      case 'medium': return 'bg-blue-600 text-white';
      case 'high': return 'bg-amber-600 text-white';
      case 'urgent': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  
  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      const result = await onComplete(task.id);
      
      // Show task completion toast
      toast({
        title: 'Task completed!',
        description: 'You earned points for this task',
      });
      
      // Show achievement unlocks if any
      if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
        // Delay achievement notification slightly
        setTimeout(() => {
          result.unlockedAchievements?.forEach(achievement => {
            toast({
              title: '🎉 Achievement Unlocked!',
              description: `${achievement.name}: ${achievement.description}`,
              variant: 'success',
              duration: 5000,
            });
          });
        }, 500);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      });
    } finally {
      setIsCompleting(false);
    }
  };
  
  return (
    <Card 
      className={cn(
        "task-card bg-dark-card border-dark-border overflow-hidden",
        task.completed ? "opacity-70" : "",
        isCompleting ? "animate-task-complete" : ""
      )}
    >
      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium leading-none">{task.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
              {task.priority}
            </Badge>
            {task.dueDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-dark-accent border-dark-border">
            <DropdownMenuItem 
              onClick={() => onEdit(task)}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="cursor-pointer text-red-500"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-4 pt-3">
        <p className="text-sm text-muted-foreground">
          {task.description || 'No description provided'}
        </p>
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-dark-accent text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {!task.completed ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full border-neon-pink/30 text-neon-pink hover:text-white hover:bg-neon-pink/80 transition-colors"
          >
            <Check className="mr-2 h-4 w-4" />
            {isCompleting ? 'Completing...' : 'Mark Complete'}
          </Button>
        ) : (
          <div className="w-full flex items-center justify-center py-1 text-sm text-muted-foreground">
            <Check className="mr-1 h-4 w-4 text-emerald-500" />
            Completed
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
