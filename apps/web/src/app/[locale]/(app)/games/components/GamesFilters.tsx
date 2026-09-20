'use client';

import { useCallback } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type {
  GamesParticipationFilter,
  GamesStatusFilter,
  GamesCategoryFilter,
  GamesAiVsAiFilter,
} from '../types';
import { STATUS_VALUES } from '../types';
import { SearchInput } from '@arcadeum/ui';
import { StatusDropdown } from './StatusDropdown';
import { CategoryDropdown } from './CategoryDropdown';
import { ParticipationMenu } from './ParticipationMenu';
import { BotIcon } from './FilterIcons';
import { cx } from '@arcadeum/ui/utils/cx';

export interface GamesFiltersProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  statusFilter: GamesStatusFilter;
  onStatusChange: (statuses: GamesStatusFilter) => void;
  participationFilter: GamesParticipationFilter;
  onParticipationChange: (participation: GamesParticipationFilter) => void;
  categoryFilter: GamesCategoryFilter;
  onCategoryChange: (category: GamesCategoryFilter) => void;
  aiVsAiFilter: GamesAiVsAiFilter;
  onAiVsAiChange: (filter: GamesAiVsAiFilter) => void;
  canFilterParticipation: boolean;
  onClearAll?: () => void;
}

export function GamesFilters({
  searchQuery,
  onSearch,
  statusFilter,
  onStatusChange,
  participationFilter,
  onParticipationChange,
  categoryFilter,
  onCategoryChange,
  aiVsAiFilter,
  onAiVsAiChange,
  canFilterParticipation,
  onClearAll,
}: GamesFiltersProps) {
  const { t } = useTranslation();

  const isAllStatus =
    statusFilter.length === 0 || statusFilter.length === STATUS_VALUES.length;

  const hasSearch = Boolean(searchQuery.trim());
  const hasCategory = Boolean(categoryFilter);
  const hasStatus = !isAllStatus;
  const hasAi = aiVsAiFilter === 'ai_vs_ai';
  const hasParticipation = participationFilter !== 'all';

  const activeCount =
    (hasSearch ? 1 : 0) +
    (hasCategory ? 1 : 0) +
    (hasStatus ? 1 : 0) +
    (hasAi ? 1 : 0) +
    (hasParticipation ? 1 : 0);

  const handleClearAll = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    } else {
      onSearch('');
      onCategoryChange('');
      onStatusChange([]);
      onAiVsAiChange('all');
      onParticipationChange('all');
    }
  }, [
    onClearAll,
    onSearch,
    onCategoryChange,
    onStatusChange,
    onAiVsAiChange,
    onParticipationChange,
  ]);

  return (
    <div
      data-testid="games-filters-container"
      className="relative z-30 box-border flex w-full max-w-full flex-col gap-3 rounded-2xl border border-[var(--glassBorderStrong)] bg-[var(--background)] p-3 shadow-lg backdrop-blur-xl sm:p-4 overflow-visible"
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between overflow-visible">
        <div className="w-full flex-1 max-w-full lg:max-w-md xl:max-w-xl">
          <SearchInput
            fullWidth
            size="sm"
            value={searchQuery}
            onChange={onSearch}
            placeholder={
              t('games.lounge.searchPlaceholder') || 'Search games...'
            }
            aria-label={
              t('games.lounge.searchPlaceholder') || 'Search games...'
            }
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-visible shrink-0">
          <StatusDropdown
            statusFilter={statusFilter}
            onStatusChange={onStatusChange}
          />

          <CategoryDropdown
            categoryFilter={categoryFilter}
            onCategoryChange={onCategoryChange}
          />

          <ParticipationMenu
            value={participationFilter}
            onChange={onParticipationChange}
            canFilter={canFilterParticipation}
          />

          <button
            type="button"
            onClick={() =>
              onAiVsAiChange(aiVsAiFilter === 'ai_vs_ai' ? 'all' : 'ai_vs_ai')
            }
            aria-label="Toggle AI vs AI mode"
            aria-pressed={aiVsAiFilter === 'ai_vs_ai'}
            className={cx(
              'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all select-none cursor-pointer',
              aiVsAiFilter === 'ai_vs_ai'
                ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--color)] shadow-sm'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)]',
            )}
          >
            <BotIcon className="h-3.5 w-3.5" />
            <span>{t('games.lounge.filters.aiVsAi') || 'AI vs AI'}</span>
          </button>

          <div
            className={cx(
              'w-[115px] shrink-0 flex items-center justify-end transition-opacity duration-200',
              activeCount > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            <button
              type="button"
              onClick={handleClearAll}
              data-testid="rooms-filter-clear-all"
              tabIndex={activeCount > 0 ? 0 : -1}
              className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-500/20 active:scale-95 whitespace-nowrap"
            >
              <svg
                className="h-3 w-3 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>{t('games.lounge.filters.clearAll')}</span>
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/20 px-1 text-[10px] font-bold text-rose-400">
                {activeCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
