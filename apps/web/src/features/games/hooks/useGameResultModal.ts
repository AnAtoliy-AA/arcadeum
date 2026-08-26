'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { GameSessionSummary } from '@/shared/types/games';
import { useGameResultStore } from '../store/gameResultStore';

export type GameResult = 'won' | 'lost' | 'draw' | null;
export type SharedResult = 'victory' | 'defeat' | 'draw' | null;

export interface ResultMessages {
  title: string;
  message: string;
}

export function useGameResultModal(
  session: GameSessionSummary | null | undefined,
  result: GameResult,
  resultMessages: ResultMessages | undefined,
  isGameOver?: boolean,
) {
  const storeIsOpen = useGameResultStore((state) => state.isOpen);
  const setStoreIsOpen = useGameResultStore((state) => state.setIsOpen);
  const setStoreHasResult = useGameResultStore((state) => state.setHasResult);

  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(
    null,
  );
  const [wasAlreadyOver] = useState(
    () => isGameOver === true && result !== null,
  );

  useEffect(() => {
    if (!wasAlreadyOver && isGameOver && result) {
      useGameResultStore.getState().setHasResult(true);
      useGameResultStore.getState().setIsOpen(true);
    }
  }, [wasAlreadyOver, isGameOver, result]);

  const showResultModal =
    storeIsOpen ||
    (!wasAlreadyOver &&
      !!result &&
      dismissedSessionId !== (session?.id ?? 'dismissed'));

  const sharedResult: SharedResult = useMemo(() => {
    if (result === 'won') return 'victory';
    if (result === 'lost') return 'defeat';
    return result;
  }, [result]);

  const dismiss = useCallback(() => {
    setStoreIsOpen(false);
    setDismissedSessionId(session?.id ?? 'dismissed');
  }, [session?.id, setStoreIsOpen]);

  const open = useCallback(() => {
    setStoreHasResult(true);
    setStoreIsOpen(true);
    setDismissedSessionId(null);
  }, [setStoreHasResult, setStoreIsOpen]);

  const toggle = useCallback(() => {
    if (showResultModal) {
      dismiss();
    } else {
      open();
    }
  }, [showResultModal, dismiss, open]);

  return {
    showResultModal,
    sharedResult,
    resultMessages,
    dismiss,
    open,
    toggle,
  } as const;
}
