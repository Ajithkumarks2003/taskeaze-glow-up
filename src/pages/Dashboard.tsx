
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/common/AppLayout';
import { Logo } from '@/components/common/Logo';
import { TaskSummary } from '@/components/dashboard/TaskSummary';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ScoreDisplay } from '@/components/gamification/ScoreDisplay';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { useToast } from '@/hooks/use-toast';
import { TaskRow, mapTaskRowToTask } from '@/types/supabase-extensions';
import { Task } from '@/types/task';
import { Achievement } from '@/types/achievement';
import { CheckSquare, Clock, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const [todayTasks, setTodayTasks] = useState<TaskRow[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskRow[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskRow[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    completedTasks: 0,
    totalTasks: 0
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchUserStats();
      fetchAchievements();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Process tasks into categories
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      const today = now.toISOString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999); // End of tomorrow
      
      const todayTasksList = [];
      const upcomingTasksList = [];
      const completedTasksList = [];

      for (const task of data || []) {
        if (task.completed) {
          completedTasksList.push(task);
        } else if (task.due_date) {
          const dueDate = new Date(task.due_date);
          if (dueDate <= tomorrow) {
            todayTasksList.push(task);
          } else {
            upcomingTasksList.push(task);
          }
        } else {
          // Tasks without due dates go to today's list
          todayTasksList.push(task);
        }
      }

      setTodayTasks(todayTasksList);
      setUpcomingTasks(upcomingTasksList);
      setCompletedTasks(completedTasksList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUserStats({
          completedTasks: data.completed_tasks,
          totalTasks: data.total_tasks
        });
      } else {
        // Create initial stats for user
        const { error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            completed_tasks: 0,
            total_tasks: 0,
            last_active_date: new Date().toISOString().split('T')[0]
          });
          
        if (insertError) console.error('Error creating user stats:', insertError);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          unlocked,
          unlocked_at,
          progress,
          achievements (
            id,
            name,
            description,
            icon,
            required_progress
          )
        `)
        .eq('user_id', user.id)
        .eq('unlocked', true)
        .order('unlocked_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;

      const achievements = (data || []).map(item => ({
        id: item.achievements.id,
        name: item.achievements.name,
        description: item.achievements.description,
        icon: item.achievements.icon || '',
        progress: item.progress,
        unlocked: item.unlocked,
        unlockedAt: item.unlocked_at,
        required_progress: item.achievements.required_progress // Include required_progress
      }));

      setRecentAchievements(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleCompleteTask = async (id: string) => {
    try {
      // Find and update the task in the appropriate list
      const updatedTodayTasks = todayTasks.filter(task => task.id !== id);
      const updatedUpcomingTasks = upcomingTasks.filter(task => task.id !== id);
      
      // Find the completed task
      const taskToComplete = [...todayTasks, ...upcomingTasks].find(task => task.id === id);
      
      if (taskToComplete) {
        // Mark as completed and add to completed tasks
        const completedTask = { ...taskToComplete, completed: true };
        setCompletedTasks([completedTask, ...completedTasks]);
        
        // Update in database
        await supabase
          .from('tasks')
          .update({ completed: true })
          .eq('id', id)
          .eq('user_id', user?.id);
          
        // Update user stats
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();
          
        if (statsData) {
          await supabase
            .from('user_stats')
            .update({ 
              completed_tasks: statsData.completed_tasks + 1,
              last_active_date: new Date().toISOString().split('T')[0]
            })
            .eq('user_id', user?.id);
        }
      }
      
      setTodayTasks(updatedTodayTasks);
      setUpcomingTasks(updatedUpcomingTasks);
      
      // Update local stats
      setUserStats(prev => ({
        ...prev,
        completedTasks: prev.completedTasks + 1
      }));
      
      toast({
        title: 'Task completed!',
        description: 'You earned points for this task',
      });
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete task: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditTask = (task: TaskRow) => {
    toast({
      title: "Edit task",
      description: `Editing task: ${task.title}`,
    });
    // In a real app, navigate to edit page
  };

  const handleDeleteTask = async (id: string) => {
    try {
      // Remove from all lists
      setTodayTasks(todayTasks.filter(task => task.id !== id));
      setUpcomingTasks(upcomingTasks.filter(task => task.id !== id));
      setCompletedTasks(completedTasks.filter(task => task.id !== id));
      
      // Remove from database
      await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-5xl mx-auto py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo className="hidden md:flex" />
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {profile?.name?.split(' ')[0] || 'User'}</h1>
              <p className="text-muted-foreground">Here's your task overview for today.</p>
            </div>
          </div>
          <ScoreDisplay score={profile?.score || 0} level={profile?.level || 1} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Today's Tasks"
            value={todayTasks.length}
            description="Tasks due today"
            icon={<Clock className="h-4 w-4 text-neon-pink" />}
          />
          <StatsCard
            title="Completed Tasks"
            value={userStats.completedTasks}
            description="Total tasks completed"
            icon={<CheckSquare className="h-4 w-4 text-neon-violet" />}
          />
          <StatsCard
            title="Achievements"
            value={recentAchievements.length}
            description="Unlocked achievements"
            icon={<Award className="h-4 w-4 text-neon-pink" />}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TaskSummary
            title="Today's Tasks"
            description="Tasks due today"
            tasks={todayTasks.map(mapTaskRowToTask)}
            onComplete={handleCompleteTask}
            onEdit={task => handleEditTask(todayTasks.find(t => t.id === task.id)!)}
            onDelete={handleDeleteTask}
            emptyMessage="No tasks due today"
            viewAllLink="/tasks"
          />
          
          <TaskSummary
            title="Upcoming Tasks"
            description="Tasks coming up"
            tasks={upcomingTasks.map(mapTaskRowToTask)}
            onComplete={handleCompleteTask}
            onEdit={task => handleEditTask(upcomingTasks.find(t => t.id === task.id)!)}
            onDelete={handleDeleteTask}
            emptyMessage="No upcoming tasks"
            viewAllLink="/tasks"
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.length > 0 ? (
              recentAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8 bg-dark-card rounded-lg border border-dark-border">
                <p className="text-muted-foreground">No achievements unlocked yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
