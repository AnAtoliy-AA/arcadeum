'use client';

import { useState } from 'react';
import { Typography, Button } from '@arcadeum/ui';
import { SolanaPayQR } from '@/features/solana-pay/ui/SolanaPayQR';
import { apiClient } from '@/shared/lib/api-client';

const ARC_MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';

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
  const [step, setStep] = useState<'qr' | 'confirming' | 'done' | 'error'>(
    'qr',
  );
  const [error, setError] = useState<string | null>(null);

  const handleConfirmed = async (signature: string) => {
    setStep('confirming');

    try {
      await apiClient.post(
        '/payments/gems/orders/arc',
        {
          packageId,
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
          Payment confirmed! Gems added to your account.
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
      amount={amount}
      tokenAddress={ARC_MINT}
      onConfirmed={handleConfirmed}
      onCancel={onCancel}
    />
  );
}
