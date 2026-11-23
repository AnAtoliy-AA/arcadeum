import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  EconomyAuditView,
  EconomyKey,
  EconomySettingView,
} from './economy.types';

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  return serverAuthFetch(path, init);
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
