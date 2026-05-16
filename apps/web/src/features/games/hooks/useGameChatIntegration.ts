import { useEffect } from 'react';
import { useGameChatStore } from '@/widgets/GameChat';
import type {
  ChatLogEntry,
  ChatScope,
  ChatDisplayNameResolver,
  ChatActorColorResolver,
} from '@/widgets/GameChat';

type GameLog = ChatLogEntry;

export function useGameChatIntegration(
  logs: GameLog[] | undefined,
  sendMessage: ((message: string, scope: ChatScope) => void) | undefined,
  resolveDisplayName?: ChatDisplayNameResolver,
  resolveActorColor?: ChatActorColorResolver,
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
    useGameChatStore
      .getState()
      .registerResolveDisplayName(resolveDisplayName ?? null);
  }, [resolveDisplayName]);

  useEffect(() => {
    useGameChatStore
      .getState()
      .registerResolveActorColor(resolveActorColor ?? null);
  }, [resolveActorColor]);

  useEffect(() => {
    return () => useGameChatStore.getState().clear();
  }, []);
}
