'use client';

import { useState, useEffect, useRef } from 'react';
import type { PieceColor, PlayerClock } from '../types';

interface UseClockCountdownOptions {
  clocks: Record<PieceColor, PlayerClock> | null;
  currentTurnColor: PieceColor;
  isGameOver: boolean;
  gameCreatedAt: number;
  incrementSeconds?: number;
}

export interface LiveClock {
  white: number;
  black: number;
}

const FIRST_MOVE_DEADLINE_MS = 20_000;
const FIRST_MOVE_SECONDS = FIRST_MOVE_DEADLINE_MS / 1000;
const ZERO_CLOCK: LiveClock = { white: 0, black: 0 };
/** Below this many seconds the display shows tenths, so tick finer. */
export const TENTHS_BELOW_SECONDS = 10;

/** Seconds left, preferring the server's authoritative milliseconds. */
export function clockSeconds(clock: PlayerClock): number {
  return typeof clock.remainingMs === 'number'
    ? clock.remainingMs / 1000
    : clock.remainingSeconds;
}

/** Display bucket for a clock value: whole seconds, or tenths when low. */
function displayBucket(seconds: number): number {
  return seconds < TENTHS_BELOW_SECONDS
    ? Math.ceil(seconds * 10) / 10
    : Math.ceil(seconds);
}

function computeLiveClocks(
  clocks: Record<PieceColor, PlayerClock>,
  currentTurnColor: PieceColor,
  gameCreatedAt: number,
  isGameOver: boolean,
): LiveClock {
  if (isGameOver) {
    return {
      white: clockSeconds(clocks.white),
      black: clockSeconds(clocks.black),
    };
  }

  const now = Date.now();
  const whiteClock = clocks.white;
  const blackClock = clocks.black;

  const firstMoveMade =
    whiteClock.lastMoveTimestamp > 0 || blackClock.lastMoveTimestamp > 0;

  if (!firstMoveMade) {
    if (gameCreatedAt <= 0) {
      return {
        white: FIRST_MOVE_SECONDS,
        black: clockSeconds(blackClock),
      };
    }
    const sinceCreation = (now - gameCreatedAt) / 1000;
    if (sinceCreation <= FIRST_MOVE_SECONDS) {
      return {
        white: Math.max(0, FIRST_MOVE_SECONDS - sinceCreation),
        black: clockSeconds(blackClock),
      };
    }
    const clockElapsed = sinceCreation - FIRST_MOVE_SECONDS;
    return {
      white: Math.max(0, clockSeconds(whiteClock) - clockElapsed),
      black: clockSeconds(blackClock),
    };
  }

  const activeClock = clocks[currentTurnColor];
  const inactiveClock = currentTurnColor === 'white' ? blackClock : whiteClock;
  const opponentClock = currentTurnColor === 'white' ? blackClock : whiteClock;

  const turnStartedAt =
    opponentClock.lastMoveTimestamp > 0
      ? opponentClock.lastMoveTimestamp
      : gameCreatedAt > 0
        ? gameCreatedAt + FIRST_MOVE_DEADLINE_MS
        : now;
  const elapsedSeconds = Math.max(0, (now - turnStartedAt) / 1000);
  const activeRemaining = Math.max(
    0,
    clockSeconds(activeClock) - elapsedSeconds,
  );

  return {
    white:
      currentTurnColor === 'white'
        ? activeRemaining
        : clockSeconds(inactiveClock),
    black:
      currentTurnColor === 'black'
        ? activeRemaining
        : clockSeconds(inactiveClock),
  };
}

export function useClockCountdown({
  clocks,
  currentTurnColor,
  isGameOver,
  gameCreatedAt,
}: UseClockCountdownOptions): LiveClock {
  const [live, setLive] = useState<LiveClock>(() => {
    if (!clocks) return ZERO_CLOCK;
    return computeLiveClocks(
      clocks,
      currentTurnColor,
      gameCreatedAt,
      isGameOver,
    );
  });

  const inputsRef = useRef({
    clocks,
    currentTurnColor,
    isGameOver,
    gameCreatedAt,
  });

  useEffect(() => {
    inputsRef.current = { clocks, currentTurnColor, isGameOver, gameCreatedAt };

    const tick = () => {
      const {
        clocks: c,
        currentTurnColor: ctc,
        isGameOver: go,
        gameCreatedAt: gca,
      } = inputsRef.current;
      if (!c) {
        setLive((prev) =>
          prev.white === 0 && prev.black === 0 ? prev : ZERO_CLOCK,
        );
        return;
      }
      const next = computeLiveClocks(c, ctc, gca, go);
      setLive((prev) => {
        if (
          displayBucket(prev.white) === displayBucket(next.white) &&
          displayBucket(prev.black) === displayBucket(next.black)
        ) {
          return prev;
        }
        return next;
      });
    };

    tick();
    if (isGameOver || !clocks) return;

    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [isGameOver, clocks, currentTurnColor, gameCreatedAt]);

  return live;
}
