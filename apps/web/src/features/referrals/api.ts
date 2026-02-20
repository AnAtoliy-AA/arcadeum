import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';
import type { ReferralStats } from './types';

export const referralsApi = {
  getStats: async (options?: ApiClientOptions): Promise<ReferralStats> => {
    return apiClient.get<ReferralStats>('/referrals/stats', options);
  },

  getCode: async (
    options?: ApiClientOptions,
  ): Promise<{ referralCode: string }> => {
    return apiClient.get<{ referralCode: string }>('/referrals/code', options);
  },
};
