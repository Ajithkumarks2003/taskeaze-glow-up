-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  required_progress integer NOT NULL DEFAULT 1,
  icon text
);

-- Create user_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text REFERENCES achievements(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  unlocked boolean NOT NULL DEFAULT false,
  unlocked_at timestamp with time zone,
  UNIQUE(user_id, achievement_id)
);

-- Set up RLS policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read achievements
CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  USING (true);

-- Allow users to read their own achievement progress
CREATE POLICY "Users can read their own achievement progress"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own achievement progress
CREATE POLICY "Users can insert their own achievement progress"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own achievement progress
CREATE POLICY "Users can update their own achievement progress"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_achievements TO authenticated;

-- Insert default achievements if they don't exist
INSERT INTO achievements (id, name, description, required_progress, icon)
VALUES 
  ('first-task', 'First Steps', 'Complete your first task', 1, '🎯'),
  ('task-master-10', 'Task Master', 'Complete 10 tasks', 10, '⭐'),
  ('task-master-50', 'Task Expert', 'Complete 50 tasks', 50, '🌟'),
  ('task-master-100', 'Task Legend', 'Complete 100 tasks', 100, '👑'),
  ('level-5', 'Rising Star', 'Reach level 5', 5, '⚡'),
  ('level-10', 'Power User', 'Reach level 10', 10, '🔥'),
  ('level-20', 'Elite', 'Reach level 20', 20, '💫')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  required_progress = EXCLUDED.required_progress,
  icon = EXCLUDED.icon; 