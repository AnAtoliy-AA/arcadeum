import { apiClient } from '@/shared/lib/api-client';

export interface ChessTournamentStanding {
  userId: string;
  displayName: string | null;
  points: number;
  streak: number;
  wins: number;
  draws: number;
  losses: number;
  rank?: number;
}

export interface ChessTournamentStandingsResponse {
  standings: ChessTournamentStanding[];
}

export async function fetchArenaStandings(
  tournamentId: string,
  accessToken?: string,
): Promise<ChessTournamentStandingsResponse> {
  return apiClient.get<ChessTournamentStandingsResponse>(
    `/chess/tournaments/${encodeURIComponent(tournamentId)}/arena-standings`,
    accessToken ? { token: accessToken } : undefined,
  );
}

export async function fetchSwissStandings(
  tournamentId: string,
  accessToken?: string,
): Promise<ChessTournamentStandingsResponse> {
  return apiClient.get<ChessTournamentStandingsResponse>(
    `/chess/tournaments/${encodeURIComponent(tournamentId)}/swiss-standings`,
    accessToken ? { token: accessToken } : undefined,
  );
}
