'use client';

import { useState, useTransition } from 'react';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { cx } from '@arcadeum/ui/utils/cx';
import { buyFreezeAction } from '../server/buy-freeze.actions';

export interface StreakFreezeCardProps {
  initialFreezeTokens?: number;
  currentStreak?: number;
  className?: string;
  labels?: {
    title?: string;
    description?: string;
    activeStatus?: string;
    inactiveStatus?: string;
    buyButton?: string;
    price?: string;
    success?: string;
    errorInsufficientCoins?: string;
  };
}

export function StreakFreezeCard({
  initialFreezeTokens = 0,
  currentStreak = 0,
  className = '',
  labels,
}: StreakFreezeCardProps) {
  const [freezeTokens, setFreezeTokens] = useState(initialFreezeTokens);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const title = labels?.title ?? 'Streak Freeze Shield';
  const description =
    labels?.description ??
    'Protect your active streak from resetting if you miss a day.';
  const activeStatus =
    labels?.activeStatus ??
    `${freezeTokens} Shield Token${freezeTokens === 1 ? '' : 's'} Active`;
  const inactiveStatus =
    labels?.inactiveStatus ?? 'No Active Shield (Unprotected)';
  const buyButtonLabel = labels?.buyButton ?? 'Get Streak Freeze';
  const priceLabel = labels?.price ?? '100 Coins';

  const handleBuy = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await buyFreezeAction(1);
      if (res.ok) {
        setFreezeTokens(res.result.freezeTokens);
        setFeedback({
          type: 'success',
          message: labels?.success ?? 'Streak freeze purchased! 🛡️',
        });
      } else if (res.code === 'insufficient_funds') {
        setFeedback({
          type: 'error',
          message:
            labels?.errorInsufficientCoins ??
            'Need 100 coins to buy streak freeze.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Could not complete purchase. Try again.',
        });
      }
    });
  };

  const isShieldActive = freezeTokens > 0;

  return (
    <div
      data-testid="streak-freeze-card"
      className={cx(
        'relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300',
        isShieldActive
          ? 'border-sky-500/30 bg-sky-500/5 shadow-lg shadow-sky-500/5'
          : 'border-[var(--glassBorder)] bg-[var(--glassBg)]',
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={cx(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl border transition-all',
              isShieldActive
                ? 'border-sky-400/40 bg-sky-400/15 text-sky-300 shadow-inner'
                : 'border-white/10 bg-white/5 text-gray-400',
            )}
          >
            {isShieldActive ? '🛡️' : '🧊'}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[var(--color)]">
                {title}
              </h3>
              <span
                data-testid="streak-freeze-status-badge"
                className={cx(
                  'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border',
                  isShieldActive
                    ? 'border-sky-500/30 bg-sky-500/20 text-sky-300'
                    : 'border-white/10 bg-white/5 text-[var(--colorMuted)]',
                )}
              >
                {isShieldActive ? activeStatus : inactiveStatus}
              </span>
            </div>

            <p className="text-xs text-[var(--textSecondary)] max-w-md">
              {description}
            </p>

            {currentStreak > 0 && (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <span>🔥</span>
                <span>Protecting your {currentStreak}-day streak</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={handleBuy}
            disabled={isPending}
            data-testid="buy-streak-freeze-button"
            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold"
          >
            {isPending ? 'Purchasing...' : `${buyButtonLabel} (${priceLabel})`}
          </Button>

          {feedback && (
            <span
              data-testid="streak-freeze-feedback"
              className={cx(
                'text-xs font-medium',
                feedback.type === 'success'
                  ? 'text-emerald-400'
                  : 'text-red-400',
              )}
            >
              {feedback.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
