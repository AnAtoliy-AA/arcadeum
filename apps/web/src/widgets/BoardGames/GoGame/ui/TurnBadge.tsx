'use client';

import { memo } from 'react';
import { InGameAvatar } from '@/features/games/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';

interface TurnBadgeProps {
  currentPlayerId: string | null;
  myTurn: boolean;
  isGameOver: boolean;
  resolveName?: (id?: string | null) => string;
  /** Stones captured BY each colour — shown as a small tally. */
  captures?: { black: number; white: number };
}

function TurnBadgeImpl({
  currentPlayerId,
  myTurn,
  isGameOver,
  resolveName,
  captures,
}: TurnBadgeProps) {
  const { t } = useTranslation();
  if (!currentPlayerId && !isGameOver) return null;

  const displayName = resolveName?.(currentPlayerId) ?? '';
  const label = isGameOver
    ? t('games.go_v1.status.gameOver')
    : myTurn
      ? t('games.go_v1.status.yourTurn')
      : t('games.go_v1.status.playerTurn', { name: displayName });

  if (!currentPlayerId) return null;

  return (
    <div className="flex flex-row items-center justify-center gap-3 self-center">
      <div
        data-testid="go-turn-badge"
        className={cx(
          'flex flex-row items-center gap-2 rounded-[999px] border px-3 py-1.5',
          isGameOver
            ? 'border-[var(--borderColor)] bg-[var(--backgroundHover)]'
            : myTurn
              ? 'border-[#3fd38666] bg-[#3fd386]'
              : 'border-[var(--borderColor)] bg-[var(--backgroundHover)]',
        )}
      >
        {!isGameOver ? (
          <InGameAvatar
            playerId={currentPlayerId}
            name={displayName}
            size="sm"
            data-testid="go-turn-avatar"
          />
        ) : null}
        <span
          data-testid="turn-indicator-label"
          className={cx(
            'text-sm font-semibold',
            !isGameOver && myTurn ? 'text-[#0b2417]' : '',
          )}
          style={!myTurn || isGameOver ? { color: 'var(--foreground)' } : undefined}
        >
          {label}
        </span>
      </div>
      {captures ? (
        <span
          data-testid="go-captures"
          className="rounded-full border border-[var(--borderColor)] bg-[var(--backgroundHover)] px-3 py-1 text-xs opacity-80"
        >
          ⚫ {captures.black} · ⚪ {captures.white}
        </span>
      ) : null}
    </div>
  );
}

export const TurnBadge = memo(TurnBadgeImpl);
