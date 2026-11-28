import { apiClient } from '@/shared/lib/api-client';

/** ARC identifiers served by the backend so web and BE cannot drift. */
export interface ArcConfig {
  mintAddress: string | null;
  poolAddress: string;
  decimals: number;
  configured: boolean;
}

export function getArcConfig(): Promise<ArcConfig> {
  return apiClient.get<ArcConfig>('/solana/config');
}
