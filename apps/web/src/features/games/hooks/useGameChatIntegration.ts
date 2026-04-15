import { useEffect } from 'react';
import { useGameChatStore } from '@/widgets/GameChat';
import type { ChatLogEntry, ChatScope } from '@/widgets/GameChat';

type GameLog = ChatLogEntry;

/**
 * Syncs game snapshot logs into the global GameChat store
 * and registers the sendMessage function for chat integration.
 * Clears the store on unmount.
 */
export function useGameChatIntegration(
  logs: GameLog[] | undefined,
  sendMessage: ((message: string, scope: ChatScope) => void) | undefined,
): void {
  // Sync logs to store
  useEffect(() => {
    useGameChatStore.getState().setLogs(logs ?? []);
  }, [logs]);

  // Register sendMessage; clear store on unmount
  useEffect(() => {
    if (sendMessage) {
      useGameChatStore.getState().registerSendMessage(sendMessage);
    }
    return () => useGameChatStore.getState().clear();
  }, [sendMessage]);
}
