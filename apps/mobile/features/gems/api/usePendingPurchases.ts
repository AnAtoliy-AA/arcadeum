import { useQuery } from '@tanstack/react-query';
import { resolveApiUrl } from '@/lib/apiBase';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { useSessionTokens } from '@/stores/sessionTokens';

export interface PendingGemPurchase {
  id: string;
  packageId: string;
  packageName: string;
  gems: number;
  paypalOrderId: string;
  approveUrl: string;
  createdAt: string;
}

export function usePendingPurchases() {
  const { tokens, refreshTokens } = useSessionTokens();
  const { accessToken } = tokens;

  return useQuery<PendingGemPurchase[]>({
    queryKey: ['gems', 'pending'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const url = resolveApiUrl('/payments/gems/orders/pending');
      const res = await fetchWithRefresh(
        url,
        { method: 'GET' },
        { accessToken, refreshTokens },
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch pending purchases: ${res.status}`);
      }
      return res.json() as Promise<PendingGemPurchase[]>;
    },
  });
}
