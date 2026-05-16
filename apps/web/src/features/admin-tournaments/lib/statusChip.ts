import type { TournamentStatus } from '../api';

export function getStatusChipColor(status: TournamentStatus): {
  bg: string;
  fg: string;
} {
  switch (status) {
    case 'scheduled':
      return { bg: '$gray3', fg: '$gray11' };
    case 'registration_open':
      return { bg: '$infoBgSoft', fg: '$infoText' };
    case 'live':
      return { bg: '$successBgSoft', fg: '$successText' };
    case 'completed':
      return { bg: '$gray4', fg: '$gray11' };
    case 'cancelled':
      return { bg: '$errorBgSoft', fg: '$errorText' };
  }
}
