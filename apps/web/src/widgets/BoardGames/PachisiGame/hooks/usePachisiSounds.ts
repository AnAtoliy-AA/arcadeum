'use client';

import { useEffect, useRef } from 'react';
import { useGameSound } from '@/shared/lib/game-sounds';
import type { PachisiClientState, PachisiToken } from '../types';
import { countFinishedTokens, detectCaptures } from '../lib/pachisiEvents';

interface UsePachisiSoundsOptions {
  snapshot: PachisiClientState | null | undefined;
  myTurn: boolean;
  isGameOver: boolean;
  currentUserId: string | null;
}

/** Plays turn, finish, capture and game-over sounds from snapshot diffs. */
export function usePachisiSounds({
  snapshot,
  myTurn,
  isGameOver,
  currentUserId,
}: UsePachisiSoundsOptions) {
  const { play } = useGameSound('pachisi_v1');

  const prevMyTurn = useRef(myTurn);
  useEffect(() => {
    if (myTurn && !prevMyTurn.current && !isGameOver) play('notification');
    prevMyTurn.current = myTurn;
  }, [myTurn, isGameOver, play]);

  const tokens = snapshot?.tokens;
  const seats = snapshot?.seats;
  const prevTokens = useRef<Record<string, PachisiToken[]> | null>(null);
  const prevFinished = useRef<number | null>(null);
  useEffect(() => {
    if (!tokens) return;
    const finished = countFinishedTokens(tokens);
    if (prevFinished.current !== null && finished > prevFinished.current) {
      play('success');
    }
    prevFinished.current = finished;

    if (detectCaptures(prevTokens.current, tokens, seats).length > 0) {
      play('capture');
    }
    prevTokens.current = tokens;
  }, [tokens, seats, play]);

  const winnerId = snapshot?.winnerId;
  const winnerIds = snapshot?.winnerIds;
  const prevGameOver = useRef(isGameOver);
  useEffect(() => {
    if (isGameOver && !prevGameOver.current) {
      const winners =
        winnerIds && winnerIds.length > 0
          ? winnerIds
          : winnerId
            ? [winnerId]
            : [];
      if (currentUserId && winners.includes(currentUserId)) play('win');
      else if (winners.length > 0) play('lose');
    }
    prevGameOver.current = isGameOver;
  }, [isGameOver, winnerId, winnerIds, currentUserId, play]);

  return { play };
}
