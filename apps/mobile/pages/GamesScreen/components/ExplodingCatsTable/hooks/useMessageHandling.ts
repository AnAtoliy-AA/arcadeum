import { useState, useEffect, useCallback } from 'react';
import type { ChatScope } from '../types';

export function useMessageHandling(
  sessionId: string | undefined,
  isCurrentUserPlayer: boolean,
  onPostHistoryNote?: (message: string, visibility: ChatScope) => Promise<void>,
) {
  const [messageDraft, setMessageDraft] = useState('');
  const [messageVisibility, setMessageVisibility] = useState<ChatScope>('all');
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
    setMessageVisibility((prev: ChatScope) => {
      if (prev === 'all') return 'players';
      if (prev === 'players') return 'private';
      return 'all';
    });
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
