
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/common/AppLayout';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskRow, mapTaskRowToTask } from '@/types/supabase-extensions';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { TaskService } from '@/services/TaskService';
import { useAuth } from '@/contexts/AuthContext';
import { ScoreDisplay } from '@/components/gamification/ScoreDisplay';

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskRow[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  useEffect(() => {
    // Load user tasks from Supabase
    if (user) {
      fetchTasks();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const fetchTasks = async () => {
    try {
      const userTasks = await TaskService.getUserTasks();
      setTasks(userTasks);
      setFilteredTasks(userTasks);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error loading tasks",
        description: error.message || "Failed to load your tasks",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Apply filters whenever tasks, tab, search query or priority filter changes
    let result = [...tasks];
    
    // Apply tab filter
    if (activeTab === 'completed') {
      result = result.filter(task => task.completed);
    } else if (activeTab === 'active') {
      result = result.filter(task => !task.completed);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          (task.description || '').toLowerCase().includes(query) ||
          (task.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(
        task => task.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }
    
    setFilteredTasks(result);
  }, [tasks, activeTab, searchQuery, priorityFilter]);
  
  const handleCompleteTask = async (id: string) => {
    try {
      const result = await TaskService.completeTask(id);
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: true } : task
      ));
      
      return {
        unlockedAchievements: result.unlockedAchievements
      };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to complete task: " + error.message,
        variant: "destructive"
      });
      return { unlockedAchievements: [] };
    }
  };
  
  const handleEditTask = (task: Task) => {
    // In a real app, navigate to edit page
    toast({
      title: "Edit task",
      description: `Editing task: ${task.title}`,
    });
  };
  
  const handleDeleteTask = async (id: string) => {
    try {
      await TaskService.deleteTask(id);
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== id));
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete task: " + error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage and organize your tasks</p>
          </div>
          
          <div className="flex items-center gap-4">
            {profile && (
              <ScoreDisplay 
                score={profile.score} 
                level={profile.level} 
                compact={true} 
              />
            )}
            
            <Button asChild className="bg-gradient-to-r from-neon-pink to-neon-violet hover:shadow-lg hover:shadow-neon-pink/20">
              <Link to="/new-task" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-dark-accent border-dark-border"
            />
          </div>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px] bg-dark-accent border-dark-border">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent className="bg-dark-accent border-dark-border">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-dark-accent">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading your tasks...</p>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((taskRow) => {
                  const task = mapTaskRowToTask(taskRow);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-dark-card rounded-lg border border-dark-border">
                {searchQuery || priorityFilter !== 'all' ? (
                  <div className="text-muted-foreground">
                    <p>No tasks match your filters</p>
                    <Button 
                      variant="link" 
                      className="text-neon-pink"
                      onClick={() => {
                        setSearchQuery('');
                        setPriorityFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <p>No tasks found</p>
                    <Button asChild variant="link" className="text-neon-pink">
                      <Link to="/new-task">Create your first task</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}
