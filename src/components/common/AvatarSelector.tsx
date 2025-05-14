import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ANIMAL_AVATARS = [
  { id: 'owl', name: 'Wise Owl', emoji: '🦉', description: 'For the strategic planners' },
  { id: 'beaver', name: 'Busy Beaver', emoji: '🦫', description: 'For the productive workers' },
  { id: 'rabbit', name: 'Quick Rabbit', emoji: '🐰', description: 'For the fast completers' },
  { id: 'squirrel', name: 'Organized Squirrel', emoji: '🐿️', description: 'For the task collectors' },
  { id: 'ant', name: 'Diligent Ant', emoji: '🐜', description: 'For the consistent workers' },
  { id: 'bee', name: 'Worker Bee', emoji: '🐝', description: 'For the team players' },
  { id: 'fox', name: 'Smart Fox', emoji: '🦊', description: 'For the clever solvers' },
  { id: 'bear', name: 'Focus Bear', emoji: '🐻', description: 'For the deep workers' },
];

export function AvatarSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();

  const handleSelectAvatar = async (animalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_id: animalId })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsOpen(false);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile avatar has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update avatar: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Change Avatar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {ANIMAL_AVATARS.map((animal) => (
            <Button
              key={animal.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleSelectAvatar(animal.id)}
            >
              <span className="text-4xl">{animal.emoji}</span>
              <span className="font-medium">{animal.name}</span>
              <span className="text-xs text-muted-foreground text-center">
                {animal.description}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 