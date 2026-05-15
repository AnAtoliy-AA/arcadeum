import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveApiUrl } from '@/lib/apiBase';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { useSessionTokens } from '@/stores/sessionTokens';

export interface FinalizeGemPurchaseResult {
  id: string;
  gems: number;
  balanceAfter: number;
}

export function useFinalizeGemPurchase() {
  const { tokens, refreshTokens } = useSessionTokens();
  const { accessToken } = tokens;
  const queryClient = useQueryClient();

  return useMutation<FinalizeGemPurchaseResult, Error, string>({
    mutationFn: async (orderId: string) => {
      const url = resolveApiUrl(`/payments/gems/orders/${orderId}/finalize`);
      const res = await fetchWithRefresh(
        url,
        { method: 'POST' },
        { accessToken, refreshTokens },
      );
      if (!res.ok) {
        throw new Error(`Failed to finalize gem purchase: ${res.status}`);
      }
      return res.json() as Promise<FinalizeGemPurchaseResult>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
      void queryClient.invalidateQueries({ queryKey: ['gems', 'pending'] });
    },
  });
}
