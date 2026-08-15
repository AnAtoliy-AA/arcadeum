'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { Button } from '@arcadeum/ui';

import { useIdleTimer } from '../hooks/useIdleTimer';

interface IdleTimerDisplayProps {
  enabled: boolean;
  isMyTurn: boolean;
  canAct: boolean;
  onTimeout: () => void;
  autoplayTriggered: boolean;
  onStop: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function Container({ children }: { children?: React.ReactNode }) {
  return <div className="my-2">{children}</div>;
}

function CountdownContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center justify-center gap-2 rounded-lg border border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.15)] px-4 py-[10px]">
      {children}
    </div>
  );
}

function TimerEmoji({ children }: { children?: React.ReactNode }) {
  return <span className="text-[18px]">{children}</span>;
}

function CountdownText({
  isRunning,
  children,
}: {
  isRunning: boolean;
  children?: React.ReactNode;
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

function ActiveContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center justify-between gap-4 rounded-lg border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.15)] px-4 py-[10px]">
      {children}
    </div>
  );
}

function ActiveBadge({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-row items-center gap-2">{children}</div>;
}

function RobotEmoji({ children }: { children?: React.ReactNode }) {
  return <span className="text-[18px]">{children}</span>;
}

function ActiveText({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-[14px] leading-[18px] font-semibold text-[rgb(34,197,94)]">
      {children}
    </span>
  );
}

/**
 * Displays the idle timer countdown and autoplay status.
 * Shows countdown when timer is active.
 * Shows "Autoplay Active" badge with stop button when autoplay was triggered by timer.
 */
export function IdleTimerDisplay({
  enabled,
  isMyTurn,
  canAct,
  onTimeout,
  autoplayTriggered,
  onStop,
  t,
}: IdleTimerDisplayProps) {
  const { secondsRemaining, isActive, isRunning } = useIdleTimer({
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
            <RobotEmoji>🤖</RobotEmoji>
            <ActiveText>{t('games.table.idleTimer.active')}</ActiveText>
          </ActiveBadge>
          <Button variant="danger" size="sm" onClick={onStop}>
            {t('games.table.idleTimer.stop')}
          </Button>
        </ActiveContainer>
      </Container>
    );
  }

  return (
    <Container>
      <CountdownContainer>
        <TimerEmoji>⏱️</TimerEmoji>
        <CountdownText isRunning={isRunning}>
          {t('games.table.idleTimer.countdown', { seconds: secondsRemaining })}
        </CountdownText>
      </CountdownContainer>
    </Container>
  );
}
