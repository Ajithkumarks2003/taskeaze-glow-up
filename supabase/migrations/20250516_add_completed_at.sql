-- Add completed_at column to tasks table
ALTER TABLE tasks
ADD COLUMN completed_at timestamp with time zone;

-- Update existing completed tasks to have a completed_at timestamp
UPDATE tasks
SET completed_at = created_at
WHERE completed = true AND completed_at IS NULL; 