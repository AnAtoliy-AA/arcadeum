import { useQuery } from '@tanstack/react-query';
import { referralsApi } from '../api';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

export function useReferralStats() {
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken ?? undefined;

  return useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => referralsApi.getStats({ token }),
    enabled: !!token,
    staleTime: 30_000,
  });
}
