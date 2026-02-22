import { useEffect, useRef } from 'react';
import type {
  CriticalCard,
  CriticalLogEntry,
  OmniscienceModalState,
} from '../types';

interface UseOmniscienceFromLogsOptions {
  logs: CriticalLogEntry[] | undefined;
  currentUserId: string | null;
  setOmniscienceModal: (state: OmniscienceModalState | null) => void;
}

export function useOmniscienceFromLogs({
  logs,
  currentUserId,
  setOmniscienceModal,
}: UseOmniscienceFromLogsOptions) {
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
        log.message?.startsWith('omniscience.reveal:') &&
        log.scope === 'private' &&
        log.senderId === currentUserId
      ) {
        const content = log.message.slice('omniscience.reveal:'.length);
        const sections = content.split('|');
        const hands = sections.map((section) => {
          const firstColon = section.indexOf(':');
          if (firstColon === -1)
            return { playerId: 'unknown', cards: [] as CriticalCard[] };

          const playerId = section.slice(0, firstColon);
          const cardStr = section.slice(firstColon + 1);

          const cards = cardStr
            .split(',')
            .map((c) => c.trim() as CriticalCard)
            .filter(Boolean);

          return { playerId, cards };
        });

        if (hands.length > 0) {
          setOmniscienceModal({ hands });
        }
      }
    }

    processedIndexRef.current = logs.length;
  }, [logs, currentUserId, setOmniscienceModal]);
}
