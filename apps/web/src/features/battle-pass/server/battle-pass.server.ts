import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type { BattlePassState, ClaimResult } from './battle-pass.types';

export class BattlePassUnauthorizedError extends Error {
  constructor() {
    super('Battle Pass fetch unauthorized (401)');
    this.name = 'BattlePassUnauthorizedError';
  }
}

async function fetchWithAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await serverAuthFetch(path, init);

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
