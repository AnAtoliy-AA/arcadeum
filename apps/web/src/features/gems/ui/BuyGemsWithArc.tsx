'use client';

import { useCallback } from 'react';
import { ArcPurchaseFlow } from '@/features/solana-pay/ui/ArcPurchaseFlow';
import { apiClient } from '@/shared/lib/api-client';

interface BuyGemsWithArcProps {
  packageId: string;
  amount: number;
  token?: string;
  onPurchased?: () => void;
  onCancel?: () => void;
}

export function BuyGemsWithArc({
  packageId,
  amount,
  token,
  onPurchased,
  onCancel,
}: BuyGemsWithArcProps) {
  // The paying wallet is read from the transaction by the backend and bound
  // to this user through the Solana Pay session, so no sender is sent.
  const deliver = useCallback(
    async (signature: string) => {
      await apiClient.post(
        '/payments/gems/orders/arc',
        { packageId, signature },
        { token },
      );
    },
    [packageId, token],
  );

  return (
    <ArcPurchaseFlow
      amount={amount}
      deliver={deliver}
      successKey="successGems"
      onPurchased={onPurchased}
      onCancel={onCancel}
    />
  );
}
