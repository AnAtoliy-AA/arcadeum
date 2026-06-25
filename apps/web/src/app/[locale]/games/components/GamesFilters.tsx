import { GamesSearch } from '@/features/games';
import { XStack, Text } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { FilterChips, FilterGroup, FilterLabel, Filters } from '../styles';
import { FilterChip } from '@arcadeum/ui';
import type { GamesParticipationFilter, GamesStatusFilter } from '../types';
import { STATUS_VALUES } from '../types';

interface GamesFiltersProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  statusFilter: GamesStatusFilter;
  onStatusChange: (statuses: GamesStatusFilter) => void;
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
  const ALL_STATUSES_COUNT = 3;

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
              const label = t(statusKeys[value] as TranslationKey);
              const allSelected =
                statusFilter.length === 0 ||
                statusFilter.length === ALL_STATUSES_COUNT;
              const isActive =
                value === 'all'
                  ? allSelected
                  : allSelected || statusFilter.includes(value);
              return (
                <FilterChip
                  key={value}
                  active={isActive}
                  onClick={() => {
                    if (value === 'all') {
                      onStatusChange([]);
                    } else if (allSelected) {
                      onStatusChange(STATUS_VALUES.filter((s) => s !== value));
                    } else {
                      const next = statusFilter.includes(value)
                        ? statusFilter.filter((s) => s !== value)
                        : [...statusFilter, value];
                      onStatusChange(next);
                    }
                  }}
                  aria-label={`Filter by status: ${label || value}`}
                  aria-pressed={isActive}
                >
                  {label || value}
                  {isActive ? ' ✓' : ''}
                </FilterChip>
              );
            },
          )}
        </FilterChips>
      </FilterGroup>

      <FilterGroup>
        <XStack gap="$2" alignItems="center">
          <FilterLabel>
            {t('games.lounge.filters.participationLabel')}
          </FilterLabel>
          {!isAuthenticated && (
            <Text
              fontSize="$2"
              color="$color"
              opacity={0.6}
              fontStyle="italic"
              marginBottom="$1"
            >
              ({t('games.create.loginRequired').toLowerCase()})
            </Text>
          )}
        </XStack>
        <FilterChips>
          {(['all', 'hosting', 'joined', 'not_joined'] as const).map(
            (value) => {
              const participationKeys = {
                all: 'games.lounge.filters.participation.all',
                hosting: 'games.lounge.filters.participation.hosting',
                joined: 'games.lounge.filters.participation.joined',
                not_joined: 'games.lounge.filters.participation.not_joined',
              } as const;
              const label = t(participationKeys[value] as TranslationKey);
              const isActive = participationFilter === value;
              return (
                <FilterChip
                  key={value}
                  active={isActive}
                  disabled={value !== 'all' && !isAuthenticated}
                  onClick={() => onParticipationChange(value)}
                  aria-label={`Filter by participation: ${label || value}`}
                  aria-pressed={isActive}
                >
                  {label || value}
                  {isActive ? ' ✓' : ''}
                </FilterChip>
              );
            },
          )}
        </FilterChips>
      </FilterGroup>
    </Filters>
  );
}
