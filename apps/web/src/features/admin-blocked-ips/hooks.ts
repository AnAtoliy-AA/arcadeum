'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  fetchBlockedIps,
  unblockIp,
  clearAllBlockedIps,
  type BlockedIp,
} from './api';

export const ADMIN_BLOCKED_IPS_REFRESH_KEY = 'admin-blocked-ips';

export function useBlockedIps() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<BlockedIp[]>({
    queryKey: ['admin-blocked-ips'],
    queryFn: () => fetchBlockedIps(accessToken!),
    refreshKey: ADMIN_BLOCKED_IPS_REFRESH_KEY,
    enabled: !!accessToken,
  });
}

export function useUnblockIp() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<{ ok: boolean }, { ip: string }>({
    mutationFn: ({ ip }) => unblockIp(ip, accessToken!),
    onSettled: () => triggerRefresh(ADMIN_BLOCKED_IPS_REFRESH_KEY),
  });
}

export function useClearAllBlockedIps() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<{ ok: boolean }, void>({
    mutationFn: () => clearAllBlockedIps(accessToken!),
    onSettled: () => triggerRefresh(ADMIN_BLOCKED_IPS_REFRESH_KEY),
  });
}
