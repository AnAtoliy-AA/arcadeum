import { useQuery } from '@tanstack/react-query';
import { referralsApi } from '../api';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

export function useCosmeticBadges() {
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? undefined;

  return useQuery({
    queryKey: ['cosmetic-badges'],
    queryFn: async () => {
      const stats = await referralsApi.getStats({ token });
      return stats.rewards
        .filter((r) => r.rewardType === 'badge')
        .map((r) => r.rewardId);
    },
    enabled: !!token,
    staleTime: 60_000,
  });
}
