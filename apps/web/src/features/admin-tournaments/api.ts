import { apiClient } from '@/shared/lib/api-client';

export type TournamentStatus =
  | 'scheduled'
  | 'registration_open'
  | 'live'
  | 'completed'
  | 'cancelled';
export type TournamentGameType = 'critical_v1' | 'sea_battle_v1';
export type TournamentLocale = 'en' | 'ru' | 'es' | 'fr' | 'by';
export type AdminTournamentStatusFilter = 'all' | TournamentStatus;

export const TOURNAMENT_STATUSES: readonly TournamentStatus[] = [
  'scheduled',
  'registration_open',
  'live',
  'completed',
  'cancelled',
] as const;
export const TOURNAMENT_GAME_TYPES: readonly TournamentGameType[] = [
  'critical_v1',
  'sea_battle_v1',
] as const;
export const TOURNAMENT_LOCALES: readonly TournamentLocale[] = [
  'en',
  'ru',
  'es',
  'fr',
  'by',
] as const;

export interface TournamentLocaleContent {
  name: string;
  description?: string;
}

export type TournamentContentMap = Partial<
  Record<TournamentLocale, TournamentLocaleContent>
> & { en: TournamentLocaleContent };

export interface AdminTournamentItem {
  id: string;
  status: TournamentStatus;
  gameType: TournamentGameType;
  scheduledAt: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  maxPlayers: number;
  prizeDescription: string | null;
  resultText: string | null;
  content: TournamentContentMap;
  registeredCount: number;
  waitlistCount: number;
  createdBy: { id: string; displayName: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTournamentsResponse {
  items: AdminTournamentItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListAdminTournamentsArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: AdminTournamentStatusFilter;
  gameType?: TournamentGameType | null;
}

export interface CreateTournamentBody {
  gameType: TournamentGameType;
  scheduledAt: string;
  registrationOpensAt?: string | null;
  registrationClosesAt?: string | null;
  maxPlayers: number;
  prizeDescription?: string | null;
  content: TournamentContentMap;
}

export type UpdateTournamentBody = Partial<CreateTournamentBody>;

export interface TransitionBody {
  to: TournamentStatus;
  resultText?: string;
}

export function buildAdminTournamentsUrl(
  args: ListAdminTournamentsArgs,
): string {
  const qs = new URLSearchParams();
  if (args.page) qs.set('page', String(args.page));
  if (args.pageSize) qs.set('pageSize', String(args.pageSize));
  if (args.q && args.q.trim()) qs.set('q', args.q);
  if (args.status && args.status !== 'all') qs.set('status', args.status);
  if (args.gameType) qs.set('gameType', args.gameType);
  const s = qs.toString();
  return s ? `/admin/tournaments?${s}` : '/admin/tournaments';
}

export async function fetchAdminTournaments(
  args: ListAdminTournamentsArgs,
  accessToken: string,
): Promise<AdminTournamentsResponse> {
  return apiClient.get<AdminTournamentsResponse>(
    buildAdminTournamentsUrl(args),
    { token: accessToken },
  );
}

export async function createTournament(
  body: CreateTournamentBody,
  accessToken: string,
): Promise<AdminTournamentItem> {
  return apiClient.post<AdminTournamentItem>('/admin/tournaments', body, {
    token: accessToken,
  });
}

export async function updateTournament(
  id: string,
  body: UpdateTournamentBody,
  accessToken: string,
): Promise<AdminTournamentItem> {
  return apiClient.patch<AdminTournamentItem>(
    `/admin/tournaments/${encodeURIComponent(id)}`,
    body,
    { token: accessToken },
  );
}

export async function transitionTournament(
  id: string,
  body: TransitionBody,
  accessToken: string,
): Promise<AdminTournamentItem> {
  return apiClient.post<AdminTournamentItem>(
    `/admin/tournaments/${encodeURIComponent(id)}/transition`,
    body,
    { token: accessToken },
  );
}

export async function deleteTournament(
  id: string,
  accessToken: string,
): Promise<void> {
  await apiClient.delete<void>(`/admin/tournaments/${encodeURIComponent(id)}`, {
    token: accessToken,
  });
}
