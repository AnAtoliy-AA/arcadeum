'use client';

import { FilterChip, Select } from '@arcadeum/ui';
import type { ActivityFeedFilter } from '@/shared/api/activity';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { getFilterableGames } from '../lib/activityGameMeta';

const FILTERS: Array<{ id: ActivityFeedFilter; key: TranslationKey }> = [
  { id: 'all', key: 'home.activityFeed.filterAll' },
  { id: 'wins', key: 'home.activityFeed.filterWins' },
  { id: 'achievements', key: 'home.activityFeed.filterAchievements' },
  { id: 'tournaments', key: 'home.activityFeed.filterTournaments' },
];

const ALL_GAMES = 'all';

interface ActivityFeedFiltersProps {
  filter: ActivityFeedFilter;
  gameId: string;
  onFilterChange: (filter: ActivityFeedFilter) => void;
  onGameChange: (gameId: string) => void;
}

export function ActivityFeedFilters({
  filter,
  gameId,
  onFilterChange,
  onGameChange,
}: ActivityFeedFiltersProps) {
  const { t } = useTranslation();
  const games = getFilterableGames()
    .map((g) => ({ value: g.id, label: g.nameKey ? t(g.nameKey) : g.id }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label={t('home.activityFeed.filtersLabel')}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        {FILTERS.map((f) => (
          <FilterChip
            key={f.id}
            active={filter === f.id}
            onClick={() => onFilterChange(f.id)}
            data-testid={`activity-filter-${f.id}`}
          >
            {t(f.key)}
          </FilterChip>
        ))}
      </div>
      <div className="w-full sm:w-56">
        <Select
          size="sm"
          fullWidth
          aria-label={t('home.activityFeed.gameFilterLabel')}
          value={gameId || ALL_GAMES}
          onValueChange={(v) => onGameChange(v === ALL_GAMES ? '' : v)}
          options={[
            { value: ALL_GAMES, label: t('home.activityFeed.allGames') },
            ...games,
          ]}
        />
      </div>
    </div>
  );
}
