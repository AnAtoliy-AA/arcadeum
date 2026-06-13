import { useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import type { ChatScope } from '@/shared/types/games';

/**
 * Shared chat-send for any **session-based** game (TicTacToe, Cascade, Critical,
 * SeaBattle, Texas Hold'em…). Emits the generic `games.session.history_note`
 * socket event; the backend appends a `type: 'message'` entry to the session's
 * `state.logs` (keyed by room) and rebroadcasts the snapshot, so the message
 * flows back through `useGameChatIntegration(snapshot.logs, …)` into the shared
 * chat panel and `GameChatPopupOverlay`.
 *
 * Pass the returned function as the `sendMessage` arg of
 * `useGameChatIntegration` — that's all a new game needs to make chat work.
 *
 * Real-time games without a `gameSessionModel` session (e.g. Glimworm) cannot
 * use this; they broadcast chat over their own gateway instead.
 */
export function useGameChatSend(
  roomId: string,
  userId: string | null,
  gameType?: string,
): (message: string, scope: ChatScope) => void {
  return useCallback(
    (message: string, scope: ChatScope) => {
      if (!userId) return;
      const event =
        gameType === 'texas_holdem_v1'
          ? 'games.session.holdem_history_note'
          : 'games.session.history_note';
      gameSocket.emit(event, { roomId, userId, message, scope });
    },
    [roomId, userId, gameType],
  );
}
