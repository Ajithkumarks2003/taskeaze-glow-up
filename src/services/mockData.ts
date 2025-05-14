import { Task } from '@/types/task';
import { Achievement } from '@/types/achievement';
import { User } from '@/types/user';

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Write up the project proposal for the client meeting',
    completed: false,
    createdAt: '2025-05-11T10:00:00Z',
    dueDate: '2025-05-14T17:00:00Z',
    priority: 'High',
    tags: ['Work', 'Client'],
    points: 50,
    userId: 'mock-user-id', // Add userId
  },
  {
    id: '2',
    title: 'Schedule team meeting',
    description: 'Set up weekly sync with the development team',
    completed: true,
    createdAt: '2025-05-10T14:30:00Z',
    priority: 'Medium',
    tags: ['Work', 'Meeting'],
    points: 20,
    userId: 'mock-user-id', // Add userId
  },
  {
    id: '3',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables',
    completed: false,
    createdAt: '2025-05-11T12:00:00Z',
    dueDate: '2025-05-12T20:00:00Z',
    priority: 'Low',
    tags: ['Personal', 'Shopping'],
    points: 10,
    userId: 'mock-user-id', // Add userId
  },
  {
    id: '4',
    title: 'Fix login page bug',
    description: 'Authentication fails on mobile devices',
    completed: false,
    createdAt: '2025-05-09T09:15:00Z',
    dueDate: '2025-05-13T17:00:00Z',
    priority: 'Urgent',
    tags: ['Work', 'Bug', 'Frontend'],
    points: 40,
    userId: 'mock-user-id', // Add userId
  },
  {
    id: '5',
    title: 'Review pull requests',
    description: 'Check team PRs and provide feedback',
    completed: false,
    createdAt: '2025-05-10T11:00:00Z',
    dueDate: '2025-05-12T15:00:00Z',
    priority: 'High',
    tags: ['Work', 'Code Review'],
    points: 30,
    userId: 'mock-user-id', // Add userId
  },
];

// Mock Achievements
export const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first task',
    unlocked: true,
    unlockedAt: '2025-05-10T15:30:00Z',
    progress: 100,
    required_progress: 100, // Fix property name
    icon: '🏆', // Add icon
  },
  {
    id: '2',
    name: 'Rising Star',
    description: 'Complete 10 tasks',
    unlocked: false,
    progress: 20,
    required_progress: 100, // Fix property name
    icon: '⭐', // Add icon
  },
  {
    id: '3',
    name: 'On Fire',
    description: 'Complete 5 tasks in a single day',
    unlocked: false,
    progress: 40,
    required_progress: 100, // Fix property name
    icon: '🔥', // Add icon
  },
  {
    id: '4',
    name: 'Punctual',
    description: 'Complete 5 tasks before their due date',
    unlocked: true,
    unlockedAt: '2025-05-11T09:45:00Z',
    progress: 100,
    required_progress: 100, // Fix property name
    icon: '⏰', // Add icon
  },
  {
    id: '5',
    name: 'Task Master',
    description: 'Reach level 5',
    unlocked: false,
    progress: 60,
    required_progress: 100, // Fix property name
    icon: '🔰', // Add icon
  },
];

// Mock User
export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'user',
  score: 280,
  level: 2,
  joinedAt: '2025-04-15T08:00:00Z',
  stats: {
    completedTasks: 28,
    totalTasks: 45,
    streaks: 3,
  },
};

// Helper functions to get tasks by status
export const getCompletedTasks = (): Task[] => {
  return mockTasks.filter(task => task.completed);
};

export const getIncompleteTasks = (): Task[] => {
  return mockTasks.filter(task => !task.completed);
};

export const getTodayTasks = (): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return mockTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < tomorrow && !task.completed;
  });
};

export const getUpcomingTasks = (): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return mockTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate > tomorrow && !task.completed;
  });
};
