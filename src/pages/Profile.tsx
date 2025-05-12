import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/common/AppLayout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BellRing, LogOut, Settings, Pen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [userName, setUserName] = useState('');
  const [userStats, setUserStats] = useState({
    completedTasks: 0,
    totalTasks: 0
  });
  
  useEffect(() => {
    if (profile) {
      setUserName(profile.name);
      
      // Fetch user stats
      const fetchUserStats = async () => {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();
          
        if (!error && data) {
          setUserStats({
            completedTasks: data.completed_tasks,
            totalTasks: data.total_tasks
          });
        }
      };
      
      fetchUserStats();
    }
  }, [profile]);
  
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
  
  if (!profile) {
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
      <div className="container max-w-3xl mx-auto space-y-8">
        <ProfileHeader 
          name={userName}
          email={profile.email}
          joinDate={formatDate(profile.joined_at)}
          score={profile.score}
          level={profile.level}
          tasks={{
            completed: userStats.completedTasks,
            total: userStats.totalTasks
          }}
        />
        
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
                          setUserName(profile.name);
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
