export const ANIMAL_AVATARS = {
  owl: { emoji: '🦉', name: 'Wise Owl' },
  beaver: { emoji: '🦫', name: 'Busy Beaver' },
  rabbit: { emoji: '🐰', name: 'Quick Rabbit' },
  squirrel: { emoji: '🐿️', name: 'Organized Squirrel' },
  ant: { emoji: '🐜', name: 'Diligent Ant' },
  bee: { emoji: '🐝', name: 'Worker Bee' },
  fox: { emoji: '🦊', name: 'Smart Fox' },
  bear: { emoji: '🐻', name: 'Focus Bear' },
} as const;

export type AnimalAvatarId = keyof typeof ANIMAL_AVATARS;

export function getAnimalAvatar(id: string = 'owl') {
  return ANIMAL_AVATARS[id as AnimalAvatarId] || ANIMAL_AVATARS.owl;
} 