import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveApiUrl } from '@/lib/apiBase';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { useSessionTokens } from '@/stores/sessionTokens';

export interface ConvertGemsPayload {
  gems: number;
  conversionId: string;
}

export interface ConvertGemsResult {
  gemsDebited: number;
  coinscredited: number;
  balanceAfter: { coins: number; gems: number };
}

export function useConvertGems() {
  const { tokens, refreshTokens } = useSessionTokens();
  const { accessToken } = tokens;
  const queryClient = useQueryClient();

  return useMutation<ConvertGemsResult, Error, ConvertGemsPayload>({
    mutationFn: async (payload: ConvertGemsPayload) => {
      const url = resolveApiUrl('/wallet/convert-gems-to-coins');
      const res = await fetchWithRefresh(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { accessToken, refreshTokens },
      );
      if (!res.ok) {
        throw new Error(`Failed to convert gems: ${res.status}`);
      }
      return res.json() as Promise<ConvertGemsResult>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}
