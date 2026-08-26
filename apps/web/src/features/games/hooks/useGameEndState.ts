'use client';

import { useCallback, useMemo } from 'react';
import { useRematch } from './useRematch';
import { useGameResultModal } from './useGameResultModal';
import type { GameResult, ResultMessages } from './useGameResultModal';
import type { GameSessionSummary, GameOptions } from '@/shared/types/games';
import type { RatingDelta } from '@/features/ranking/model/types';

export interface PlayerInfo {
  playerId: string;
  displayName: string;
  alive: boolean;
}

export interface UseGameEndStateOptions {
  roomId: string;
  currentUserId?: string | null;
  session: GameSessionSummary | null | undefined;
  isGameOver?: boolean;
  result: GameResult;
  resultMessages?: ResultMessages;
  rematchGameOptions?: GameOptions;
  players?: PlayerInfo[];
}

export function useGameEndState({
  roomId,
  session,
  isGameOver,
  result,
  resultMessages,
  rematchGameOptions,
  players = [],
  currentUserId,
}: UseGameEndStateOptions) {
  const rematch = useRematch({ roomId, gameOptions: rematchGameOptions });

  const {
    showResultModal,
    sharedResult,
    resultMessages: defaultMessages,
    dismiss,
    open: openResult,
    toggle: toggleResult,
  } = useGameResultModal(session, result, resultMessages, isGameOver);

  const ratingDelta = useMemo<RatingDelta | null>(() => {
    if (!currentUserId || !session?.state) return null;
    const gameResult = session.state.gameResult as
      { ratingDeltas?: Record<string, RatingDelta> } | undefined;
    return gameResult?.ratingDeltas?.[currentUserId] ?? null;
  }, [session?.state, currentUserId]);

  const handleResultRematchClick = useCallback(() => {
    if (players.length > 1) {
      rematch.openRematchModal();
    } else {
      void rematch.handleRematch([], undefined);
    }
  }, [players.length, rematch]);

  return useMemo(
    () => ({
      showResultModal,
      sharedResult,
      resultMessages: resultMessages || defaultMessages,
      dismissResult: dismiss,
      openResult,
      toggleResult,
      ratingDelta,

      rematchLoading: rematch.rematchLoading,
      rematchError: rematch.rematchError,
      showRematchModal: rematch.showRematchModal,
      openRematchModal: rematch.openRematchModal,
      closeRematchModal: rematch.closeRematchModal,
      handleResultRematchClick,
      handleRematch: rematch.handleRematch,

      invitation: rematch.invitation,
      invitationTimeLeft: rematch.invitationTimeLeft,
      handleAcceptInvitation: rematch.handleAcceptInvitation,
      handleDeclineInvitation: rematch.handleDeclineInvitation,
      isAcceptingInvitation: rematch.isAcceptingInvitation,

      handleReinvite: rematch.handleReinvite,
      handleBlockRematch: rematch.handleBlockRematch,
      handleBlockUser: rematch.handleBlockUser,
    }),
    [
      showResultModal,
      sharedResult,
      resultMessages,
      defaultMessages,
      dismiss,
      openResult,
      toggleResult,
      ratingDelta,
      rematch.rematchLoading,
      rematch.rematchError,
      rematch.showRematchModal,
      rematch.openRematchModal,
      rematch.closeRematchModal,
      handleResultRematchClick,
      rematch.handleRematch,
      rematch.invitation,
      rematch.invitationTimeLeft,
      rematch.handleAcceptInvitation,
      rematch.handleDeclineInvitation,
      rematch.isAcceptingInvitation,
      rematch.handleReinvite,
      rematch.handleBlockRematch,
      rematch.handleBlockUser,
    ],
  );
}

export type UseGameEndStateResult = ReturnType<typeof useGameEndState>;
