
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/common/AppLayout';
import { Logo } from '@/components/common/Logo';
import { TaskSummary } from '@/components/dashboard/TaskSummary';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ScoreDisplay } from '@/components/gamification/ScoreDisplay';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { Achievement } from '@/types/achievement';
import { getTodayTasks, getUpcomingTasks, getCompletedTasks, mockUser, mockAchievements } from '@/services/mockData';
import { CheckSquare, Clock, Award } from 'lucide-react';

export default function Dashboard() {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load mock data
    setTodayTasks(getTodayTasks());
    setUpcomingTasks(getUpcomingTasks());
    setCompletedTasks(getCompletedTasks());
    
    // Get recent achievements (unlocked ones)
    const recent = mockAchievements
      .filter(a => a.unlocked)
      .sort((a, b) => {
        if (!a.unlockedAt || !b.unlockedAt) return 0;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      })
      .slice(0, 3);
    
    setRecentAchievements(recent);
  }, []);

  const handleCompleteTask = (id: string) => {
    // Find and update the task in the appropriate list
    const updatedTodayTasks = todayTasks.filter(task => task.id !== id);
    const updatedUpcomingTasks = upcomingTasks.filter(task => task.id !== id);
    
    // Find the completed task
    const completedTask = [...todayTasks, ...upcomingTasks].find(task => task.id === id);
    
    if (completedTask) {
      // Mark as completed and add to completed tasks
      completedTask.completed = true;
      setCompletedTasks([completedTask, ...completedTasks]);
    }
    
    setTodayTasks(updatedTodayTasks);
    setUpcomingTasks(updatedUpcomingTasks);
  };

  const handleEditTask = (task: Task) => {
    toast({
      title: "Edit task",
      description: `Editing task: ${task.title}`,
    });
    // In a real app, navigate to edit page
  };

  const handleDeleteTask = (id: string) => {
    // Remove from all lists
    setTodayTasks(todayTasks.filter(task => task.id !== id));
    setUpcomingTasks(upcomingTasks.filter(task => task.id !== id));
    setCompletedTasks(completedTasks.filter(task => task.id !== id));
    
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully",
    });
  };

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo className="hidden md:flex" />
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {mockUser.name.split(' ')[0]}</h1>
              <p className="text-muted-foreground">Here's your task overview for today.</p>
            </div>
          </div>
          <ScoreDisplay score={mockUser.score} level={mockUser.level} />
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
            value={completedTasks.length}
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
            tasks={todayTasks}
            onComplete={handleCompleteTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            emptyMessage="No tasks due today"
            viewAllLink="/tasks"
          />
          
          <TaskSummary
            title="Upcoming Tasks"
            description="Tasks coming up"
            tasks={upcomingTasks}
            onComplete={handleCompleteTask}
            onEdit={handleEditTask}
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
