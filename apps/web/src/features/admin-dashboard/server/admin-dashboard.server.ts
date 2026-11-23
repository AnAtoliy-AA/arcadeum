import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  AdminDashboardData,
  AdminDbHealth,
  AdminServerMetrics,
} from '../types';

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  return serverAuthFetch(path, init);
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
