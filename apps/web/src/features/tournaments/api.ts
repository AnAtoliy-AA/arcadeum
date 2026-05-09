import { apiClient } from '@/shared/lib/api-client';
import type {
  TournamentGameType,
  TournamentStatus,
} from '@/features/admin-tournaments/api';

export type EffectiveTournamentStatus =
  | TournamentStatus
  | 'registration_closed'
  | 'awaiting_results';

export interface PublicTournamentItem {
  id: string;
  gameType: TournamentGameType;
  scheduledAt: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  maxPlayers: number;
  prizeDescription: string | null;
  resultText: string | null;
  status: TournamentStatus;
  effectiveStatus: EffectiveTournamentStatus;
  registeredCount: number;
  waitlistCount: number;
  isRegistered: boolean;
  isWaitlisted: boolean;
  name: string;
  description?: string;
}

export interface PublicTournamentsResponse {
  items: PublicTournamentItem[];
  total: number;
}

export interface FetchPublicTournamentsOptions {
  locale?: string;
  accessToken?: string | null;
}

export function buildPublicTournamentsUrl(
  opts: FetchPublicTournamentsOptions,
): string {
  const qs = new URLSearchParams();
  if (opts.locale) qs.set('locale', opts.locale);
  const s = qs.toString();
  return s ? `/tournaments?${s}` : '/tournaments';
}

export async function fetchPublicTournaments(
  opts: FetchPublicTournamentsOptions,
): Promise<PublicTournamentsResponse> {
  return apiClient.get<PublicTournamentsResponse>(
    buildPublicTournamentsUrl(opts),
    opts.accessToken ? { token: opts.accessToken } : undefined,
  );
}

export async function registerForTournament(
  id: string,
  accessToken: string,
): Promise<{ ok: true; waitlist: boolean }> {
  return apiClient.post<{ ok: true; waitlist: boolean }>(
    `/tournaments/${encodeURIComponent(id)}/register`,
    undefined,
    { token: accessToken },
  );
}

export async function unregisterFromTournament(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete<void>(
    `/tournaments/${encodeURIComponent(id)}/register`,
    { token: accessToken },
  );
}
