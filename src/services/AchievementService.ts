
import { supabase } from '@/integrations/supabase/client';
import { Achievement } from '@/types/achievement';
import { POINTS } from '@/utils/scoreUtils';

export class AchievementService {
  static async getUserAchievements(userId: string) {
    try {
      // First get all achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('required_progress', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Then get user's achievements progress
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (userAchievementsError) throw userAchievementsError;

      // Map achievements with progress
      const achievementsWithProgress = achievements?.map(achievement => {
        const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon || '🏆',
          required_progress: achievement.required_progress,
          progress: userAchievement?.progress || 0,
          unlocked: userAchievement?.unlocked || false,
          unlockedAt: userAchievement?.unlocked_at
        };
      }) || [];

      return achievementsWithProgress;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  static async checkAndUpdateAchievements(userId: string, completedTasks: number, level: number) {
    const unlockedAchievements: Achievement[] = [];
    
    try {
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');
  
      if (achievementsError) throw achievementsError;
  
      for (const achievement of achievements || []) {
        let progress = 0;
        let isUnlocked = false;
  
        // Check if achievement ID starts with specific prefixes to determine type
        if (achievement.id.startsWith('task-master-') || achievement.id === 'first-task') {
          // Task-based achievement
          progress = Math.min(completedTasks, achievement.required_progress);
          isUnlocked = completedTasks >= achievement.required_progress;
        } else if (achievement.id.startsWith('level-')) {
          // Level-based achievement
          progress = Math.min(level, achievement.required_progress);
          isUnlocked = level >= achievement.required_progress;
        }
  
        // First get current user achievement
        const { data: existingAchievement, error: existingError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .maybeSingle();
  
        // Only update if achievement doesn't exist or is not unlocked yet
        if (!existingAchievement || !existingAchievement.unlocked) {
          // Update achievement progress
          const { data: updatedAchievement, error: updateError } = await supabase
            .from('user_achievements')
            .upsert({
              user_id: userId,
              achievement_id: achievement.id,
              progress: progress,
              unlocked: isUnlocked,
              unlocked_at: isUnlocked ? new Date().toISOString() : null
            }, {
              onConflict: 'user_id,achievement_id'
            })
            .select()
            .maybeSingle();
  
          if (updateError) throw updateError;
  
          // If newly unlocked (not previously unlocked), award bonus points
          if (isUnlocked && (!existingAchievement || !existingAchievement.unlocked)) {
            // Add to unlocked achievements list to notify user
            unlockedAchievements.push({
              ...achievement,
              progress,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            });
            
            // Award bonus points
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('score, level')
              .eq('id', userId)
              .single();
  
            if (profileError) throw profileError;
  
            const newScore = (profile?.score || 0) + POINTS.ACHIEVEMENT_UNLOCK;
            const newLevel = Math.floor(newScore / 100) + 1;
  
            const { error: updateScoreError } = await supabase
              .from('profiles')
              .update({
                score: newScore,
                level: newLevel
              })
              .eq('id', userId);
  
            if (updateScoreError) throw updateScoreError;
          }
        }
      }
      
      return unlockedAchievements;
      
    } catch (error) {
      console.error('Error updating achievements:', error);
      return [];
    }
  }

  static async initializeAchievements() {
    const defaultAchievements = [
      { id: 'first-task', name: 'First Steps', description: 'Complete your first task', required_progress: 1, icon: '🎯' },
      { id: 'task-master-10', name: 'Task Master', description: 'Complete 10 tasks', required_progress: 10, icon: '⭐' },
      { id: 'task-master-50', name: 'Task Expert', description: 'Complete 50 tasks', required_progress: 50, icon: '🌟' },
      { id: 'task-master-100', name: 'Task Legend', description: 'Complete 100 tasks', required_progress: 100, icon: '👑' },
      { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', required_progress: 5, icon: '⚡' },
      { id: 'level-10', name: 'Power User', description: 'Reach level 10', required_progress: 10, icon: '🔥' },
      { id: 'level-20', name: 'Elite', description: 'Reach level 20', required_progress: 20, icon: '💫' }
    ];
    
    try {
      // Use upsert to add or update achievements
      const { error } = await supabase
        .from('achievements')
        .upsert(defaultAchievements, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error upserting achievements:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize achievements:', error);
      return false;
    }
  }

  static async initializeUserAchievements(userId: string, achievements: Achievement[]) {
    try {
      const userAchievements = achievements.map(achievement => ({
        user_id: userId,
        achievement_id: achievement.id,
        progress: 0,
        unlocked: false
      }));

      const { error } = await supabase
        .from('user_achievements')
        .insert(userAchievements);

      if (error) {
        console.error('Error initializing user achievements:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize user achievements:', error);
      return false;
    }
  }
}
