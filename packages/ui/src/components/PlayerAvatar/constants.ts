export type PlayerAvatarSize = 'icon' | 'sm' | 'md' | 'lg' | 'card' | 'profile';

export const DISC_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 28,
  sm: 40,
  md: 72,
  lg: 140,
  card: 140,
  profile: 140,
};

export const BADGE_SIZE: Record<PlayerAvatarSize, number> = {
  icon: 12,
  sm: 14,
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
