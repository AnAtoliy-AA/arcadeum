'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import type { HistorySummary, HistoryParticipant } from '../types';
import { getGameDisplayName } from '../utils';
import {
  EntryCard,
  EntryHeader,
  EntryTitleGroup,
  EntryGameName,
  EntryRoomName,
  EntryStatus,
  EntryMeta,
  EntryFooter,
  EntryTimestamp,
  EntryViewDetails,
} from '../styles';

interface HistoryCardProps {
  entry: HistorySummary;
  onSelect: (entry: HistorySummary) => void;
  formatParticipantName: (
    participant: HistoryParticipant | undefined | null,
  ) => string;
  formatDate: (dateString: string | null | undefined) => string;
}

export function HistoryCard({
  entry,
  onSelect,
  formatParticipantName,
  formatDate,
}: HistoryCardProps) {
  const { t } = useTranslation();

  return (
    <EntryCard onClick={() => onSelect(entry)} data-testid="history-card">
      <EntryHeader>
        <EntryTitleGroup>
          <EntryGameName
            title={getGameDisplayName(entry.gameId, t, entry.gameOptions)}
          >
            {getGameDisplayName(entry.gameId, t, entry.gameOptions)}
          </EntryGameName>
          <EntryRoomName title={entry.roomName}>{entry.roomName}</EntryRoomName>
        </EntryTitleGroup>
        <EntryStatus data-testid="history-status">
          {t(`history.status.${entry.status}`) || entry.status}
        </EntryStatus>
      </EntryHeader>
      <EntryMeta>
        {entry.participants?.length ? (
          entry.participants.map((p, index) => (
            <span key={p.id}>
              {formatParticipantName(p)}
              {p.isHost && ' 👑'}
              {index < (entry.participants?.length || 0) - 1 && ', '}
            </span>
          ))
        ) : (
          <span>
            {formatParticipantName(entry.host)}
            {entry.host?.isHost && ' 👑'}
          </span>
        )}
      </EntryMeta>
      <EntryFooter>
        <EntryTimestamp>{formatDate(entry.lastActivityAt)}</EntryTimestamp>
        <EntryViewDetails>
          {t('history.actions.viewDetails')} →
        </EntryViewDetails>
      </EntryFooter>
    </EntryCard>
  );
}
