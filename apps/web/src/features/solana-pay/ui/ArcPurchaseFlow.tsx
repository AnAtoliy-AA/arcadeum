'use client';

import { useCallback, useRef, useState } from 'react';
import { Typography, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { SolanaPayQR } from './SolanaPayQR';
import { useArcConfig } from '../hooks/useArcConfig';
import { arcErrorKey, isRetryableArcError } from '../lib/arc-errors';

type Step = 'qr' | 'confirming' | 'done' | 'error';

interface ArcPurchaseFlowProps {
  amount: number;
  /** Delivers the goods for a confirmed payment signature. Must be idempotent. */
  deliver: (signature: string) => Promise<void>;
  successKey: 'successGems' | 'successItem';
  onPurchased?: () => void;
  onCancel?: () => void;
}

/**
 * Pay with ARC end to end: Solana Pay QR, wait for confirmation, then ask the
 * backend to deliver. The token comes from the backend config (never a copy
 * in the web bundle). A retryable failure retries the SAME signature, so the
 * user never pays twice, and a ref guard stops double submits.
 */
export function ArcPurchaseFlow({
  amount,
  deliver,
  successKey,
  onPurchased,
  onCancel,
}: ArcPurchaseFlowProps) {
  const { t } = useTranslation();
  const { config, loading, error: configError } = useArcConfig();
  const [step, setStep] = useState<Step>('qr');
  const [errorKey, setErrorKey] =
    useState<ReturnType<typeof arcErrorKey>>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const run = useCallback(
    async (sig: string) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setSignature(sig);
      setStep('confirming');
      try {
        await deliver(sig);
        setStep('done');
        onPurchased?.();
      } catch (err) {
        setErrorKey(arcErrorKey(err));
        setStep('error');
      } finally {
        inFlightRef.current = false;
      }
    },
    [deliver, onPurchased],
  );

  if (step === 'done') {
    return (
      <div
        className="flex flex-col items-center p-4 gap-3"
        data-testid="arc-purchase-done"
      >
        <Typography className={'text-[24px]'} variant="body">
          ✓
        </Typography>
        <Typography variant="body" alpha="high">
          {t(`wallet.arcCheckout.${successKey}`)}
        </Typography>
        <Button onClick={onCancel} variant="secondary">
          {t('wallet.arcCheckout.close')}
        </Button>
      </div>
    );
  }

  if (step === 'error') {
    // Unknown errors are retried too: delivery is idempotent per signature.
    const canRetry = errorKey === null || isRetryableArcError(errorKey);
    return (
      <div
        className="flex flex-col items-center p-4 gap-3"
        data-testid="arc-purchase-error"
        role="alert"
      >
        <Typography className={'text-[#dc2626] text-center'} variant="body">
          {errorKey
            ? t(`wallet.arcCheckout.errors.${errorKey}`)
            : t('wallet.arcCheckout.errorGeneric')}
        </Typography>
        {canRetry && signature && (
          <Button onClick={() => void run(signature)}>
            {t('wallet.arcCheckout.retry')}
          </Button>
        )}
        <Button onClick={onCancel} variant="secondary">
          {t('wallet.arcCheckout.close')}
        </Button>
      </div>
    );
  }

  if (step === 'confirming') {
    return (
      <div className="flex flex-col items-center p-4" role="status">
        <Typography variant="body" alpha="high">
          {t('wallet.arcCheckout.verifying')}
        </Typography>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center p-4" role="status">
        <Typography variant="body" alpha="high">
          {t('wallet.arcCheckout.creating')}
        </Typography>
      </div>
    );
  }

  if (configError || !config?.configured || !config.mintAddress) {
    return (
      <div
        className="flex flex-col items-center p-4 gap-3"
        data-testid="arc-purchase-unavailable"
        role="alert"
      >
        <Typography className={'text-[#dc2626] text-center'} variant="body">
          {t('wallet.arcCheckout.errors.notConfigured')}
        </Typography>
        <Button onClick={onCancel} variant="secondary">
          {t('wallet.arcCheckout.close')}
        </Button>
      </div>
    );
  }

  return (
    <SolanaPayQR
      amount={amount}
      tokenAddress={config.mintAddress}
      onConfirmed={(sig) => void run(sig)}
      onCancel={onCancel}
    />
  );
}
