import { useQuery } from '@/shared/hooks/useQuery';
import { referralsApi } from '../api';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

export function useCosmeticBadges() {
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? undefined;

  return useQuery({
    queryKey: ['cosmetic-badges', token],
    queryFn: async () => {
      const stats = await referralsApi.getStats({ token });
      return stats.rewards
        .filter((r) => r.rewardType === 'badge')
        .map((r) => r.rewardId);
    },
    enabled: !!token,
    refreshKey: 'referral-stats', // Shared with referral stats to sync updates
  });
}
