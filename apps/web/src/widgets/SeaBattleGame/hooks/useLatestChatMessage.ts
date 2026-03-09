import { useState, useRef, useCallback, useEffect } from 'react';
import type { GameLogEntry } from '../types';

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
  logs: GameLogEntry[],
): UseLatestChatMessageResult {
  const [latestMessage, setLatestMessage] = useState<LatestChatMessage | null>(
    null,
  );
  const previousLogCountRef = useRef(logs.length);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setLatestMessage(null);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const startDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => {
      setLatestMessage(null);
      dismissTimerRef.current = null;
    }, 5000);
  }, []);

  useEffect(() => {
    const prevCount = previousLogCountRef.current;
    previousLogCountRef.current = logs.length;

    if (logs.length <= prevCount) return;

    const newLogs = logs.slice(prevCount);
    const lastChatMessage = newLogs
      .filter((log) => log.type === 'message' && log.senderId)
      .pop();

    if (lastChatMessage) {
      setLatestMessage({
        id: lastChatMessage.id,
        senderName: lastChatMessage.senderName || 'Player',
        message: lastChatMessage.message,
      });
      startDismissTimer();
    }
  }, [logs, startDismissTimer]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return { latestMessage, dismiss };
}
