import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type { SocialRewardsStatus } from './social-rewards.types';

export async function getSocialRewardsStatus(): Promise<SocialRewardsStatus | null> {
  try {
    const res = await serverAuthFetch('/social-rewards');
    if (!res.ok) return null;
    return (await res.json()) as SocialRewardsStatus;
  } catch {
    return null;
  }
}
