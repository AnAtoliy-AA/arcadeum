const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export interface EffectiveWindow {
  registrationOpensAt: Date;
  registrationClosesAt: Date;
}

export function deriveEffectiveWindow(
  scheduledAt: Date,
  opens: Date | null | undefined,
  closes: Date | null | undefined,
): EffectiveWindow {
  return {
    registrationOpensAt:
      opens ?? new Date(scheduledAt.getTime() - SEVEN_DAYS_MS),
    registrationClosesAt:
      closes ?? new Date(scheduledAt.getTime() - ONE_HOUR_MS),
  };
}

export type EffectiveTournamentStatus =
  | 'scheduled'
  | 'registration_open'
  | 'registration_closed'
  | 'live'
  | 'awaiting_results'
  | 'completed'
  | 'cancelled';

export function deriveEffectiveStatus(args: {
  status:
    | 'scheduled'
    | 'registration_open'
    | 'live'
    | 'completed'
    | 'cancelled';
  scheduledAt: Date;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  now: Date;
}): EffectiveTournamentStatus {
  if (args.status === 'completed') return 'completed';
  if (args.status === 'cancelled') return 'cancelled';
  const window = deriveEffectiveWindow(
    args.scheduledAt,
    args.registrationOpensAt,
    args.registrationClosesAt,
  );
  if (args.status === 'live') return 'live';
  if (args.now < window.registrationOpensAt) return 'scheduled';
  if (args.now < window.registrationClosesAt) return 'registration_open';
  if (args.now < args.scheduledAt) return 'registration_closed';
  return 'awaiting_results';
}
