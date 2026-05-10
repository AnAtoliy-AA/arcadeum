import { useQuery } from '@tanstack/react-query';
import { resolveApiUrl } from '@/lib/apiBase';

export interface ConversionRate {
  gemsPerCoin: number;
  /** How many coins you get per gem (inverse of gemsPerCoin). */
  coinsPerGem: number;
}

export function useConversionRate() {
  return useQuery<ConversionRate>({
    queryKey: ['gems', 'rate'],
    queryFn: async () => {
      const url = resolveApiUrl('/wallet/conversion-rate');
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error(`Failed to fetch conversion rate: ${res.status}`);
      }
      return res.json() as Promise<ConversionRate>;
    },
  });
}
