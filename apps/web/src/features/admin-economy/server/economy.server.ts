import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  EconomyAuditView,
  EconomyKey,
  EconomySettingView,
} from './economy.types';

// ─── Internal fetch helper ────────────────────────────────────────────────────

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

// ─── Server-side data fetchers ────────────────────────────────────────────────

export async function listEconomySettings(): Promise<EconomySettingView[]> {
  const res = await adminFetch('/admin/economy');
  if (!res.ok) throw new Error(`listEconomySettings failed: ${res.status}`);
  return (await res.json()) as EconomySettingView[];
}

export async function getEconomyAudit(
  key: EconomyKey,
): Promise<EconomyAuditView[]> {
  const res = await adminFetch(
    `/admin/economy/${encodeURIComponent(key)}/audit`,
  );
  if (!res.ok) throw new Error(`getEconomyAudit failed: ${res.status}`);
  return (await res.json()) as EconomyAuditView[];
}
