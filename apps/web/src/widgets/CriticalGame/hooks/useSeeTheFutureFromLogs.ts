import { useEffect, useRef } from 'react';
import type { CriticalCard, CriticalLogEntry } from '../types';

interface UseSeeTheFutureFromLogsOptions {
  logs: CriticalLogEntry[] | undefined;
  currentUserId: string | null;
  setSeeTheFutureModal: (state: { cards: CriticalCard[] } | null) => void;
}

export function useSeeTheFutureFromLogs({
  logs,
  currentUserId,
  setSeeTheFutureModal,
}: UseSeeTheFutureFromLogsOptions) {
  const processedIndexRef = useRef(-1);

  useEffect(() => {
    if (!logs || !currentUserId) return;

    if (processedIndexRef.current === -1) {
      processedIndexRef.current = logs.length;
      return;
    }

    for (let i = processedIndexRef.current; i < logs.length; i++) {
      const log = logs[i];

      if (
        log.message?.startsWith('seeTheFuture.reveal:') &&
        log.scope === 'private' &&
        log.senderId === currentUserId
      ) {
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

    processedIndexRef.current = logs.length;
  }, [logs, currentUserId, setSeeTheFutureModal]);
}
