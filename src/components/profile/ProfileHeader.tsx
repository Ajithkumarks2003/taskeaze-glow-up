
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Calendar, Settings } from 'lucide-react';
import { ScoreDisplay } from '../gamification/ScoreDisplay';

interface ProfileHeaderProps {
  name: string;
  email: string;
  joinDate: string;
  score: number;
  level: number;
  tasks: {
    completed: number;
    total: number;
  };
}

export function ProfileHeader({
  name,
  email,
  joinDate,
  score,
  level,
  tasks,
}: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  return (
    <div className="bg-dark-card border-dark-border rounded-lg p-6 neon-border overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center md:items-start">
          <Avatar className="h-20 w-20 border-2 border-neon-pink/30">
            <AvatarFallback className="bg-dark-accent text-lg">
              {initials}
            </AvatarFallback>
            <AvatarImage src="" />
          </Avatar>
          
          {isEditing ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs border-neon-pink/30 text-neon-pink"
              onClick={() => setIsEditing(false)}
            >
              Upload Photo
            </Button>
          ) : null}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{name}</h2>
              <p className="text-muted-foreground">{email}</p>
              
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {tasks.completed}/{tasks.total} tasks completed
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {joinDate}
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex justify-center">
              <ScoreDisplay score={score} level={level} />
            </div>
          </div>
        </div>
      </div>
      
      {!isEditing ? (
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline"
            size="sm"
            className="border-dark-border text-muted-foreground hover:bg-dark-hover"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex justify-end space-x-2">
          <Button 
            variant="outline"
            size="sm"
            className="border-dark-border text-muted-foreground hover:bg-dark-hover"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button 
            size="sm"
            className="bg-neon-pink hover:bg-neon-pink/80"
            onClick={() => setIsEditing(false)}
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
