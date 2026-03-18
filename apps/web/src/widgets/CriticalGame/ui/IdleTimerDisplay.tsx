'use client';

import { styled, YStack, XStack, Text } from 'tamagui';
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

const Container = styled(YStack, {
  name: 'IdleTimerContainer',
  marginVertical: '$2',
});

const CountdownContainer = styled(XStack, {
  name: 'CountdownContainer',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(251, 191, 36, 0.15)',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: 'rgba(251, 191, 36, 0.4)',
  paddingVertical: '$2.5',
  paddingHorizontal: '$4',
  gap: '$2',
});

const TimerEmoji = styled(Text, {
  name: 'TimerEmoji',
  fontSize: 18,
});

const CountdownText = styled(Text, {
  name: 'CountdownText',
  fontSize: 14,
  fontWeight: '600',
  color: 'rgb(251, 191, 36)',

  variants: {
    $isRunning: {
      true: {
        animation: 'pulse',
        opacity: 1,
      },
      false: {
        opacity: 0.7,
      },
    },
  } as const,
});

const ActiveContainer = styled(XStack, {
  name: 'ActiveContainer',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(34, 197, 94, 0.15)',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: 'rgba(34, 197, 94, 0.4)',
  paddingVertical: '$2.5',
  paddingHorizontal: '$4',
  gap: '$4',
});

const ActiveBadge = styled(XStack, {
  name: 'ActiveBadge',
  alignItems: 'center',
  gap: '$2',
});

const RobotEmoji = styled(Text, {
  name: 'RobotEmoji',
  fontSize: 18,
});

const ActiveText = styled(Text, {
  name: 'ActiveText',
  fontSize: 14,
  fontWeight: '600',
  color: 'rgb(34, 197, 94)',
});

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
          <Button variant="danger" size="sm" onPress={onStop}>
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
        <CountdownText $isRunning={isRunning}>
          {t('games.table.idleTimer.countdown', { seconds: secondsRemaining })}
        </CountdownText>
      </CountdownContainer>
    </Container>
  );
}
