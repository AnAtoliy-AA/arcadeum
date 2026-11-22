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
  fetchSeaBattleBlitzStatus,
  toggleSeaBattleBlitz,
  type AdminTournamentItem,
  type AdminTournamentsResponse,
  type ListAdminTournamentsArgs,
  type CreateTournamentBody,
  type UpdateTournamentBody,
  type TransitionBody,
  type SeaBattleBlitzStatusResponse,
  type ToggleSeaBattleBlitzResponse,
  type UpdateSeaBattleBlitzConfigBody,
} from './api';

export const ADMIN_TOURNAMENTS_REFRESH_KEY = 'admin-tournaments';
export const PUBLIC_TOURNAMENTS_REFRESH_KEY = 'public-tournaments';
export const ADMIN_BLITZ_STATUS_REFRESH_KEY = 'admin-blitz-status';

function refreshKeys(triggerRefresh: (k: string) => void): void {
  triggerRefresh(ADMIN_TOURNAMENTS_REFRESH_KEY);
  triggerRefresh(PUBLIC_TOURNAMENTS_REFRESH_KEY);
}

export function useAdminTournaments(
  args: ListAdminTournamentsArgs,
  options?: { onSuccess?: (data: AdminTournamentsResponse) => void },
) {
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
    onSuccess: options?.onSuccess,
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

export function useSeaBattleBlitzAdminStatus() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<SeaBattleBlitzStatusResponse>({
    queryKey: ['admin-sea-battle-blitz-status'],
    queryFn: () => fetchSeaBattleBlitzStatus(accessToken!),
    refreshKey: ADMIN_BLITZ_STATUS_REFRESH_KEY,
    enabled: !!accessToken,
  });
}

export function useToggleSeaBattleBlitz() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<ToggleSeaBattleBlitzResponse, { enabled: boolean }>({
    mutationFn: ({ enabled }) => toggleSeaBattleBlitz(enabled, accessToken!),
    onSettled: () => {
      triggerRefresh(ADMIN_BLITZ_STATUS_REFRESH_KEY);
      refreshKeys(triggerRefresh);
    },
  });
}

export function useUpdateSeaBattleBlitzConfig() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<
    ToggleSeaBattleBlitzResponse,
    UpdateSeaBattleBlitzConfigBody
  >({
    mutationFn: (body) => toggleSeaBattleBlitz(body, accessToken!),
    onSettled: () => {
      triggerRefresh(ADMIN_BLITZ_STATUS_REFRESH_KEY);
      refreshKeys(triggerRefresh);
    },
  });
}
