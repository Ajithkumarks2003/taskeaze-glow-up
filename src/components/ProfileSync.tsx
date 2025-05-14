import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ProfileSync() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time profile changes
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          // Refresh the page or update state when profile changes
          window.location.reload();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Create profile if it doesn't exist
  useEffect(() => {
    const createProfileIfMissing = async () => {
      if (user && !profile) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || '',
              joined_at: new Date().toISOString(),
              level: 1,
              score: 0,
              role: 'user'
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            toast({
              title: 'Profile Setup Failed',
              description: 'Unable to create your profile. Please try again.',
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Profile creation error:', error);
        }
      }
    };

    createProfileIfMissing();
  }, [user, profile, toast]);

  return null;
}
