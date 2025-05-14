
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/common/AppLayout';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { ScoreDisplay } from '@/components/gamification/ScoreDisplay';
import { Achievement } from '@/types/achievement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { AchievementService } from '@/services/AchievementService';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, user } = useAuth();
  
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
      
      const userAchievements = await AchievementService.getUserAchievements(user.id);
      console.log('Fetched user achievements:', userAchievements);
      
      if (!userAchievements || userAchievements.length === 0) {
        console.log('No achievements found, initializing...');
        await AchievementService.initializeAchievements();
        const newAchievements = await AchievementService.getUserAchievements(user.id);
        processAchievements(newAchievements);
      } else {
        processAchievements(userAchievements);
      }
    } catch (error: any) {
      console.error('Error in fetchAchievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const processAchievements = (achievementsData: Achievement[]) => {
    if (!achievementsData) {
      console.warn('No achievements data to process');
      return;
    }
    
    console.log('Processing achievements:', achievementsData);
    setAchievements(achievementsData);
    
    // Split achievements into unlocked and locked
    const unlocked = achievementsData.filter(a => a.unlocked);
    const locked = achievementsData.filter(a => !a.unlocked);
    
    setUnlockedAchievements(unlocked);
    setLockedAchievements(locked);
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-3xl mx-auto py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold">Achievements</h1>
              <p className="text-muted-foreground">Track your progress and unlock rewards</p>
            </div>
            <Skeleton className="h-20 w-24" />
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
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
