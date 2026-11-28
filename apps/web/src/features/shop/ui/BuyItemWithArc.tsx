'use client';

import { useCallback } from 'react';
import { ArcPurchaseFlow } from '@/features/solana-pay/ui/ArcPurchaseFlow';
import { apiClient } from '@/shared/lib/api-client';

interface BuyItemWithArcProps {
  itemId: string;
  priceAmount: number;
  purchaseId: string;
  token?: string;
  onPurchased?: () => void;
  onCancel?: () => void;
}

export function BuyItemWithArc({
  itemId,
  priceAmount,
  purchaseId,
  token,
  onPurchased,
  onCancel,
}: BuyItemWithArcProps) {
  const deliver = useCallback(
    async (signature: string) => {
      await apiClient.post(
        '/shop/purchase-with-wallet',
        { itemId, purchaseId, signature },
        { token },
      );
    },
    [itemId, purchaseId, token],
  );

  return (
    <ArcPurchaseFlow
      amount={priceAmount}
      deliver={deliver}
      successKey="successItem"
      onPurchased={onPurchased}
      onCancel={onCancel}
    />
  );
}
