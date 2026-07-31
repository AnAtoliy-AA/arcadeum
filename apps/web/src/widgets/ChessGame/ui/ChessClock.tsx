'use client';

import { memo, useEffect, useState } from 'react';
import { XStack, Text } from 'tamagui';
import type { PieceColor, PlayerClock } from '../types';

interface ChessClockProps {
  clocks: Record<PieceColor, PlayerClock> | null;
  currentTurnColor: PieceColor;
  isGameOver: boolean;
}

function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function computeRemaining(clock: PlayerClock): number {
  const elapsed = Math.floor((Date.now() - clock.lastMoveTimestamp) / 1000);
  return Math.max(0, clock.remainingSeconds - elapsed);
}

function useCountdown(
  clock: PlayerClock | undefined,
  isMyTurn: boolean,
  isGameOver: boolean,
): number {
  const [displaySeconds, setDisplaySeconds] = useState(
    clock?.remainingSeconds ?? 0,
  );

  useEffect(() => {
    if (!clock) return;
    if (isGameOver || !isMyTurn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate clock sync
      setDisplaySeconds(computeRemaining(clock));
      return;
    }

    const id = setInterval(() => {
      setDisplaySeconds(computeRemaining(clock));
    }, 250);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock?.remainingSeconds, clock?.lastMoveTimestamp, isMyTurn, isGameOver]);

  return displaySeconds;
}

function ClockFace({
  label,
  clock,
  isActive,
  isGameOver,
}: {
  label: string;
  clock: PlayerClock | undefined;
  isActive: boolean;
  isGameOver: boolean;
}) {
  const seconds = useCountdown(clock, isActive, isGameOver);
  const isLow = seconds > 0 && seconds <= 30;
  const isCritical = seconds > 0 && seconds <= 10;
  const isFlagged = seconds <= 0 && !!clock;

  return (
    <XStack
      gap="$2"
      alignItems="center"
      padding="$2"
      paddingHorizontal="$3"
      borderRadius={8}
      backgroundColor={
        isActive ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.05)'
      }
      borderWidth={isActive ? 2 : 1}
      borderColor={isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)'}
      opacity={isGameOver && !isActive ? 0.5 : 1}
    >
      <Text fontSize="$2" opacity={0.7} fontWeight="600">
        {label}
      </Text>
      <Text
        fontSize="$4"
        fontWeight="700"
        color={
          isFlagged
            ? '#ef4444'
            : isCritical
              ? '#f97316'
              : isLow
                ? '#eab308'
                : undefined
        }
      >
        {clock ? formatTime(seconds) : '--:--'}
      </Text>
    </XStack>
  );
}

function ChessClockImpl({
  clocks,
  currentTurnColor,
  isGameOver,
}: ChessClockProps) {
  if (!clocks) return null;

  return (
    <XStack justifyContent="space-between" alignItems="center" gap="$2">
      <ClockFace
        label="♔"
        clock={clocks.white}
        isActive={currentTurnColor === 'white' && !isGameOver}
        isGameOver={isGameOver}
      />
      <ClockFace
        label="♚"
        clock={clocks.black}
        isActive={currentTurnColor === 'black' && !isGameOver}
        isGameOver={isGameOver}
      />
    </XStack>
  );
}

export const ChessClock = memo(ChessClockImpl);
