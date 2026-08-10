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

const EMOJI_STARTER = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

function isEmoteMessage(message: string): boolean {
  if (!message) return false;
  const firstCodePoint = message.codePointAt(0);
  if (firstCodePoint === undefined) return false;
  return EMOJI_STARTER.test(String.fromCodePoint(firstCodePoint));
}

export function useLatestChatMessage(
  logs: ChatLogEntry[],
): UseLatestChatMessageResult {
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [mountTime] = useState<number>(() => Date.now());

  const derivedMessage = useMemo<LatestChatMessage | null>(() => {
    if (logs.length === 0) return null;

    const lastChatMessage = [...logs]
      .reverse()
      .find((log) => {
        if (log.type !== 'message' || !log.senderId) return false;
        if (isEmoteMessage(log.message)) return false;
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
