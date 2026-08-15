'use client';

import { useState, useTransition } from 'react';
import { Button } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterConfirmLabels {
  title: string;
  body: string;
  confirm: string;
  cancel: string;
  errors: { insufficientFunds: string };
}

export interface RegisterConfirmProps {
  tournamentId: string;
  entryFeeCoins: number;
  /** Pass null if balance is unknown; dialog will omit the balance line and
   *  let the BE validate. */
  currentBalanceCoins: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRegister: (id: string) => Promise<void>;
  labels: RegisterConfirmLabels;
  walletPath?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterConfirm({
  tournamentId,
  entryFeeCoins,
  currentBalanceCoins,
  open,
  onClose,
  onSuccess,
  onRegister,
  labels,
  walletPath = '/wallet',
}: RegisterConfirmProps) {
  const { locale } = useLanguage();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const hasEnoughBalance =
    currentBalanceCoins === null || currentBalanceCoins >= entryFeeCoins;

  const bodyText =
    currentBalanceCoins !== null
      ? labels.body
          .replace('{fee}', formatNumber(entryFeeCoins, locale))
          .replace('{balance}', formatNumber(currentBalanceCoins, locale))
      : labels.body
          .replace(' Your balance: {balance} coins.', '')
          .replace('{fee}', formatNumber(entryFeeCoins, locale));

  const handleConfirm = () => {
    if (!hasEnoughBalance) {
      setErrorMsg(labels.errors.insufficientFunds);
      return;
    }
    setErrorMsg(null);

    startTransition(async () => {
      try {
        await onRegister(tournamentId);
        onSuccess();
        onClose();
      } catch (err: unknown) {
        // Check for 422 insufficient funds shape from BE
        const body =
          err && typeof err === 'object' && 'body' in err
            ? (err as { body: Record<string, unknown> }).body
            : null;

        const message =
          body && typeof body.message === 'string'
            ? body.message
            : err instanceof Error
              ? err.message
              : '';

        if (message === 'wallet.insufficientFunds') {
          setErrorMsg(labels.errors.insufficientFunds);
        } else {
          setErrorMsg(labels.errors.insufficientFunds);
        }
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
    <div style={OVERLAY_STYLE} data-testid="register-confirm-dialog">
      <div style={DIALOG_STYLE}>
        <div className="flex flex-col items-stretch gap-3">
          <span className="font-bold text-[20px]">{labels.title}</span>

          <span className="text-[14px] opacity-[0.85]">{bodyText}</span>

          {errorMsg && (
            <div className="flex flex-col items-stretch gap-1">
              <span
                className="text-[12px] text-[var(--errorText)]"
                data-testid="register-confirm-error"
              >
                {errorMsg}
              </span>
              {!hasEnoughBalance && (
                <span className="text-[12px]">
                  <a
                    href={walletPath}
                    style={{ color: '#7c8cf8', textDecoration: 'underline' }}
                    data-testid="wallet-link"
                  >
                    Go to wallet
                  </a>
                </span>
              )}
            </div>
          )}

          <div className="flex flex-row items-stretch gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              data-testid="register-confirm-cancel"
            >
              {labels.cancel}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              data-testid="register-confirm-submit"
            >
              {isPending ? '…' : labels.confirm}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
