import { GamesSearch } from '@/features/games';
import { XStack, Text } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { FilterChips, FilterGroup, FilterLabel, Filters } from '../styles';
import { Button } from '@arcadeum/ui';
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
              const label = t(statusKeys[value] as TranslationKey);
              const isActive = statusFilter === value;
              return (
                <Button
                  key={value}
                  variant="chip"
                  size="sm"
                  isActive={isActive}
                  borderColor={isActive ? 'rgba(99, 102, 241, 0.5)' : undefined}
                  onClick={() => onStatusChange(value)}
                  aria-label={`Filter by status: ${label || value}`}
                  aria-pressed={isActive}
                >
                  {label || value}
                </Button>
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
                <Button
                  key={value}
                  variant="chip"
                  size="sm"
                  isActive={isActive}
                  disabled={value !== 'all' && !isAuthenticated}
                  borderColor={isActive ? 'rgba(99, 102, 241, 0.5)' : undefined}
                  onClick={() => onParticipationChange(value)}
                  aria-label={`Filter by participation: ${label || value}`}
                  aria-pressed={isActive}
                >
                  {label || value}
                </Button>
              );
            },
          )}
        </FilterChips>
      </FilterGroup>
    </Filters>
  );
}
