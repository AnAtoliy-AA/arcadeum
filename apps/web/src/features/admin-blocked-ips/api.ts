import { apiClient } from '@/shared/lib/api-client';

export interface BlockedIp {
  ip: string;
  expiresAt: number;
  reason: string;
}

export async function fetchBlockedIps(
  accessToken: string,
): Promise<BlockedIp[]> {
  return apiClient.get<BlockedIp[]>('/admin/blocked-ips', {
    token: accessToken,
  });
}

export async function unblockIp(
  ip: string,
  accessToken: string,
): Promise<{ ok: boolean }> {
  return apiClient.delete<{ ok: boolean }>(
    `/admin/blocked-ips/${encodeURIComponent(ip)}`,
    { token: accessToken },
  );
}

export async function clearAllBlockedIps(
  accessToken: string,
): Promise<{ ok: boolean }> {
  return apiClient.delete<{ ok: boolean }>('/admin/blocked-ips', {
    token: accessToken,
  });
}
