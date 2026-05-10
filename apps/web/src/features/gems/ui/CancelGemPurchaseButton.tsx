'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelGemPurchaseAction } from '../server/gems.actions';

interface CancelGemPurchaseButtonProps {
  orderId: string;
}

export function CancelGemPurchaseButton({
  orderId,
}: CancelGemPurchaseButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const handleCancel = () => {
    setInlineError(null);

    startTransition(async () => {
      const result = await cancelGemPurchaseAction({ orderId });
      if (result.ok) {
        setCancelled(true);
        router.refresh();
        return;
      }
      setInlineError(
        result.error === 'not_found'
          ? 'Purchase not found.'
          : 'Could not cancel. Please try again.',
      );
    });
  };

  if (cancelled) {
    return (
      <span
        data-testid={`cancel-success-${orderId}`}
        style={{ fontSize: '13px', color: '#71717a' }}
      >
        Cancelled
      </span>
    );
  }

  return (
    <div
      style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}
    >
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        data-testid={`cancel-btn-${orderId}`}
        style={{
          padding: '4px 12px',
          borderRadius: '6px',
          border: '1px solid rgba(113,113,122,0.4)',
          background: 'transparent',
          color: isPending ? '#52525b' : '#a1a1aa',
          cursor: isPending ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        {isPending ? 'Cancelling…' : 'Cancel'}
      </button>

      {inlineError && (
        <span
          data-testid={`cancel-error-${orderId}`}
          style={{ fontSize: '12px', color: '#ef4444' }}
        >
          {inlineError}
        </span>
      )}
    </div>
  );
}
