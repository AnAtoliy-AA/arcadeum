'use client';

import { createPortal } from 'react-dom';
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
    <div
      className="flex flex-col fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.9)] z-[9999] p-4 items-center justify-center overflow-scroll"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="flex flex-col items-stretch bg-[rgba(20,20,30,0.98)] rounded-2xl border border-[rgba(124,58,237,0.3)] p-4 w-full max-w-[360px]">
        <BuyItemWithArc
          itemId={itemId}
          priceAmount={arcPrice}
          purchaseId={purchaseId}
          token={token}
          onPurchased={onPurchased}
          onCancel={onCancel}
        />
      </div>
    </div>,
    document.body,
  );
}
