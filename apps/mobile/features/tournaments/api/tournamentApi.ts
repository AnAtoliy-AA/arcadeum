import { resolveApiUrl } from '@/lib/apiBase';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';

export type TournamentStatus =
  | 'scheduled'
  | 'registration_open'
  | 'live'
  | 'completed'
  | 'cancelled';

export type EffectiveTournamentStatus =
  | TournamentStatus
  | 'registration_closed'
  | 'awaiting_results';

export type TournamentGameType = 'critical_v1' | 'sea_battle_v1';

export interface PublicTournamentItem {
  id: string;
  gameType: TournamentGameType;
  scheduledAt: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  maxPlayers: number;
  prizeDescription: string | null;
  resultText: string | null;
  entryFeeCoins: number;
  prizePoolCoins: number;
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

export async function fetchPublicTournaments(
  accessToken?: string | null,
): Promise<PublicTournamentsResponse> {
  const url = resolveApiUrl('/tournaments');
  const res = await fetchWithRefresh(url, { method: 'GET' }, { accessToken });
  if (!res.ok) {
    throw new Error(`Failed to fetch tournaments: ${res.status}`);
  }
  return res.json() as Promise<PublicTournamentsResponse>;
}

export async function registerForTournament(
  id: string,
  accessToken: string,
  refreshTokens?: () => Promise<unknown>,
): Promise<{ ok: true; waitlist: boolean }> {
  const url = resolveApiUrl(`/tournaments/${encodeURIComponent(id)}/register`);
  const res = await fetchWithRefresh(
    url,
    { method: 'POST' },
    {
      accessToken,
      refreshTokens: refreshTokens as
        | (() => Promise<
            import('@/stores/sessionTokens').SessionTokensSnapshot
          >)
        | undefined,
      suppressErrorToast: true,
    },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(
      (body as { message?: string }).message ??
        `Register failed: ${res.status}`,
    );
    (err as Error & { status: number; body: unknown }).status = res.status;
    (err as Error & { status: number; body: unknown }).body = body;
    throw err;
  }
  return res.json() as Promise<{ ok: true; waitlist: boolean }>;
}
