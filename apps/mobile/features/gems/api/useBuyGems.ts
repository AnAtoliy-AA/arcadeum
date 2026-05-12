/**
 * CONCERN: The redirect URL `arcadeum://payment-return` is hard-coded below.
 * In production this should be sourced from the app scheme (APP_SCHEME env var, which
 * defaults to "mobile") and ideally match the BE's PAYPAL_RETURN_URL config.
 * Track under ARC-617 follow-up: wire EXPO_PUBLIC_PAYPAL_REDIRECT_URL or derive from
 * Linking.createURL('payment/return') once the deep-link handler is in place.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { resolveApiUrl } from '@/lib/apiBase';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useFinalizeGemPurchase } from './useFinalizeGemPurchase';

const PAYPAL_REDIRECT_URL =
  (process.env.EXPO_PUBLIC_PAYPAL_REDIRECT_URL as string | undefined) ??
  'arcadeum://payment-return';

interface CreateOrderResponse {
  approveUrl: string;
  paypalOrderId: string;
  orderId: string;
}

export type BuyGemsResult =
  | { status: 'success'; gems: number; balanceAfter: number }
  | { status: 'pending'; orderId: string };

function extractOrderIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return (
      parsed.searchParams.get('orderId') ??
      parsed.searchParams.get('token') ??
      null
    );
  } catch {
    return null;
  }
}

export function useBuyGems() {
  const { tokens, refreshTokens } = useSessionTokens();
  const { accessToken } = tokens;
  const queryClient = useQueryClient();
  const finalizeMutation = useFinalizeGemPurchase();

  return useMutation<BuyGemsResult, Error, string>({
    mutationFn: async (packageId: string) => {
      // Step 1: Create order
      const createUrl = resolveApiUrl('/payments/gems/orders');
      const createRes = await fetchWithRefresh(
        createUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId }),
        },
        { accessToken, refreshTokens },
      );
      if (!createRes.ok) {
        throw new Error(`Failed to create gem order: ${createRes.status}`);
      }
      const order = (await createRes.json()) as CreateOrderResponse;

      // Step 2: Open PayPal approval URL
      const browserResult = await WebBrowser.openAuthSessionAsync(
        order.approveUrl,
        PAYPAL_REDIRECT_URL,
      );

      // Step 3: Handle result
      if (browserResult.type === 'success') {
        const orderId =
          extractOrderIdFromUrl(browserResult.url) ??
          order.orderId ??
          order.paypalOrderId;

        const finalizeResult = await finalizeMutation.mutateAsync(orderId);
        void queryClient.invalidateQueries({ queryKey: ['wallet'] });
        void queryClient.invalidateQueries({ queryKey: ['gems', 'pending'] });
        return {
          status: 'success',
          gems: finalizeResult.gems,
          balanceAfter: finalizeResult.balanceAfter,
        };
      }

      // Cancelled: purchase stays pending, user can verify via banner
      return {
        status: 'pending',
        orderId: order.orderId ?? order.paypalOrderId,
      };
    },
  });
}
