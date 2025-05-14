import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/common/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BellRing, LogOut, Settings, Pen, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScoreDisplay } from '@/components/gamification/ScoreDisplay';
import { AvatarSelector } from '@/components/common/AvatarSelector';
import { getAnimalAvatar } from '@/utils/avatars';
import { AchievementService } from '@/services/AchievementService';
import { Achievement } from '@/types/achievement';
import { AchievementCard } from '@/components/gamification/AchievementCard';

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isAchievementsLoading, setIsAchievementsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    completedTasks: 0,
    totalTasks: 0
  });
  
  useEffect(() => {
    if (profile) {
      setUserName(profile.name || '');
      fetchUserStats();
      fetchUserAchievements();
      setIsLoading(false);
    }
  }, [profile]);
  
  const fetchUserAchievements = async () => {
    if (!user) return;
    
    setIsAchievementsLoading(true);
    try {
      const userAchievements = await AchievementService.getUserAchievements(user.id);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your achievements',
        variant: 'destructive',
      });
    } finally {
      setIsAchievementsLoading(false);
    }
  };
  
  useEffect(() => {
    const createProfileIfMissing = async () => {
      if (user && !profile) {
        // Try to create the profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            joined_at: new Date().toISOString(),
            level: 1,
            score: 0,
            role: 'user'
          });
        if (error) {
          toast({
            title: 'Profile setup failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Profile created',
            description: 'Your profile was set up successfully.',
          });
          // Optionally, refetch or reload the profile here
          window.location.reload();
        }
      }
      setIsLoading(false);
    };
    createProfileIfMissing();
  }, [user, profile, toast]);
  
  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user stats:', error);
        return;
      }
        
      if (data) {
        setUserStats({
          completedTasks: data.completed_tasks,
          totalTasks: data.total_tasks
        });
      } else {
        // Create initial stats for user if they don't exist
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
      console.error('Failed to fetch user stats:', error);
    }
  };
  
  const handleNameSave = async () => {
    if (userName.trim() && profile) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ name: userName.trim() })
          .eq('id', profile.id);
          
        if (error) throw error;
        
        setIsNameEditing(false);
        toast({
          title: "Name updated",
          description: "Your name has been updated successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update name: " + error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (isLoading || !profile) {
    return (
      <AppLayout>
        <div className="container max-w-3xl mx-auto space-y-8 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32">
                  <AvatarFallback className="text-4xl bg-dark-accent">
                    {getAnimalAvatar(profile?.avatar_url || '').emoji}
                  </AvatarFallback>
                </Avatar>
                <AvatarSelector />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{profile?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <ScoreDisplay 
                    score={profile?.score || 0} 
                    level={profile?.level || 1} 
                    compact={false}
                  />
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">
                    Joined {profile?.joined_at && new Date(profile.joined_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="bg-dark-accent p-3 rounded-md flex-1">
                    <p className="text-sm text-muted-foreground">Completed tasks</p>
                    <p className="text-xl font-medium">{userStats.completedTasks}</p>
                  </div>
                  <div className="bg-dark-accent p-3 rounded-md flex-1">
                    <p className="text-sm text-muted-foreground">Total tasks</p>
                    <p className="text-xl font-medium">{userStats.totalTasks}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievements Card */}
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-4 w-4" /> 
              Achievements
            </CardTitle>
            <CardDescription>Track your progress and unlock special badges</CardDescription>
          </CardHeader>
          <CardContent>
            {isAchievementsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-pink"></div>
              </div>
            ) : achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No achievements yet. Complete tasks to earn your first badge!</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-4 w-4" /> 
              Settings
            </CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <div className="flex items-center gap-2">
                  {isNameEditing ? (
                    <>
                      <Input 
                        id="display-name" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleNameSave} 
                        size="sm" 
                        className="bg-neon-pink hover:bg-neon-pink/80"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setUserName(profile.name || '');
                          setIsNameEditing(false);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 py-2 px-3 bg-dark-accent rounded-md border border-dark-border">
                        <span>{userName}</span>
                      </div>
                      <Button
                        onClick={() => setIsNameEditing(true)}
                        size="sm"
                        variant="outline"
                        className="border-dark-border"
                      >
                        <Pen className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notifications</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="app-notifications">App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about tasks and achievements
                  </p>
                </div>
                <Switch 
                  id="app-notifications" 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about task due dates
                  </p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-dark-border">
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
