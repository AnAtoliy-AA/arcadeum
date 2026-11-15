import { useEffect, useCallback } from 'react';
import { gameSocket } from '@/shared/lib/socket';
import { maybeDecrypt } from '@/shared/lib/socket-encryption';
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
  _isLobby?: boolean,
) {
  useEffect(() => {
    if (!roomId) return;

    const handleChat = async (payload: unknown) => {
      const entry = await maybeDecrypt<CriticalLogEntry>(payload);
      if (entry?.id) {
        useGameChatStore.getState().addLog({
          ...entry,
          type: entry.type || 'message',
        });
      }
    };

    const handleDelete = async (payload: unknown) => {
      const data = await maybeDecrypt<{ messageId: string }>(payload);
      if (data?.messageId) {
        const messageId = data.messageId;
        useGameChatStore.setState((s) => ({
          logs: s.logs.filter((l) => l.id !== messageId),
        }));
      }
    };

    gameSocket.on('games.room.chat', handleChat);
    gameSocket.on('games.room.delete_chat', handleDelete);

    return () => {
      gameSocket.off('games.room.chat', handleChat);
      gameSocket.off('games.room.delete_chat', handleDelete);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (message: string, scope: ChatScope) => {
      if (!userId) return;
      gameSocket.emit('games.room.chat', { roomId, userId, message, scope });
    },
    [roomId, userId],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!userId) return;
      gameSocket.emit('games.room.delete_chat', {
        roomId,
        userId,
        messageId,
      });
    },
    [roomId, userId],
  );

  return {
    sendMessage,
    deleteMessage,
  } as const;
}
