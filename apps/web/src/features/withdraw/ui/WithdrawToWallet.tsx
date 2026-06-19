'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';
import { usePhantom } from '../lib/usePhantom';
import { submitWithdrawal } from '../server/withdraw.server';

const WITHDRAWAL_FEE_PERCENT = 2;

interface Props {
  arcadeumBalance: number;
  locale?: Locale;
}

export function WithdrawToWallet({
  arcadeumBalance,
  locale = DEFAULT_LOCALE,
}: Props) {
  const { t } = useTranslation(locale);
  const wallet = t.wallet;
  const {
    publicKey,
    isConnected,
    isConnecting,
    error: phantomError,
    connect,
    disconnect,
  } = usePhantom(locale);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    signature: string;
    amount: number;
    fee: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount) || 0;
  const fee = Math.ceil((numericAmount * WITHDRAWAL_FEE_PERCENT) / 100);
  const totalDeduction = numericAmount + fee;
  const canSubmit =
    isConnected && numericAmount > 0 && totalDeduction <= arcadeumBalance;

  const handleSubmit = async () => {
    if (!publicKey || !canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await submitWithdrawal({
        walletAddress: publicKey,
        amount: numericAmount,
      });
      setResult(res);
      setAmount('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : wallet.withdraw.error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#e4e4e7',
        }}
      >
        {wallet.withdraw.title}
      </h2>
      <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
        {wallet.withdraw.description}
      </p>

      {!isConnected ? (
        <button
          onClick={connect}
          disabled={isConnecting}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#ab9ff2',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: isConnecting ? 'wait' : 'pointer',
          }}
        >
          {isConnecting
            ? wallet.withdraw.connecting
            : wallet.withdraw.connectButton}
        </button>
      ) : (
        <>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#34d399',
              wordBreak: 'break-all',
            }}
          >
            {wallet.withdraw.connected}: {publicKey}
            <button
              onClick={disconnect}
              style={{
                marginLeft: '12px',
                background: 'none',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {wallet.withdraw.disconnect}
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#a1a1aa',
                marginBottom: '6px',
              }}
            >
              {wallet.withdraw.amountLabel.replace(
                '{balance}',
                arcadeumBalance.toLocaleString(),
              )}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              max={arcadeumBalance}
              placeholder={wallet.withdraw.amountPlaceholder}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#e4e4e7',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {numericAmount > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#a1a1aa',
              }}
            >
              <div>
                {wallet.withdraw.amountLabel.replace(
                  '{balance}',
                  numericAmount.toLocaleString(),
                )}
              </div>
              <div>
                {wallet.withdraw.feeLabel.replace(
                  '{fee}',
                  fee.toLocaleString(),
                )}
              </div>
              <div style={{ color: '#e4e4e7', fontWeight: 600 }}>
                {wallet.withdraw.youReceive.replace(
                  '{amount}',
                  numericAmount.toLocaleString(),
                )}
              </div>
            </div>
          )}

          {(error || phantomError) && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                marginBottom: '16px',
                color: '#ef4444',
                fontSize: '13px',
              }}
            >
              {error || phantomError}
            </div>
          )}

          {result && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                marginBottom: '16px',
                color: '#22c55e',
                fontSize: '13px',
              }}
            >
              {wallet.withdraw.success.replace(
                '{signature}',
                result.signature.slice(0, 16),
              )}
              ...
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: canSubmit ? '#34d399' : 'rgba(255,255,255,0.1)',
              color: canSubmit ? '#fff' : '#71717a',
              fontSize: '16px',
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {isSubmitting
              ? wallet.withdraw.processing
              : wallet.withdraw.submitButton}
          </button>
        </>
      )}
    </div>
  );
}
