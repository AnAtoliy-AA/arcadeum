import { useState, useMemo, useCallback } from 'react';
import type { ChatLogEntry } from '../store/gameChatStore';

interface LatestChatMessage {
  id: string;
  senderName: string;
  message: string;
}

interface UseLatestChatMessageResult {
  latestMessage: LatestChatMessage | null;
  dismiss: () => void;
}

export function useLatestChatMessage(
  logs: ChatLogEntry[],
): UseLatestChatMessageResult {
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const derivedMessage = useMemo<LatestChatMessage | null>(() => {
    if (logs.length === 0) return null;

    const lastChatMessage = [...logs]
      .reverse()
      .find((log) => log.type === 'message' && log.senderId);

    if (!lastChatMessage) return null;

    return {
      id: lastChatMessage.id,
      senderName: lastChatMessage.senderName || 'Player',
      message: lastChatMessage.message,
    };
  }, [logs]);

  const latestMessage =
    derivedMessage && derivedMessage.id !== dismissedId ? derivedMessage : null;

  const dismiss = useCallback(() => {
    if (derivedMessage) {
      setDismissedId(derivedMessage.id);
    }
  }, [derivedMessage]);

  return { latestMessage, dismiss };
}
