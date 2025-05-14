-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean initialization)
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

-- Create achievements table
CREATE TABLE achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  required_progress integer NOT NULL DEFAULT 1,
  icon text
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text REFERENCES achievements(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  unlocked boolean NOT NULL DEFAULT false,
  unlocked_at timestamp with time zone,
  UNIQUE(user_id, achievement_id)
);

-- Insert default achievements
INSERT INTO achievements (id, name, description, required_progress, icon)
VALUES 
  ('first-task', 'First Steps', 'Complete your first task', 1, '🎯'),
  ('task-master-10', 'Task Master', 'Complete 10 tasks', 10, '⭐'),
  ('task-master-50', 'Task Expert', 'Complete 50 tasks', 50, '🌟'),
  ('task-master-100', 'Task Legend', 'Complete 100 tasks', 100, '👑'),
  ('level-5', 'Rising Star', 'Reach level 5', 5, '⚡'),
  ('level-10', 'Power User', 'Reach level 10', 10, '🔥'),
  ('level-20', 'Elite', 'Reach level 20', 20, '💫');

-- Set up RLS policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Allow full access to achievements table for authenticated users
CREATE POLICY "Full access to achievements"
  ON achievements
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow users to manage their own achievement progress
CREATE POLICY "Users can manage their own achievements"
  ON user_achievements
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT ALL ON achievements TO authenticated;
GRANT ALL ON user_achievements TO authenticated; 