'use client';

import { useState, useTransition } from 'react';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import type { TournamentStatus } from '@/features/admin-tournaments/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UnregisterConfirmLabels {
  refund: string;
  title: string;
  body: string;
  confirm: string;
  cancelButton: string;
}

export interface UnregisterConfirmProps {
  tournamentId: string;
  entryFeeCoins: number;
  status: TournamentStatus;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUnregister: (id: string) => Promise<void>;
  labels: UnregisterConfirmLabels;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function willRefund(status: TournamentStatus, entryFeeCoins: number): boolean {
  return (
    entryFeeCoins > 0 &&
    (status === 'scheduled' || status === 'registration_open')
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UnregisterConfirm({
  tournamentId,
  entryFeeCoins,
  status,
  open,
  onClose,
  onSuccess,
  onUnregister,
  labels,
}: UnregisterConfirmProps) {
  const { locale } = useLanguage();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const showRefund = willRefund(status, entryFeeCoins);
  const refundText = labels.refund.replace(
    '{amount}',
    formatNumber(entryFeeCoins, locale),
  );

  const handleConfirm = () => {
    setErrorMsg(null);

    startTransition(async () => {
      try {
        await onUnregister(tournamentId);
        onSuccess();
        onClose();
      } catch {
        setErrorMsg('Something went wrong. Please try again.');
      }
    });
  };

  const OVERLAY_STYLE: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const DIALOG_STYLE: React.CSSProperties = {
    background: '#1a1a2e',
    border: '1px solid #444',
    borderRadius: 12,
    padding: 24,
    minWidth: 340,
    maxWidth: 460,
  };

  return (
    <div style={OVERLAY_STYLE} data-testid="unregister-confirm-dialog">
      <div style={DIALOG_STYLE}>
        <YStack gap="$3">
          <Text fontWeight="700" fontSize="$5">
            {labels.title}
          </Text>

          <Text fontSize="$2" opacity={0.85}>
            {labels.body}
          </Text>

          {showRefund && (
            <Text
              fontSize="$2"
              color="$successText"
              data-testid="refund-notice"
            >
              {refundText}
            </Text>
          )}

          {errorMsg && (
            <Text
              fontSize="$1"
              color="$errorText"
              data-testid="unregister-confirm-error"
            >
              {errorMsg}
            </Text>
          )}

          <XStack gap="$3" justifyContent="flex-end" paddingTop="$2">
            <Button
              variant="outline"
              onPress={onClose}
              disabled={isPending}
              data-testid="unregister-confirm-cancel"
            >
              {labels.cancelButton}
            </Button>
            <Button
              onPress={handleConfirm}
              disabled={isPending}
              data-testid="unregister-confirm-submit"
            >
              {isPending ? '…' : labels.confirm}
            </Button>
          </XStack>
        </YStack>
      </div>
    </div>
  );
}
