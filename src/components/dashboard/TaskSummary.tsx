
import { Task } from '@/types/task';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from '../tasks/TaskCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaskSummaryProps {
  title: string;
  description: string;
  tasks: Task[];
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
  viewAllLink: string;
}

export function TaskSummary({
  title,
  description,
  tasks,
  onComplete,
  onEdit,
  onDelete,
  emptyMessage,
  viewAllLink,
}: TaskSummaryProps) {
  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.slice(0, 3).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            
            {tasks.length > 3 && (
              <div className="text-center mt-4">
                <Button asChild variant="ghost" className="text-neon-pink hover:text-neon-violet hover:bg-transparent">
                  <Link to={viewAllLink} className="flex items-center">
                    View all {tasks.length} tasks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
