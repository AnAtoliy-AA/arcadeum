import type { TournamentStatus } from '../api';

const ALLOWED: Record<TournamentStatus, readonly TournamentStatus[]> = {
  scheduled: ['registration_open', 'cancelled'],
  registration_open: ['live', 'cancelled'],
  live: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function nextStatuses(
  from: TournamentStatus,
): readonly TournamentStatus[] {
  return ALLOWED[from];
}

export function canTransition(
  from: TournamentStatus,
  to: TournamentStatus,
): boolean {
  return ALLOWED[from].includes(to);
}
