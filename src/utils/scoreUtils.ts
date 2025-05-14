export const POINTS = {
  TASK_COMPLETION: 10,
  STREAK_BONUS: 5,
  ACHIEVEMENT_UNLOCK: 20
};

export const LEVEL_THRESHOLDS = {
  BASE_XP: 100,  // Base XP needed for level 1
  MULTIPLIER: 1.5  // Each level requires 1.5x more XP
};

export function calculateLevel(score: number): number {
  let level = 1;
  let threshold = LEVEL_THRESHOLDS.BASE_XP;
  
  while (score >= threshold) {
    level++;
    threshold += Math.floor(LEVEL_THRESHOLDS.BASE_XP * Math.pow(LEVEL_THRESHOLDS.MULTIPLIER, level - 1));
  }
  
  return level;
}

export function getNextLevelThreshold(currentLevel: number): number {
  return Math.floor(LEVEL_THRESHOLDS.BASE_XP * Math.pow(LEVEL_THRESHOLDS.MULTIPLIER, currentLevel - 1));
}
