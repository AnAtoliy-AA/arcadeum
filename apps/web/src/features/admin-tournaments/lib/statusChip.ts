import type { TournamentStatus } from '../api';

export function getStatusChipColor(status: TournamentStatus): {
  bg: string;
  fg: string;
} {
  switch (status) {
    case 'scheduled':
      return { bg: '#1c1d21', fg: '#babfc7' };
    case 'registration_open':
      return { bg: 'rgba(99,102,241,0.1)', fg: 'var(--infoText)' };
    case 'live':
      return { bg: 'rgba(16,185,129,0.2)', fg: 'var(--successText)' };
    case 'completed':
      return { bg: '#26272b', fg: '#babfc7' };
    case 'cancelled':
      return { bg: 'rgba(239,68,68,0.25)', fg: 'var(--errorText)' };
  }
}
