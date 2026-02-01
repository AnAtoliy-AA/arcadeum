import { GamesSearch } from '@/features/games';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  FilterChip,
  FilterChips,
  FilterGroup,
  FilterLabel,
  Filters,
} from '../styles';
import type { GamesParticipationFilter, GamesStatusFilter } from '../types';

interface GamesFiltersProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  statusFilter: GamesStatusFilter;
  onStatusChange: (status: GamesStatusFilter) => void;
  participationFilter: GamesParticipationFilter;
  onParticipationChange: (participation: GamesParticipationFilter) => void;
  isAuthenticated: boolean;
}

export function GamesFilters({
  searchQuery,
  onSearch,
  statusFilter,
  onStatusChange,
  participationFilter,
  onParticipationChange,
  isAuthenticated,
}: GamesFiltersProps) {
  const { t } = useTranslation();

  return (
    <Filters>
      <GamesSearch
        onSearch={onSearch}
        initialValue={searchQuery}
        placeholder={t('games.lounge.searchPlaceholder') || 'Search games...'}
        buttonLabel={t('games.lounge.searchButton') || 'Search'}
      />
      <FilterGroup>
        <FilterLabel>{t('games.lounge.filters.statusLabel')}</FilterLabel>
        <FilterChips>
          {(['all', 'lobby', 'in_progress', 'completed'] as const).map(
            (value) => {
              const statusKeys = {
                all: 'games.lounge.filters.status.all',
                lobby: 'games.lounge.filters.status.lobby',
                in_progress: 'games.lounge.filters.status.in_progress',
                completed: 'games.lounge.filters.status.completed',
              } as const;
              const label = t(statusKeys[value]);
              return (
                <FilterChip
                  key={value}
                  $active={statusFilter === value}
                  onClick={() => onStatusChange(value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onStatusChange(value);
                    }
                  }}
                  aria-label={`Filter by status: ${label || value}`}
                  aria-pressed={statusFilter === value}
                  role="button"
                  tabIndex={0}
                >
                  {label || value}
                </FilterChip>
              );
            },
          )}
        </FilterChips>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>
          {t('games.lounge.filters.participationLabel')}
        </FilterLabel>
        <FilterChips>
          {(['all', 'hosting', 'joined', 'not_joined'] as const).map(
            (value) => {
              const participationKeys = {
                all: 'games.lounge.filters.participation.all',
                hosting: 'games.lounge.filters.participation.hosting',
                joined: 'games.lounge.filters.participation.joined',
                not_joined: 'games.lounge.filters.participation.not_joined',
              } as const;
              const label = t(participationKeys[value]);
              return (
                <FilterChip
                  key={value}
                  $active={participationFilter === value}
                  onClick={() => {
                    if (value !== 'all' && !isAuthenticated) {
                      // Optionally show a login prompt or ignore
                      return;
                    }
                    onParticipationChange(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (value !== 'all' && !isAuthenticated) {
                        return;
                      }
                      e.preventDefault();
                      onParticipationChange(value);
                    }
                  }}
                  $disabled={value !== 'all' && !isAuthenticated}
                  aria-label={`Filter by participation: ${label || value}`}
                  aria-pressed={participationFilter === value}
                  role="button"
                  tabIndex={value !== 'all' && !isAuthenticated ? -1 : 0}
                >
                  {label || value}
                </FilterChip>
              );
            },
          )}
        </FilterChips>
      </FilterGroup>
    </Filters>
  );
}
