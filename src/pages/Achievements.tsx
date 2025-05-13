
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
      // First get all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');
        
      if (achievementsError) throw achievementsError;
      
      // Then get user's achievements progress
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user!.id);
        
      if (userAchievementsError) throw userAchievementsError;
      
      // Map user achievements to achievement data
      const achievementsWithProgress: Achievement[] = (allAchievements || []).map(achievement => {
        const userAchievement = (userAchievements || []).find(ua => ua.achievement_id === achievement.id);
        
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon || '',
          requiredProgress: achievement.required_progress,
          progress: userAchievement?.progress || 0,
          unlocked: userAchievement?.unlocked || false,
          unlockedAt: userAchievement?.unlocked_at
        };
      });
      
      // If no user achievements exist yet, initialize them
      if (userAchievements?.length === 0 && allAchievements?.length > 0) {
        const initialUserAchievements = allAchievements.map(achievement => ({
          user_id: user!.id,
          achievement_id: achievement.id,
          progress: 0,
          unlocked: false
        }));
        
        try {
          await supabase
            .from('user_achievements')
            .insert(initialUserAchievements);
        } catch (insertError) {
          console.error('Error initializing user achievements:', insertError);
        }
      }
      
      setAchievements(achievementsWithProgress);
      setUnlockedAchievements(achievementsWithProgress.filter(a => a.unlocked));
      setLockedAchievements(achievementsWithProgress.filter(a => !a.unlocked));
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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
