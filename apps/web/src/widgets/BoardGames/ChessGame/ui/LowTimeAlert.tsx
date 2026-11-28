'use client';

import { memo, useEffect, useRef, useState } from 'react';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type { PieceColor, PlayerClock } from '../types';
import { useClockCountdown } from '../hooks/useClockCountdown';
import { useChessSounds } from '../hooks/useChessSounds';

/** Seconds left at which the player is warned (most urgent last). */
export const LOW_TIME_THRESHOLDS = [30, 10] as const;

/**
 * Returns the threshold just crossed going from `prev` to `next` seconds,
 * or null. Crossing several at once reports the most urgent one.
 */
export function crossedLowTimeThreshold(
  prev: number,
  next: number,
): number | null {
  let crossed: number | null = null;
  for (const limit of LOW_TIME_THRESHOLDS) {
    if (prev > limit && next <= limit && next > 0) crossed = limit;
  }
  return crossed;
}

interface LowTimeAlertProps {
  myColor: PieceColor | null;
  clocks: Record<PieceColor, PlayerClock> | null;
  currentTurnColor: PieceColor;
  isGameOver: boolean;
  gameCreatedAt: number;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

/**
 * Plays a cue and announces to screen readers when the player's own clock
 * drops below 30 and 10 seconds. Owns its own countdown so the once-per-
 * second clock tick only re-renders this tiny component.
 */
function LowTimeAlertImpl({
  myColor,
  clocks,
  currentTurnColor,
  isGameOver,
  gameCreatedAt,
  t,
}: LowTimeAlertProps) {
  const { playSound } = useChessSounds();
  const live = useClockCountdown({
    clocks,
    currentTurnColor,
    isGameOver,
    gameCreatedAt,
  });
  const seconds = myColor && clocks ? live[myColor] : null;
  const prevRef = useRef<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = seconds;
    if (seconds === null || prev === null || isGameOver) return;
    if (currentTurnColor !== myColor) return;
    const crossed = crossedLowTimeThreshold(prev, seconds);
    if (crossed === null) return;
    playSound('lowTime');
    queueMicrotask(() =>
      setMessage(t('games.chess_v1.clock.lowTime', { seconds: crossed })),
    );
  }, [seconds, isGameOver, currentTurnColor, myColor, playSound, t]);

  if (!myColor || !clocks) return null;
  return (
    <span className="sr-only" role="status" aria-live="assertive">
      {message}
    </span>
  );
}

export const LowTimeAlert = memo(LowTimeAlertImpl);
