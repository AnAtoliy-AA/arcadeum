'use client';
import { useEffect, useState } from 'react';
import { Button } from '@arcadeum/ui';
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
    if (debouncedQ !== q) {
      onChange({ q: debouncedQ, status, gameType });
    }
  }, [debouncedQ, q, status, gameType, onChange]);

  return (
    <div className="flex flex-row gap-3 items-center flex-wrap">
      <input
        placeholder={labels.searchPlaceholder}
        value={localQ}
        onChange={(e) => setLocalQ(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorText)] min-w-[220px] text-sm focus:outline-none focus:border-[var(--primary)]"
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
        className="px-3 py-1.5 rounded-lg border border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorText)] text-sm cursor-pointer focus:outline-none focus:border-[var(--primary)]"
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
        className="px-3 py-1.5 rounded-lg border border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorText)] text-sm cursor-pointer focus:outline-none focus:border-[var(--primary)]"
      >
        <option value="">{labels.gameTypeFilterAll}</option>
        {TOURNAMENT_GAME_TYPES.map((g) => (
          <option key={g} value={g}>
            {labels.gameTypeLabels[g]}
          </option>
        ))}
      </select>
      <div className="flex flex-row items-stretch flex-1" />
      <Button
        variant="outline"
        size="sm"
        onClick={onNewClick}
        data-testid="new-tournament"
      >
        {labels.newButton}
      </Button>
    </div>
  );
}
