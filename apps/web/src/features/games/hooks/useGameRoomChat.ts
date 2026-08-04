import { useEffect, useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { useGameChatStore } from '@/widgets/GameChat';
import type { ChatScope, CriticalLogEntry } from '@/shared/types/games';

/**
 * Lobby-level chat that works WITHOUT a game session.
 * Stores messages in the room document and broadcasts via
 * `games.room.chat` / `games.room.delete_chat` socket events.
 *
 * When a session exists (active game), the per-game
 * `useGameChatIntegration` takes over instead.
 */
export function useGameRoomChat(
  roomId: string,
  userId: string | null,
  isLobby: boolean,
): {
  sendMessage: ((message: string, scope: ChatScope) => void) | undefined;
  deleteMessage: ((messageId: string) => void) | undefined;
} {
  useEffect(() => {
    if (!isLobby || !userId) return;

    const handleChat = (entry: CriticalLogEntry) => {
      useGameChatStore.getState().addLog(entry);
    };

    const handleDelete = (payload: { messageId: string }) => {
      const { messageId } = payload;
      useGameChatStore.setState((s) => ({
        logs: s.logs.filter((l) => l.id !== messageId),
      }));
    };

    gameSocket.on('games.room.chat', handleChat);
    gameSocket.on('games.room.delete_chat', handleDelete);

    return () => {
      gameSocket.off('games.room.chat', handleChat);
      gameSocket.off('games.room.delete_chat', handleDelete);
    };
  }, [isLobby, userId]);

  const sendMessage = useCallback(
    (message: string, scope: ChatScope) => {
      if (!userId || !isLobby) return;
      gameSocket.emit('games.room.chat', { roomId, userId, message, scope });
    },
    [roomId, userId, isLobby],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!userId || !isLobby) return;
      gameSocket.emit('games.room.delete_chat', {
        roomId,
        userId,
        messageId,
      });
    },
    [roomId, userId, isLobby],
  );

  return {
    sendMessage: isLobby ? sendMessage : undefined,
    deleteMessage: isLobby ? deleteMessage : undefined,
  };
}
