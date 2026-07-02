'use client';

import { useCallback, useState, useEffect } from 'react';
import { useSocket, gameSocket } from '@/shared/lib/socket';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

interface UndoButtonProps {
  /** When true, the button is disabled (e.g. game over) */
  disabled?: boolean;
}

export function UndoButton({ disabled = false }: UndoButtonProps) {
  const { t } = useTranslation();
  const roomId = useGameStore((s: GameState) => s.room?.id);
  const sessionId = useGameStore(
    (s: GameState) => (s.session as { id?: string } | null)?.id,
  );
  const { snapshot } = useSessionTokens();
  const userId = snapshot.userId;

  const [waiting, setWaiting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useSocket(
    'games.session.undo_response',
    useCallback(
      (data: unknown) => {
        const d = data as { accepted?: boolean };
        if (d?.accepted === true) {
          setNotification(t('games.undo.accepted' as TranslationKey));
        } else {
          setNotification(t('games.undo.denied' as TranslationKey));
        }
        setWaiting(false);
      },
      [t],
    ),
  );

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  const requestUndo = useCallback(() => {
    if (!roomId || !userId || waiting || disabled) return;
    setWaiting(true);
    gameSocket.emit('games.session.undo_request', {
      roomId,
      userId,
      sessionId,
    });
  }, [roomId, userId, sessionId, waiting, disabled]);

  const label = waiting
    ? t('games.undo.pending' as TranslationKey)
    : (notification ?? t('games.undo.request' as TranslationKey));

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <button
        type="button"
        onClick={requestUndo}
        disabled={waiting || disabled}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.15)',
          backgroundColor: waiting
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(255,255,255,0.1)',
          color: disabled ? 'rgba(255,255,255,0.35)' : '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: disabled || waiting ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {label}
      </button>
    </div>
  );
}
