export type PlayerAvatarSize = 'icon' | 'sm' | 'md' | 'lg' | 'card' | 'profile';

export const DISC_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 32,
  sm: 44,
  md: 72,
  lg: 140,
  card: 140,
  profile: 140,
};

export const BADGE_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 14,
  sm: 16,
  md: 24,
  lg: 44,
  card: 44,
  profile: 56,
};

export const RING_WIDTH: Record<PlayerAvatarSize, number> = {
  icon: 2,
  sm: 2,
  md: 3,
  lg: 3,
  card: 3,
  profile: 2,
};
