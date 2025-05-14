
const ANIMAL_AVATARS = [
  { id: 'owl', name: 'Wise Owl', emoji: '🦉' },
  { id: 'beaver', name: 'Busy Beaver', emoji: '🦫' },
  { id: 'rabbit', name: 'Quick Rabbit', emoji: '🐰' },
  { id: 'squirrel', name: 'Organized Squirrel', emoji: '🐿️' },
  { id: 'ant', name: 'Diligent Ant', emoji: '🐜' },
  { id: 'bee', name: 'Worker Bee', emoji: '🐝' },
  { id: 'fox', name: 'Smart Fox', emoji: '🦊' },
  { id: 'bear', name: 'Focus Bear', emoji: '🐻' },
  { id: 'default', name: 'Default User', emoji: '👤' },
];

export function getAnimalAvatar(avatarId: string | undefined) {
  if (!avatarId) {
    return ANIMAL_AVATARS.find(avatar => avatar.id === 'default') || ANIMAL_AVATARS[0];
  }

  return ANIMAL_AVATARS.find(avatar => avatar.id === avatarId) || 
         ANIMAL_AVATARS.find(avatar => avatar.id === 'default') || 
         ANIMAL_AVATARS[0];
}
