import { useQuery } from '@/shared/hooks/useQuery';
import { referralsApi } from '../api';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

export function useReferralStats() {
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? undefined;

  return useQuery({
    queryKey: ['referral-stats', token],
    queryFn: () => referralsApi.getStats({ token }),
    enabled: !!token,
    refreshKey: 'referral-stats',
  });
}
