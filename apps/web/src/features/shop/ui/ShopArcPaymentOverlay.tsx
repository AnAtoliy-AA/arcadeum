'use client';

import { createPortal } from 'react-dom';
import { YStack } from '@arcadeum/ui';
import { BuyItemWithArc } from './BuyItemWithArc';

interface ShopArcPaymentOverlayProps {
  itemId: string;
  arcPrice: number;
  purchaseId: string;
  token?: string;
  onPurchased: () => void;
  onCancel: () => void;
}

export function ShopArcPaymentOverlay({
  itemId,
  arcPrice,
  purchaseId,
  token,
  onPurchased,
  onCancel,
}: ShopArcPaymentOverlayProps) {
  return createPortal(
    <YStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.9)"
      zIndex={9999}
      padding="$4"
      alignItems="center"
      justifyContent="center"
      overflow="scroll"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <YStack
        backgroundColor="rgba(20,20,30,0.98)"
        borderRadius="$4"
        borderWidth={1}
        borderColor="rgba(124,58,237,0.3)"
        padding="$4"
        width="100%"
        maxWidth={360}
      >
        <BuyItemWithArc
          itemId={itemId}
          priceAmount={arcPrice}
          purchaseId={purchaseId}
          token={token}
          onPurchased={onPurchased}
          onCancel={onCancel}
        />
      </YStack>
    </YStack>,
    document.body,
  );
}
