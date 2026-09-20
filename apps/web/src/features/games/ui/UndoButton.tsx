'use client';

import { useCallback, useState, useEffect } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useSocket, gameSocket } from '@/shared/lib/socket';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

interface UndoButtonProps {
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
    <button
      type="button"
      onClick={requestUndo}
      disabled={waiting || disabled}
      data-testid="multiplayer-undo-button"
      className={cx(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors active:scale-95 select-none whitespace-nowrap',
        disabled || waiting
          ? 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] opacity-50 cursor-not-allowed'
          : 'border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10',
      )}
    >
      <span>↩️</span>
      <span>{label}</span>
    </button>
  );
}
