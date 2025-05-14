import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ProfileSync() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Create profile if it doesn't exist
  useEffect(() => {
    const createProfileIfMissing = async () => {
      if (user && !profile) {
        try {
          // First check if profile exists
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (fetchError) throw fetchError;

          // Only create if profile doesn't exist
          if (!existingProfile) {
            console.log('Creating new profile for user:', user.id);
            
            // Create profile
            const { error: profileError } = await supabase
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

            if (profileError) {
              console.error('Profile creation error:', profileError);
              throw profileError;
            }

            console.log('Profile created successfully');

            // Initialize user stats
            console.log('Initializing user stats...');
            const { error: statsError } = await supabase
              .from('user_stats')
              .insert({
                user_id: user.id,
                completed_tasks: 0,
                total_tasks: 0,
                streaks: 0,
                last_active_date: new Date().toISOString().split('T')[0]
              });

            if (statsError) {
              console.error('Error creating user stats:', statsError);
            } else {
              console.log('User stats initialized successfully');
            }

            // Initialize user achievements
            console.log('Fetching achievements for initialization...');
            const { data: achievements, error: achievementsError } = await supabase
              .from('achievements')
              .select('*');

            if (achievementsError) {
              console.error('Error fetching achievements:', achievementsError);
              throw achievementsError;
            }

            if (achievements && achievements.length > 0) {
              console.log('Found achievements to initialize:', achievements.length);
              
              // Check if user already has any achievements
              const { data: existingUserAchievements, error: checkError } = await supabase
                .from('user_achievements')
                .select('achievement_id')
                .eq('user_id', user.id);

              if (checkError) {
                console.error('Error checking existing achievements:', checkError);
                throw checkError;
              }

              // Filter out achievements that user already has
              const existingIds = new Set(existingUserAchievements?.map(ua => ua.achievement_id) || []);
              const newAchievements = achievements.filter(a => !existingIds.has(a.id));

              if (newAchievements.length > 0) {
                console.log('Initializing new achievements:', newAchievements.length);
                const userAchievements = newAchievements.map(achievement => ({
                  user_id: user.id,
                  achievement_id: achievement.id,
                  progress: 0,
                  unlocked: false
                }));

                const { error: insertError } = await supabase
                  .from('user_achievements')
                  .insert(userAchievements);

                if (insertError) {
                  console.error('Error initializing user achievements:', insertError);
                  throw insertError;
                }

                console.log('User achievements initialized successfully');
              } else {
                console.log('No new achievements to initialize');
              }
            } else {
              console.log('No achievements found in the database');
            }

            // Reload the page to refresh all data
            console.log('Reloading page to refresh data...');
            window.location.reload();
          } else {
            console.log('Profile already exists for user:', user.id);
          }
        } catch (error) {
          console.error('Profile sync error:', error);
          toast({
            title: 'Profile Setup Failed',
            description: 'Unable to create your profile. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };

    createProfileIfMissing();
  }, [user, profile, toast]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) return;

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
        (payload) => {
          // Refresh the page when profile changes
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  return null;
} 