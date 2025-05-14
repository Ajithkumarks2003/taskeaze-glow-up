
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/common/AppLayout';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { ScoreDisplay } from '@/components/gamification/ScoreDisplay';
import { Achievement } from '@/types/achievement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      fetchAchievements();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const fetchAchievements = async () => {
    try {
      if (!user) {
        console.error('No user found when trying to fetch achievements');
        return;
      }
      
      // First get all achievements
      let { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('required_progress', { ascending: true });
        
      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        throw achievementsError;
      }
      
      if (!achievementsData || achievementsData.length === 0) {
        // Try to initialize achievements if none exist
        console.log('No achievements found, initializing...');
        const initialized = await initializeAchievements();
        
        if (initialized) {
          // Refetch achievements
          const { data: refetchedData, error: refetchError } = await supabase
            .from('achievements')
            .select('*')
            .order('required_progress', { ascending: true });
            
          if (refetchError) throw refetchError;
          achievementsData = refetchedData;
        }
      }

      // Then get user's achievements progress
      let { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
        
      if (userAchievementsError) {
        console.error('Error fetching user achievements:', userAchievementsError);
        throw userAchievementsError;
      }

      // Initialize user achievements if none exist
      if (!userAchievements || userAchievements.length === 0) {
        await initializeUserAchievements(achievementsData);
        
        // Refetch user achievements
        const { data: refetchedUserAchievements, error: refetchError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);
          
        if (refetchError) throw refetchError;
        userAchievements = refetchedUserAchievements;
      }

      // Map achievements with progress
      const achievementsWithProgress = achievementsData?.map(achievement => {
        const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon || '',
          required_progress: achievement.required_progress,
          progress: userAchievement?.progress || 0,
          unlocked: userAchievement?.unlocked || false,
          unlockedAt: userAchievement?.unlocked_at
        };
      }) || [];

      // Split and set achievements
      const unlocked = achievementsWithProgress.filter(a => a.unlocked);
      const locked = achievementsWithProgress.filter(a => !a.unlocked);
      
      setAchievements(achievementsWithProgress);
      setUnlockedAchievements(unlocked);
      setLockedAchievements(locked);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error in fetchAchievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const initializeAchievements = async () => {
    const defaultAchievements = [
      { id: 'first-task', name: 'First Steps', description: 'Complete your first task', required_progress: 1, icon: '🎯' },
      { id: 'task-master-10', name: 'Task Master', description: 'Complete 10 tasks', required_progress: 10, icon: '⭐' },
      { id: 'task-master-50', name: 'Task Expert', description: 'Complete 50 tasks', required_progress: 50, icon: '🌟' },
      { id: 'task-master-100', name: 'Task Legend', description: 'Complete 100 tasks', required_progress: 100, icon: '👑' },
      { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', required_progress: 5, icon: '⚡' },
      { id: 'level-10', name: 'Power User', description: 'Reach level 10', required_progress: 10, icon: '🔥' },
      { id: 'level-20', name: 'Elite', description: 'Reach level 20', required_progress: 20, icon: '💫' }
    ];
    
    try {
      // Use upsert to add or update achievements
      const { error } = await supabase
        .from('achievements')
        .upsert(defaultAchievements, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error upserting achievements:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize achievements:', error);
      return false;
    }
  };

  const initializeUserAchievements = async (allAchievements: Achievement[]) => {
    try {
      const userAchievements = allAchievements.map(achievement => ({
        user_id: user!.id,
        achievement_id: achievement.id,
        progress: 0,
        unlocked: false
      }));

      const { error } = await supabase
        .from('user_achievements')
        .insert(userAchievements);

      if (error) {
        console.error('Error initializing user achievements:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize user achievements:', error);
      return false;
    }
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-3xl mx-auto py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">Track your progress and unlock rewards</p>
          </div>
          {profile && (
            <ScoreDisplay 
              score={profile.score} 
              level={profile.level} 
              compact={true} 
            />
          )}
        </div>
        
        <div className="bg-dark-card border-dark-border rounded-lg p-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-medium">Your progress</h2>
              <p className="text-sm text-muted-foreground">
                {unlockedAchievements.length} of {achievements.length} achievements unlocked
              </p>
            </div>
            <div className="w-full md:w-auto bg-dark-accent h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-pink to-neon-violet"
                style={{ 
                  width: achievements.length ? 
                    `${(unlockedAchievements.length / achievements.length) * 100}%` : 
                    '0%' 
                }}
              />
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="bg-dark-accent">
            <TabsTrigger value="all">All Achievements</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8 bg-dark-card rounded-lg border border-dark-border">
                  <p className="text-muted-foreground">No achievements available yet</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="unlocked" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.length > 0 ? (
                unlockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8 bg-dark-card rounded-lg border border-dark-border">
                  <p className="text-muted-foreground">No achievements unlocked yet</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="locked" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.length > 0 ? (
                lockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8 bg-dark-card rounded-lg border border-dark-border">
                  <p className="text-muted-foreground">All achievements unlocked!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
