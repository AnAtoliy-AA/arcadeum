import { useEffect, useRef } from 'react';
import type { CriticalCard, CriticalLogEntry } from '../types';

interface UseSeeTheFutureFromLogsOptions {
  logs: CriticalLogEntry[] | undefined;
  currentUserId: string | null;
  setSeeTheFutureModal: (state: { cards: CriticalCard[] } | null) => void;
}

/**
 * Hook that monitors log entries for seeTheFuture.reveal messages from future pack cards
 * and opens the modal when a new one is detected.
 */
export function useSeeTheFutureFromLogs({
  logs,
  currentUserId,
  setSeeTheFutureModal,
}: UseSeeTheFutureFromLogsOptions) {
  // Track processed log IDs to avoid reopening modal
  const processedLogIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!logs || !currentUserId) return;

    // On first run, mark all existing logs as processed (don't show modal for old entries)
    if (!initializedRef.current) {
      initializedRef.current = true;
      for (const log of logs) {
        processedLogIdsRef.current.add(log.id);
      }
      return;
    }

    // Check the latest logs for seeTheFuture.reveal entries meant for current user
    for (const log of logs) {
      // Skip already processed logs
      if (processedLogIdsRef.current.has(log.id)) continue;

      // Mark as processed immediately to avoid duplicate handling
      processedLogIdsRef.current.add(log.id);

      // Check if this is a seeTheFuture.reveal message for the current user
      if (
        log.message?.startsWith('seeTheFuture.reveal:') &&
        log.scope === 'private' &&
        log.senderId === currentUserId
      ) {
        // Parse the cards from the log message
        const cardKeysStr = log.message.slice('seeTheFuture.reveal:'.length);
        const cardKeys = cardKeysStr.split(',');
        const cards = cardKeys
          .filter((key) => key.startsWith('cards:'))
          .map((key) => key.slice('cards:'.length) as CriticalCard);

        if (cards.length > 0) {
          setSeeTheFutureModal({ cards });
        }
      }
    }
  }, [logs, currentUserId, setSeeTheFutureModal]);
}
