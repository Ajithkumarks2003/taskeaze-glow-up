
import { AppLayout } from '@/components/common/AppLayout';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { mockUser } from '@/services/mockData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BellRing, LogOut, Settings } from 'lucide-react';

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    
    navigate('/login');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto space-y-8">
        <ProfileHeader 
          name={mockUser.name}
          email={mockUser.email}
          joinDate={formatDate(mockUser.joinedAt)}
          score={mockUser.score}
          level={mockUser.level}
          tasks={{
            completed: mockUser.stats.completedTasks,
            total: mockUser.stats.totalTasks,
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
                onClick={handleLogout}
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
