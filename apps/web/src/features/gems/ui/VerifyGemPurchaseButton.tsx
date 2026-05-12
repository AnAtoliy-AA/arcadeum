'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { finalizeGemPurchaseAction } from '../server/gems.actions';

interface VerifyGemPurchaseButtonProps {
  orderId: string;
}

export function VerifyGemPurchaseButton({
  orderId,
}: VerifyGemPurchaseButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleVerify = () => {
    setInlineError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await finalizeGemPurchaseAction({ orderId });

      if (result.ok) {
        const credited = result.gemsCredited;
        if (credited > 0) {
          setSuccess(`+${credited} gems credited`);
        } else {
          // Already finalized previously
          setSuccess('Purchase already credited');
        }
        router.refresh();
        return;
      }

      if (result.error === 'not_captured') {
        setInlineError(
          'Payment was not captured. Try again or contact support.',
        );
      } else if (result.error === 'not_eligible') {
        setInlineError(
          'This purchase cannot be verified (already failed/cancelled).',
        );
      } else if (result.error === 'not_found') {
        setInlineError('Purchase not found.');
      } else {
        setInlineError('Verification failed. Please try again.');
      }
    });
  };

  if (success) {
    return (
      <span
        data-testid={`verify-success-${orderId}`}
        style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}
      >
        {success}
      </span>
    );
  }

  return (
    <div
      style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}
    >
      <button
        type="button"
        onClick={handleVerify}
        disabled={isPending}
        data-testid={`verify-btn-${orderId}`}
        style={{
          padding: '4px 12px',
          borderRadius: '6px',
          border: '1px solid rgba(124,58,237,0.4)',
          background: isPending ? 'transparent' : 'rgba(124,58,237,0.1)',
          color: isPending ? '#71717a' : '#a78bfa',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        {isPending ? 'Verifying…' : 'Verify'}
      </button>

      {inlineError && (
        <span
          data-testid={`verify-error-${orderId}`}
          style={{ fontSize: '12px', color: '#ef4444' }}
        >
          {inlineError}
        </span>
      )}
    </div>
  );
}
