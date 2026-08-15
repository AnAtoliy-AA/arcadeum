'use client';

import { useState } from 'react';
import { Typography, Button } from '@arcadeum/ui';
import { SolanaPayQR } from '@/features/solana-pay/ui/SolanaPayQR';
import { apiClient } from '@/shared/lib/api-client';

const ARC_MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';

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
  const [step, setStep] = useState<'qr' | 'confirming' | 'done' | 'error'>(
    'qr',
  );
  const [error, setError] = useState<string | null>(null);

  const handleConfirmed = async (signature: string) => {
    setStep('confirming');

    try {
      await apiClient.post<{
        inventoryItem: { itemId: string };
        equipped: Record<string, string | null>;
        balance: { coins: number; gems: number; arcadeum: number };
      }>(
        '/shop/purchase-with-wallet',
        {
          itemId,
          purchaseId,
          signature,
          senderAddress: '',
        },
        { token },
      );

      setStep('done');
      onPurchased?.();
    } catch {
      setError('Failed to verify payment');
      setStep('error');
    }
  };

  if (step === 'done') {
    return (
      <div className="box-border flex flex-col items-center p-4 gap-3">
        <Typography className="text-[24px]" variant="body">
          ✓
        </Typography>
        <Typography variant="body" alpha="high">
          Item purchased! Check your inventory.
        </Typography>
        <Button onClick={onCancel} variant="secondary">
          Close
        </Button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="box-border flex flex-col items-center p-4 gap-3">
        <Typography className="text-[#dc2626]" variant="body">
          {error}
        </Typography>
        <Button onClick={onCancel} variant="secondary">
          Close
        </Button>
      </div>
    );
  }

  if (step === 'confirming') {
    return (
      <div className="box-border flex flex-col items-center p-4">
        <Typography variant="body" alpha="medium">
          Verifying payment...
        </Typography>
      </div>
    );
  }

  return (
    <SolanaPayQR
      amount={priceAmount}
      tokenAddress={ARC_MINT}
      onConfirmed={handleConfirmed}
      onCancel={onCancel}
    />
  );
}
