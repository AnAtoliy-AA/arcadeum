import { apiClient } from '@/shared/lib/api-client';

export interface SolanaPayRequest {
  sessionId: string;
  solanaPayUrl: string;
  amount: number;
  tokenAddress: string;
  recipient: string;
  reference: string;
}

export interface SolanaPayStatus {
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  signature?: string;
  /** Confirmed after the request window closed. */
  late?: boolean;
  /** Machine readable cause when `failed`. */
  reason?: string;
}

export type ArcPriceStatus = 'ok' | 'stale' | 'unavailable' | 'unconfigured';

export interface ArcPricing {
  arcUsdPrice: number;
  /** Anything but `ok` means the price must not be shown or used. */
  priceStatus: ArcPriceStatus;
  priceSource: string | null;
  priceAgeSeconds: number | null;
  gemToUsdRate: number;
  discountPercent: number;
  gemsAllowArc: boolean;
  shopAllowArc: boolean;
}

export async function createSolanaPayRequest(
  amount: number,
  tokenAddress: string,
  token?: string,
): Promise<SolanaPayRequest> {
  return apiClient.post<SolanaPayRequest>(
    '/solana/pay/create',
    { amount, tokenAddress },
    { token },
  );
}

export async function getSolanaPayStatus(
  sessionId: string,
  token?: string,
): Promise<SolanaPayStatus> {
  return apiClient.get<SolanaPayStatus>(`/solana/pay/status/${sessionId}`, {
    token,
  });
}

export async function getArcPricing(): Promise<ArcPricing> {
  return apiClient.get<ArcPricing>('/solana/pricing');
}
