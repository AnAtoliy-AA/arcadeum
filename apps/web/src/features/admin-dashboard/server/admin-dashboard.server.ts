import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { AdminDashboardData, AdminDbHealth } from '../types';

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('access_token')?.value;
  const url = resolveApiUrl(path);

  return fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    const [pingRes, healthRes] = await Promise.allSettled([
      adminFetch('/admin/ping'),
      adminFetch('/admin/db-health'),
    ]);

    const pingOk = pingRes.status === 'fulfilled' && pingRes.value.ok;
    let dbHealth: AdminDbHealth | null = null;

    if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
      const parsed = (await healthRes.value.json()) as unknown;
      if (parsed && typeof parsed === 'object' && !('error' in parsed)) {
        dbHealth = parsed as AdminDbHealth;
      }
    }

    return {
      healthy: pingOk,
      pingOk,
      dbHealth,
    };
  } catch {
    return {
      healthy: false,
      pingOk: false,
      dbHealth: null,
    };
  }
}
