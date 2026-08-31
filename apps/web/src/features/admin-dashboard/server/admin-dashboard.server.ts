import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  AdminDashboardData,
  AdminDbHealth,
  AdminServerMetrics,
} from '../types';

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
    const [pingRes, healthRes, metricsRes] = await Promise.allSettled([
      adminFetch('/admin/ping'),
      adminFetch('/admin/db-health'),
      adminFetch('/admin/server-metrics'),
    ]);

    const pingOk = pingRes.status === 'fulfilled' && pingRes.value.ok;
    let dbHealth: AdminDbHealth | null = null;

    if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
      const parsed = (await healthRes.value.json()) as unknown;
      if (parsed && typeof parsed === 'object' && !('error' in parsed)) {
        dbHealth = parsed as AdminDbHealth;
      }
    }

    let serverMetrics: AdminServerMetrics | null = null;
    if (metricsRes.status === 'fulfilled' && metricsRes.value.ok) {
      serverMetrics = (await metricsRes.value.json()) as AdminServerMetrics;
    }

    return {
      healthy: pingOk,
      pingOk,
      dbHealth,
      serverMetrics,
    };
  } catch {
    return {
      healthy: false,
      pingOk: false,
      dbHealth: null,
      serverMetrics: null,
    };
  }
}
