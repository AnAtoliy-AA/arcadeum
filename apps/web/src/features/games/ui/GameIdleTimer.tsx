'use client';

import type { ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Button } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useGameIdleTimer } from '@/features/games/hooks/useGameIdleTimer';

export interface GameIdleTimerProps {
  enabled: boolean;
  isMyTurn: boolean;
  canAct: boolean;
  onTimeout: () => void;
  autoplayTriggered: boolean;
  onStop: () => void;
}

function Container({ children }: { children?: ReactNode }) {
  return <div className="my-2">{children}</div>;
}

function CountdownContainer({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-row items-center justify-center gap-2 rounded-lg border border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.15)] px-4 py-[10px]">
      {children}
    </div>
  );
}

function CountdownText({
  isRunning,
  children,
}: {
  isRunning: boolean;
  children?: ReactNode;
}) {
  return (
    <span
      className={cx(
        'text-[14px] leading-[18px] font-semibold text-[rgb(251,191,36)]',
        isRunning ? 'animate-pulse' : 'opacity-[0.7]',
      )}
    >
      {children}
    </span>
  );
}

function ActiveContainer({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-row items-center justify-between gap-4 rounded-lg border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.15)] px-4 py-[10px]">
      {children}
    </div>
  );
}

function ActiveBadge({ children }: { children?: ReactNode }) {
  return <div className="flex flex-row items-center gap-2">{children}</div>;
}

function ActiveText({ children }: { children?: ReactNode }) {
  return (
    <span className="text-[14px] leading-[18px] font-semibold text-[rgb(34,197,94)]">
      {children}
    </span>
  );
}

/**
 * Shared idle-timer + autoplay status UI for turn-based games. Shows the
 * countdown while the timer is active and a "Autoplay Active" badge with a
 * stop button once the timer has triggered autoplay. Uses the shared
 * `useGameIdleTimer` hook and `games.table.idleTimer.*` i18n keys.
 */
export function GameIdleTimer({
  enabled,
  isMyTurn,
  canAct,
  onTimeout,
  autoplayTriggered,
  onStop,
}: GameIdleTimerProps) {
  const { t } = useTranslation();
  const { secondsRemaining, isActive, isRunning } = useGameIdleTimer({
    enabled,
    isMyTurn,
    canAct,
    onTimeout,
  });

  if (!isActive && !autoplayTriggered) {
    return null;
  }

  if (autoplayTriggered) {
    return (
      <Container>
        <ActiveContainer>
          <ActiveBadge>
            <span className="text-[18px]">🤖</span>
            <ActiveText>
              {t('games.table.idleTimer.active' as TranslationKey) ||
                'Autoplay Active'}
            </ActiveText>
          </ActiveBadge>
          <Button variant="danger" size="sm" onClick={onStop}>
            {t('games.table.idleTimer.stop' as TranslationKey) || 'Stop'}
          </Button>
        </ActiveContainer>
      </Container>
    );
  }

  return (
    <Container>
      <CountdownContainer>
        <span className="text-[18px]">⏱️</span>
        <CountdownText isRunning={isRunning}>
          {t('games.table.idleTimer.countdown' as TranslationKey, {
            seconds: String(secondsRemaining),
          }) || `Autoplay in ${secondsRemaining}s`}
        </CountdownText>
      </CountdownContainer>
    </Container>
  );
}
