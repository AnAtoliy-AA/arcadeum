'use client';

import { useTransition } from 'react';
import { buyGemsAction } from '../server/gems.actions';

interface BuyGemsButtonProps {
  packageId: string;
  label?: string;
  isAuthenticated?: boolean;
}

export function BuyGemsButton({
  packageId,
  label = 'Buy with PayPal',
  isAuthenticated = true,
}: BuyGemsButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isAuthenticated) {
      window.location.href = '/auth';
      return;
    }

    startTransition(async () => {
      const result = await buyGemsAction({ packageId });

      if (result.ok) {
        window.location.href = result.approveUrl;
        return;
      }

      if (result.error === 'unauthorized') {
        window.location.href = '/auth';
        return;
      }

      // Show a brief inline message for now — no toast library dependency
      const messages: Record<string, string> = {
        not_found: 'Package not found.',
        inactive: 'This package is no longer available.',
        unavailable: 'PayPal is unavailable. Please try again later.',
        generic: 'Something went wrong. Please try again.',
      };
      const msg = messages[result.error] ?? messages.generic;
      alert(msg); // noqa: no-alert intentional for now; replace with toast later
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      data-testid={`buy-gems-btn-${packageId}`}
      style={{
        width: '100%',
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        background: isPending ? '#3f3f46' : '#0070ba',
        color: '#fff',
        cursor: isPending ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'background 0.15s',
      }}
    >
      {isPending ? 'Redirecting…' : label}
    </button>
  );
}
