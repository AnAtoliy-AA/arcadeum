import type { UserRole } from '@/entities/session/model/types';

export const ROLE_COLORS: Record<UserRole, { fg: string; bg: string }> = {
  admin: { fg: '$red9', bg: '$red3' },
  developer: { fg: '$violet9', bg: '$violet3' },
  moderator: { fg: '$orange9', bg: '$orange3' },
  vip: { fg: '$yellow9', bg: '$yellow3' },
  supporter: { fg: '$pink9', bg: '$pink3' },
  tester: { fg: '$blue9', bg: '$blue3' },
  premium: { fg: '$green9', bg: '$green3' },
  free: { fg: '$gray9', bg: '$gray3' },
};
