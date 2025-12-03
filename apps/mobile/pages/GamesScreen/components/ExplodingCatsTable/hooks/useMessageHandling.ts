import { useState, useEffect, useCallback } from 'react';
import type { LogVisibility } from '../types';

export function useMessageHandling(
  sessionId: string | undefined,
  isCurrentUserPlayer: boolean,
  onPostHistoryNote?: (message: string, visibility: LogVisibility) => Promise<void>,
) {
  const [messageDraft, setMessageDraft] = useState('');
  const [messageVisibility, setMessageVisibility] =
    useState<LogVisibility>('all');
  const [historySending, setHistorySending] = useState(false);

  const trimmedMessage = messageDraft.trim();
  const canSendHistoryMessage =
    isCurrentUserPlayer && trimmedMessage.length > 0;

  useEffect(() => {
    setMessageDraft('');
    setMessageVisibility('all');
    setHistorySending(false);
  }, [sessionId]);

  const handleSendHistoryNote = useCallback(async () => {
    if (!canSendHistoryMessage || historySending) {
      return;
    }

    if (!onPostHistoryNote) {
      setMessageDraft('');
      return;
    }

    setHistorySending(true);
    try {
      await onPostHistoryNote(trimmedMessage, messageVisibility);
      setMessageDraft('');
    } finally {
      setHistorySending(false);
    }
  }, [
    canSendHistoryMessage,
    historySending,
    onPostHistoryNote,
    trimmedMessage,
    messageVisibility,
  ]);

  const toggleMessageVisibility = useCallback(() => {
    setMessageVisibility((prev) => (prev === 'all' ? 'players' : 'all'));
  }, []);

  return {
    messageDraft,
    setMessageDraft,
    messageVisibility,
    toggleMessageVisibility,
    historySending,
    canSendHistoryMessage,
    handleSendHistoryNote,
  };
}
