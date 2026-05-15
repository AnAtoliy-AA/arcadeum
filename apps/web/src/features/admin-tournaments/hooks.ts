'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  fetchAdminTournaments,
  createTournament,
  updateTournament,
  transitionTournament,
  deleteTournament,
  type AdminTournamentItem,
  type AdminTournamentsResponse,
  type ListAdminTournamentsArgs,
  type CreateTournamentBody,
  type UpdateTournamentBody,
  type TransitionBody,
} from './api';

export const ADMIN_TOURNAMENTS_REFRESH_KEY = 'admin-tournaments';
export const PUBLIC_TOURNAMENTS_REFRESH_KEY = 'public-tournaments';

function refreshKeys(triggerRefresh: (k: string) => void): void {
  triggerRefresh(ADMIN_TOURNAMENTS_REFRESH_KEY);
  triggerRefresh(PUBLIC_TOURNAMENTS_REFRESH_KEY);
}

export function useAdminTournaments(args: ListAdminTournamentsArgs) {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<AdminTournamentsResponse>({
    queryKey: [
      'admin-tournaments',
      args.page ?? 1,
      args.pageSize ?? 25,
      args.q ?? '',
      args.status ?? 'all',
      args.gameType ?? '',
    ],
    queryFn: () => fetchAdminTournaments(args, accessToken!),
    refreshKey: ADMIN_TOURNAMENTS_REFRESH_KEY,
    enabled: !!accessToken,
  });
}

export function useCreateTournament() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminTournamentItem, CreateTournamentBody>({
    mutationFn: (body) => createTournament(body, accessToken!),
    onSettled: () => refreshKeys(triggerRefresh),
  });
}

export function useUpdateTournament() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<
    AdminTournamentItem,
    { id: string; body: UpdateTournamentBody }
  >({
    mutationFn: ({ id, body }) => updateTournament(id, body, accessToken!),
    onSettled: () => refreshKeys(triggerRefresh),
  });
}

export function useTransitionTournament() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminTournamentItem, { id: string; body: TransitionBody }>(
    {
      mutationFn: ({ id, body }) =>
        transitionTournament(id, body, accessToken!),
      onSettled: () => refreshKeys(triggerRefresh),
    },
  );
}

export function useDeleteTournament() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<void, { id: string }>({
    mutationFn: ({ id }) => deleteTournament(id, accessToken!),
    onSettled: () => refreshKeys(triggerRefresh),
  });
}
