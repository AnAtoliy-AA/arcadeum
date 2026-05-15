'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { useLanguage } from '@/shared/i18n/context';
import {
  fetchPublicTournaments,
  registerForTournament,
  unregisterFromTournament,
  type PublicTournamentsResponse,
} from './api';

export const PUBLIC_TOURNAMENTS_REFRESH_KEY = 'public-tournaments';
export const ADMIN_TOURNAMENTS_REFRESH_KEY = 'admin-tournaments';

export function usePublicTournaments() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const { locale } = useLanguage();
  return useQuery<PublicTournamentsResponse>({
    queryKey: ['public-tournaments', locale, accessToken ?? null],
    queryFn: () => fetchPublicTournaments({ locale, accessToken }),
    refreshKey: PUBLIC_TOURNAMENTS_REFRESH_KEY,
  });
}

export function useRegisterTournament() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<{ ok: true; waitlist: boolean }, { id: string }>({
    mutationFn: ({ id }) => registerForTournament(id, accessToken!),
    onSettled: () => {
      triggerRefresh(PUBLIC_TOURNAMENTS_REFRESH_KEY);
      triggerRefresh(ADMIN_TOURNAMENTS_REFRESH_KEY);
    },
  });
}

export function useUnregisterTournament() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<void, { id: string }>({
    mutationFn: ({ id }) => unregisterFromTournament(id, accessToken!),
    onSettled: () => {
      triggerRefresh(PUBLIC_TOURNAMENTS_REFRESH_KEY);
      triggerRefresh(ADMIN_TOURNAMENTS_REFRESH_KEY);
    },
  });
}
