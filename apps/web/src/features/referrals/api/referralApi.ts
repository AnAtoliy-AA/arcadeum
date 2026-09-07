import { resolveApiBase } from '@/shared/lib/api-base';

function api(url: string): string {
  const base = resolveApiBase();
  const separator = url.startsWith('/') ? '' : '/';
  return `${base}${separator}${url}`;
}

export interface ReferralRewardsConfig {
  perFriend: number;
  tier1Bonus: number;
  tier2Bonus: number;
  tier3Bonus: number;
  tiers: Array<{
    tier: number;
    requiredInvites: number;
    rewards: Array<{
      rewardId: string;
      rewardType: string;
      label: string;
    }>;
  }>;
}

export async function fetchReferralRewardsConfig(): Promise<ReferralRewardsConfig> {
  const res = await fetch(api('/referrals/rewards-config'), {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch referral rewards config (${res.status})`);
  }

  return res.json();
}
