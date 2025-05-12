
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/common/AppLayout';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { ScoreDisplay } from '@/components/gamification/ScoreDisplay';
import { Achievement } from '@/types/achievement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAchievements, mockUser } from '@/services/mockData';

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    // Load mock achievements
    setAchievements(mockAchievements);
    
    // Split achievements by unlock status
    setUnlockedAchievements(mockAchievements.filter(a => a.unlocked));
    setLockedAchievements(mockAchievements.filter(a => !a.unlocked));
  }, []);
  
  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">Track your progress and unlock rewards</p>
          </div>
          <ScoreDisplay score={mockUser.score} level={mockUser.level} compact={true} />
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
                  width: `${(unlockedAchievements.length / achievements.length) * 100}%` 
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
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
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
              {lockedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
