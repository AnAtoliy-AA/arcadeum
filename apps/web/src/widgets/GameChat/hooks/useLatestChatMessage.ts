import { useState, useMemo, useCallback } from 'react';
import type { ChatLogEntry } from '../store/gameChatStore';

interface LatestChatMessage {
  id: string;
  senderId: string;
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
  // Only messages created after the hook mounted are eligible for a popup.
  // Otherwise every page refresh would replay the latest historical message
  // as if it had just been sent. useState's lazy initializer captures the
  // mount time exactly once.
  const [mountTime] = useState<number>(() => Date.now());

  const derivedMessage = useMemo<LatestChatMessage | null>(() => {
    if (logs.length === 0) return null;

    const lastChatMessage = [...logs]
      .reverse()
      .find((log) => {
        if (log.type !== 'message' || !log.senderId) return false;
        const t = log.createdAt
          ? new Date(log.createdAt).getTime()
          : Number.POSITIVE_INFINITY;
        return t > mountTime;
      });

    if (!lastChatMessage) return null;

    return {
      id: lastChatMessage.id,
      senderId: lastChatMessage.senderId || '',
      senderName: lastChatMessage.senderName || 'Player',
      message: lastChatMessage.message,
    };
  }, [logs, mountTime]);

  const latestMessage = useMemo(() => {
    return derivedMessage && derivedMessage.id !== dismissedId
      ? derivedMessage
      : null;
  }, [derivedMessage, dismissedId]);

  const dismiss = useCallback(() => {
    if (derivedMessage) {
      setDismissedId(derivedMessage.id);
    }
  }, [derivedMessage]);

  return { latestMessage, dismiss };
}
