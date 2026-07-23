import { useCallback } from 'react';
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
  currentUserId: string | null;
  session: GameSessionSummary | null | undefined;
  isGameOver: boolean;
  result: GameResult;
  resultMessages?: ResultMessages;
  rematchGameOptions?: GameOptions;
  players?: PlayerInfo[];
}

/**
 * Unified hook that combines game result + rematch state into one.
 * Returns everything a game needs to render GameResultModal, RematchModal,
 * and RematchInvitationModal without any manual wiring.
 *
 * Usage:
 * ```ts
 * const gameEnd = useGameEndState({
 *   roomId, currentUserId, session, isGameOver,
 *   result: computeGameResult(isGameOver, currentUserId, { winnerId }),
 *   players: snapshot?.players.map(p => ({ playerId: p.playerId, displayName: name, alive: p.alive })),
 * });
 *
 * // In JSX:
 * <GameEndModals {...gameEnd} players={players} currentUserId={currentUserId} onConfirmRematch={gameEnd.handleRematch} t={t} />
 * ```
 */
export function useGameEndState({
  roomId,
  currentUserId: _currentUserId,
  session,
  isGameOver: _isGameOver,
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
  }, [players.length, rematch]);

  return {
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
  } as const;
}
