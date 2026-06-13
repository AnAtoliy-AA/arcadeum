import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { BattlePassState, ClaimResult } from './battle-pass.types';

export class BattlePassUnauthorizedError extends Error {
  constructor() {
    super('Battle Pass fetch unauthorized (401)');
    this.name = 'BattlePassUnauthorizedError';
  }
}

async function fetchWithAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
  const url = resolveApiUrl(path);

  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new BattlePassUnauthorizedError();
    }
    const body = await res.text();
    throw new Error(`Battle Pass fetch failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

export async function getBattlePassState(): Promise<BattlePassState> {
  return fetchWithAuth<BattlePassState>('/battle-pass');
}

export async function claimBattlePassTier(tier: number): Promise<ClaimResult> {
  return fetchWithAuth<ClaimResult>('/battle-pass/claim', {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });
}
