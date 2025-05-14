-- Insert default achievements
INSERT INTO achievements (id, name, description, required_progress, icon)
VALUES 
  ('first-task', 'First Steps', 'Complete your first task', 1, '🎯'),
  ('task-master-10', 'Task Master', 'Complete 10 tasks', 10, '⭐'),
  ('task-master-50', 'Task Expert', 'Complete 50 tasks', 50, '🌟'),
  ('task-master-100', 'Task Legend', 'Complete 100 tasks', 100, '👑'),
  ('level-5', 'Rising Star', 'Reach level 5', 5, '⚡'),
  ('level-10', 'Power User', 'Reach level 10', 10, '🔥'),
  ('level-20', 'Elite', 'Reach level 20', 20, '💫')
ON CONFLICT (id) DO NOTHING; 