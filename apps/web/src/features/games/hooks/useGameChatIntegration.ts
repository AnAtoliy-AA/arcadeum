import { useEffect } from 'react';
import { useGameChatStore } from '@/widgets/GameChat';
import type { ChatLogEntry, ChatScope } from '@/widgets/GameChat';

type GameLog = ChatLogEntry;

export function useGameChatIntegration(
  logs: GameLog[] | undefined,
  sendMessage: ((message: string, scope: ChatScope) => void) | undefined,
): void {
  useEffect(() => {
    useGameChatStore.getState().setLogs(logs ?? []);
  }, [logs]);

  useEffect(() => {
    if (sendMessage) {
      useGameChatStore.getState().registerSendMessage(sendMessage);
    }
  }, [sendMessage]);

  useEffect(() => {
    return () => useGameChatStore.getState().clear();
  }, []);
}
