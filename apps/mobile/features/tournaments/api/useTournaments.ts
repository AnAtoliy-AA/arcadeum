import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionTokens } from '@/stores/sessionTokens';
import { fetchPublicTournaments, registerForTournament } from './tournamentApi';

export const TOURNAMENTS_QUERY_KEY = ['tournaments', 'public'] as const;

export function usePublicTournaments() {
  const { tokens } = useSessionTokens();
  const { accessToken } = tokens;

  return useQuery({
    queryKey: TOURNAMENTS_QUERY_KEY,
    queryFn: () => fetchPublicTournaments(accessToken),
  });
}

export function useRegisterForTournament() {
  const { tokens, refreshTokens } = useSessionTokens();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!tokens.accessToken) {
        throw new Error('Not authenticated');
      }
      return registerForTournament(id, tokens.accessToken, refreshTokens);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TOURNAMENTS_QUERY_KEY });
    },
  });
}
