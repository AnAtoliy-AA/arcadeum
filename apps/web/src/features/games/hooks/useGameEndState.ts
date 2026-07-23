import { useCallback, useMemo } from 'react';
import { useRematch } from './useRematch';
import { useGameResultModal } from './useGameResultModal';
import type { GameResult, ResultMessages } from './useGameResultModal';
import type { GameSessionSummary, GameOptions } from '@/shared/types/games';

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

/**
 * Unified hook that combines game result + rematch state into one.
 * Returns a stable object (via useMemo) so consumers don't re-render
 * unnecessarily.
 *
 * Usage:
 * ```ts
 * const gameEnd = useGameEndState({
 *   roomId, session,
 *   result: computeGameResult(isGameOver, currentUserId, { winnerId }),
 *   players: snapshot?.players.map(p => ({ playerId: p.playerId, displayName: name, alive: p.alive })),
 * });
 *
 * // In JSX — pass the whole object to GameEndModals:
 * <GameEndModals gameEnd={gameEnd} currentUserId={currentUserId} t={t} />
 * ```
 */
export function useGameEndState({
  roomId,
  session,
  result,
  resultMessages,
  rematchGameOptions,
  players = [],
}: UseGameEndStateOptions) {
  const rematch = useRematch({ roomId, gameOptions: rematchGameOptions });

  const {
    showResultModal,
    sharedResult,
    resultMessages: defaultMessages,
    dismiss,
  } = useGameResultModal(session, result, resultMessages);

  const handleResultRematchClick = useCallback(() => {
    if (players.length > 1) {
      rematch.openRematchModal();
    } else {
      void rematch.handleRematch([], undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.length, rematch.openRematchModal, rematch.handleRematch]);

  return useMemo(
    () => ({
      showResultModal,
      sharedResult,
      resultMessages: resultMessages || defaultMessages,
      dismissResult: dismiss,

      rematchLoading: rematch.rematchLoading,
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
      rematch.rematchLoading,
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
