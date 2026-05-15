import type { TournamentStatus } from '../schemas/tournament.schema';

const ALLOWED: Record<TournamentStatus, readonly TournamentStatus[]> = {
  scheduled: ['registration_open', 'cancelled'],
  registration_open: ['live', 'cancelled'],
  live: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function canTransition(
  from: TournamentStatus,
  to: TournamentStatus,
): boolean {
  return ALLOWED[from].includes(to);
}

export function nextStatuses(
  from: TournamentStatus,
): readonly TournamentStatus[] {
  return ALLOWED[from];
}

export function canDelete(status: TournamentStatus): boolean {
  return status === 'scheduled' || status === 'cancelled';
}
