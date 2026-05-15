import { useQuery } from '@tanstack/react-query';
import { resolveApiUrl } from '@/lib/apiBase';

export interface GemPackage {
  id: string;
  name: string;
  gems: number;
  bonusGems: number;
  priceUsd: number;
  currency: string;
  isActive: boolean;
}

export function usePackages() {
  return useQuery<GemPackage[]>({
    queryKey: ['gems', 'packages'],
    queryFn: async () => {
      const url = resolveApiUrl('/payments/gems/packages');
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        throw new Error(`Failed to fetch gem packages: ${res.status}`);
      }
      return res.json() as Promise<GemPackage[]>;
    },
  });
}
