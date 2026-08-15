'use client';

import { useState } from 'react';
import { YStack, Typography, Button } from '@arcadeum/ui';
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
      <YStack alignItems="center" padding="$4" gap="$3">
        <Typography variant="body" fontSize={24}>
          ✓
        </Typography>
        <Typography variant="body" alpha="high">
          Payment confirmed! Gems added to your account.
        </Typography>
        <Button onClick={onCancel} variant="secondary">
          Close
        </Button>
      </YStack>
    );
  }

  if (step === 'error') {
    return (
      <YStack alignItems="center" padding="$4" gap="$3">
        <Typography variant="body" color="$red10">
          {error}
        </Typography>
        <Button onClick={onCancel} variant="secondary">
          Close
        </Button>
      </YStack>
    );
  }

  if (step === 'confirming') {
    return (
      <YStack alignItems="center" padding="$4">
        <Typography variant="body" alpha="medium">
          Verifying payment...
        </Typography>
      </YStack>
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
