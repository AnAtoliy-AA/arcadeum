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

/**
 * Hook that monitors log entries for omniscience.reveal messages from Deity pack
 * and opens the modal when a new one is detected.
 */
export function useOmniscienceFromLogs({
  logs,
  currentUserId,
  setOmniscienceModal,
}: UseOmniscienceFromLogsOptions) {
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

    // Check the latest logs for omniscience.reveal entries meant for current user
    for (const log of logs) {
      // Skip already processed logs
      if (processedLogIdsRef.current.has(log.id)) continue;

      // Mark as processed immediately to avoid duplicate handling
      processedLogIdsRef.current.add(log.id);

      // Check if this is a omniscience.reveal message for the current user
      if (
        log.message?.startsWith('omniscience.reveal:') &&
        log.scope === 'private' &&
        log.senderId === currentUserId
      ) {
        // Parse the hands from the log message
        // format: "omniscience.reveal:playerId1:card1,card2|playerId2:card3,card4"
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
  }, [logs, currentUserId, setOmniscienceModal]);
}
