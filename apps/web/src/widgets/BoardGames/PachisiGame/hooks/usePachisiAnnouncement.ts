'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { PachisiClientState } from '../types';
import { detectCaptures, ownersWithNewFinish } from '../lib/pachisiEvents';

interface UsePachisiAnnouncementOptions {
  snapshot: PachisiClientState | null | undefined;
  myTurn: boolean;
  currentUserId: string | null;
  nameOf: (id?: string | null) => string;
}

/**
 * Builds a screen-reader message for roll, capture, token-home and turn
 * changes. Feed the result to `GameWidgetContainer`'s `a11yAnnouncement`.
 */
export function usePachisiAnnouncement({
  snapshot,
  myTurn,
  currentUserId,
  nameOf,
}: UsePachisiAnnouncementOptions): string {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const prev = useRef<PachisiClientState | null>(null);
  const prevMyTurn = useRef(myTurn);
  const flip = useRef(false);

  useEffect(() => {
    if (!snapshot) return;
    const before = prev.current;
    const parts: string[] = [];
    if (before) {
      const rollerId = snapshot.playerOrder[snapshot.currentTurnIndex] ?? null;
      if (snapshot.die != null && before.die == null) {
        parts.push(
          t('games.pachisi_v1.game.announce.rolled', {
            name:
              rollerId === currentUserId
                ? t('games.pachisi_v1.game.team.you')
                : nameOf(rollerId),
            value: snapshot.die,
          }),
        );
      }
      for (const cap of detectCaptures(
        before.tokens,
        snapshot.tokens,
        snapshot.seats,
      )) {
        parts.push(
          t('games.pachisi_v1.game.announce.captured', {
            name: nameOf(cap.ownerId),
          }),
        );
      }
      for (const ownerId of ownersWithNewFinish(
        before.tokens,
        snapshot.tokens,
      )) {
        parts.push(
          t('games.pachisi_v1.game.announce.tokenHome', {
            name: nameOf(ownerId),
          }),
        );
      }
    }
    if (myTurn && !prevMyTurn.current && before) {
      parts.push(t('games.pachisi_v1.game.announce.yourTurn'));
    }
    prev.current = snapshot;
    prevMyTurn.current = myTurn;
    if (parts.length > 0) {
      // Zero-width toggle so identical consecutive messages are re-announced.
      flip.current = !flip.current;
      setMessage(parts.join('. ') + (flip.current ? '​' : ''));
    }
  }, [snapshot, myTurn, currentUserId, nameOf, t]);

  return message;
}
