'use client';
import { useEffect, useState } from 'react';
import { XStack } from 'tamagui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  TOURNAMENT_GAME_TYPES,
  TOURNAMENT_STATUSES,
  type AdminTournamentStatusFilter,
  type TournamentGameType,
} from '../api';

const STATUS_OPTIONS: AdminTournamentStatusFilter[] = [
  'all',
  ...TOURNAMENT_STATUSES,
];

export interface AdminTournamentsFiltersLabels {
  searchPlaceholder: string;
  statusLabels: Record<AdminTournamentStatusFilter, string>;
  gameTypeFilterAll: string;
  gameTypeLabels: Record<TournamentGameType, string>;
  newButton: string;
}

export interface AdminTournamentsFiltersProps {
  q: string;
  status: AdminTournamentStatusFilter;
  gameType: TournamentGameType | null;
  onChange: (next: {
    q: string;
    status: AdminTournamentStatusFilter;
    gameType: TournamentGameType | null;
  }) => void;
  onNewClick: () => void;
  labels: AdminTournamentsFiltersLabels;
}

const SELECT_STYLE = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #555',
  background: 'transparent',
  color: 'inherit' as const,
};

export function AdminTournamentsFilters({
  q,
  status,
  gameType,
  onChange,
  onNewClick,
  labels,
}: AdminTournamentsFiltersProps) {
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebounce(localQ, 300);

  useEffect(() => {
    if (debouncedQ !== q) onChange({ q: debouncedQ, status, gameType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  return (
    <XStack gap="$3" alignItems="center" flexWrap="wrap">
      <input
        placeholder={labels.searchPlaceholder}
        value={localQ}
        onChange={(e) => setLocalQ(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #555',
          background: 'transparent',
          color: 'inherit',
          minWidth: 220,
        }}
      />
      <select
        data-testid="status-filter"
        value={status}
        onChange={(e) =>
          onChange({
            q: localQ,
            status: e.target.value as AdminTournamentStatusFilter,
            gameType,
          })
        }
        style={SELECT_STYLE}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {labels.statusLabels[s]}
          </option>
        ))}
      </select>
      <select
        data-testid="gametype-filter"
        value={gameType ?? ''}
        onChange={(e) =>
          onChange({
            q: localQ,
            status,
            gameType:
              e.target.value === ''
                ? null
                : (e.target.value as TournamentGameType),
          })
        }
        style={SELECT_STYLE}
      >
        <option value="">{labels.gameTypeFilterAll}</option>
        {TOURNAMENT_GAME_TYPES.map((g) => (
          <option key={g} value={g}>
            {labels.gameTypeLabels[g]}
          </option>
        ))}
      </select>
      <XStack flex={1} />
      <button
        type="button"
        onClick={onNewClick}
        data-testid="new-tournament"
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          border: '1px solid #555',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {labels.newButton}
      </button>
    </XStack>
  );
}
