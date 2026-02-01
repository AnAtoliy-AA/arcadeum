'use client';

import styled, { keyframes } from 'styled-components';
import { Button } from '@/shared/ui';

interface IdleTimerDisplayProps {
  secondsRemaining: number;
  isActive: boolean;
  isRunning?: boolean;
  autoplayTriggered: boolean;
  onStop: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const Container = styled.div`
  margin: 0.5rem 0;
`;

const CountdownContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(251, 191, 36, 0.15);
  border-radius: 8px;
  border: 1px solid rgba(251, 191, 36, 0.4);
  padding: 0.625rem 1rem;
  gap: 0.5rem;
`;

const TimerEmoji = styled.span`
  font-size: 1.125rem;
`;

const CountdownText = styled.span<{ $isRunning?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(251, 191, 36);
  animation: ${({ $isRunning }) => ($isRunning ? pulse : 'none')} 1s ease-in-out
    infinite;
  opacity: ${({ $isRunning }) => ($isRunning ? 1 : 0.7)};
`;

const ActiveContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(34, 197, 94, 0.15);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.4);
  padding: 0.625rem 1rem;
  gap: 1rem;
`;

const ActiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RobotEmoji = styled.span`
  font-size: 1.125rem;
`;

const ActiveText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(34, 197, 94);
`;

const StopButton = styled(Button).attrs({
  variant: 'danger',
  size: 'sm',
})`
  padding: 0.375rem 0.75rem;
`;

/**
 * Displays the idle timer countdown and autoplay status.
 * Shows countdown when timer is active.
 * Shows "Autoplay Active" badge with stop button when autoplay was triggered by timer.
 */
export function IdleTimerDisplay({
  secondsRemaining,
  isActive,
  isRunning = true,
  autoplayTriggered,
  onStop,
  t,
}: IdleTimerDisplayProps) {
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
          <StopButton onClick={onStop}>
            {t('games.table.idleTimer.stop')}
          </StopButton>
        </ActiveContainer>
      </Container>
    );
  }

  return (
    <Container>
      <CountdownContainer>
        <TimerEmoji>⏱️</TimerEmoji>
        <CountdownText $isRunning={isRunning}>
          {t('games.table.idleTimer.countdown', { seconds: secondsRemaining })}
        </CountdownText>
      </CountdownContainer>
    </Container>
  );
}
