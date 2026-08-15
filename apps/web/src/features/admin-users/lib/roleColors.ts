import type { UserRole } from '@/entities/session/model/types';

export const ROLE_COLORS: Record<UserRole, { fg: string; bg: string }> = {
  admin: { fg: '#ff6369', bg: '#4c1d1d' },
  developer: { fg: '#8767fb', bg: '#241c43' },
  moderator: { fg: '#ff9e4a', bg: '#3d1f0e' },
  vip: { fg: '#ffd644', bg: '#3a2d00' },
  supporter: { fg: '#f65cb6', bg: '#51172f' },
  tester: { fg: '#52a9ff', bg: '#0b2440' },
  premium: { fg: '#3dd68c', bg: '#11301f' },
  free: { fg: '#6e7683', bg: '#1c1d21' },
};
