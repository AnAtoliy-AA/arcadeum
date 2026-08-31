'use client';

import { useState, useCallback } from 'react';
import { GamesSearch } from '@/features/games';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { FilterChips, FilterGroup, FilterLabel, Filters } from '../styles';
import { FilterChip } from '@arcadeum/ui';
import type {
  GamesParticipationFilter,
  GamesStatusFilter,
  GamesCategoryFilter,
  GamesAiVsAiFilter,
} from '../types';
import { ALL_STATUS_VALUES, STATUS_VALUES, GAME_CATEGORIES } from '../types';
import { getCategoryLabelKey } from '@/features/games/registry';

interface GamesFiltersProps {
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
}

const STATUS_KEYS = {
  all: 'games.lounge.filters.status.all',
  lobby: 'games.lounge.filters.status.lobby',
  in_progress: 'games.lounge.filters.status.in_progress',
  completed: 'games.lounge.filters.status.completed',
} as const;

const PARTICIPATION_KEYS = {
  all: 'games.lounge.filters.participation.all',
  hosting: 'games.lounge.filters.participation.hosting',
  joined: 'games.lounge.filters.participation.joined',
  not_joined: 'games.lounge.filters.participation.not_joined',
} as const;

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
}: GamesFiltersProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStatusToggle = useCallback(
    (value: (typeof ALL_STATUS_VALUES)[number]) => {
      const allSelected =
        statusFilter.length === 0 ||
        statusFilter.length === STATUS_VALUES.length;

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
    },
    [statusFilter, onStatusChange],
  );

  const hasSearch = Boolean(searchQuery.trim());
  const hasCategory = Boolean(categoryFilter);
  const hasStatus =
    statusFilter.length > 0 && statusFilter.length < STATUS_VALUES.length;
  const hasAi = aiVsAiFilter === 'ai_vs_ai';
  const hasParticipation = participationFilter !== 'all';

  const activeCount =
    (hasSearch ? 1 : 0) +
    (hasCategory ? 1 : 0) +
    (hasStatus ? 1 : 0) +
    (hasAi ? 1 : 0) +
    (hasParticipation ? 1 : 0);

  const handleClearAll = useCallback(() => {
    onSearch('');
    onCategoryChange('');
    onStatusChange([]);
    onAiVsAiChange('all');
    onParticipationChange('all');
  }, [
    onSearch,
    onCategoryChange,
    onStatusChange,
    onAiVsAiChange,
    onParticipationChange,
  ]);

  return (
    <Filters>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <GamesSearch
            onSearch={onSearch}
            initialValue={searchQuery}
            placeholder={
              t('games.lounge.searchPlaceholder') || 'Search games...'
            }
            buttonLabel={t('games.lounge.searchButton') || 'Search'}
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              data-testid="rooms-filter-clear-all"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-95"
            >
              <span>✕</span>
              <span>{t('games.lounge.filters.clearAll')}</span>
              <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-200">
                {activeCount}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            data-testid="rooms-filter-toggle-advanced"
            className="inline-flex md:hidden cursor-pointer items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] active:scale-95"
          >
            <span>⚙️</span>
            <span>
              {showAdvanced
                ? t('games.lounge.filters.hideFilters')
                : t('games.lounge.filters.moreFilters')}
            </span>
            {(hasAi || hasParticipation) && (
              <span className="rounded-full bg-indigo-500/30 px-1.5 py-0.2 text-[10px] text-indigo-200">
                {(hasAi ? 1 : 0) + (hasParticipation ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <FilterGroup>
        <FilterLabel>
          {t('games.lounge.filters.categoryLabel') || 'Category'}
        </FilterLabel>
        <FilterChips>
          <FilterChip
            active={categoryFilter === ''}
            onClick={() => onCategoryChange('')}
            aria-label="Filter by category: All"
            aria-pressed={categoryFilter === ''}
          >
            {t('games.lounge.filters.status.all') || 'All'}
            {categoryFilter === '' ? ' ✓' : ''}
          </FilterChip>
          {GAME_CATEGORIES.map((cat) => {
            const labelKey = getCategoryLabelKey(cat);
            const label = labelKey ? t(labelKey as TranslationKey) : cat;
            const isActive = categoryFilter === cat;
            return (
              <FilterChip
                key={cat}
                active={isActive}
                onClick={() => onCategoryChange(isActive ? '' : cat)}
                aria-label={`Filter by category: ${label}`}
                aria-pressed={isActive}
              >
                {label || cat}
                {isActive ? ' ✓' : ''}
              </FilterChip>
            );
          })}
        </FilterChips>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel>{t('games.lounge.filters.statusLabel')}</FilterLabel>
        <FilterChips>
          {ALL_STATUS_VALUES.map((value) => {
            const label = t(STATUS_KEYS[value] as TranslationKey);
            const allSelected =
              statusFilter.length === 0 ||
              statusFilter.length === STATUS_VALUES.length;
            const isActive =
              value === 'all'
                ? allSelected
                : allSelected || statusFilter.includes(value);
            return (
              <FilterChip
                key={value}
                active={isActive}
                onClick={() => handleStatusToggle(value)}
                aria-label={`Filter by status: ${label || value}`}
                aria-pressed={isActive}
              >
                {label || value}
                {isActive ? ' ✓' : ''}
              </FilterChip>
            );
          })}
        </FilterChips>
      </FilterGroup>

      <div
        className={`${
          showAdvanced ? 'flex' : 'hidden'
        } md:flex flex-col md:flex-row md:items-start gap-4 w-full pt-1 border-t border-white/5`}
      >
        <FilterGroup className="md:w-auto">
          <FilterLabel>
            {t('games.lounge.filters.aiVsAiLabel') || 'Mode'}
          </FilterLabel>
          <FilterChips>
            {(['all', 'ai_vs_ai'] as const).map((value) => {
              const label =
                value === 'all'
                  ? t('games.lounge.filters.status.all') || 'All'
                  : t('games.lounge.filters.aiVsAi') || 'AI vs AI';
              const isActive = aiVsAiFilter === value;
              return (
                <FilterChip
                  key={value}
                  active={isActive}
                  onClick={() => onAiVsAiChange(value)}
                  aria-label={`Filter by mode: ${label}`}
                  aria-pressed={isActive}
                >
                  {label}
                  {isActive ? ' ✓' : ''}
                </FilterChip>
              );
            })}
          </FilterChips>
        </FilterGroup>

        <FilterGroup className="md:w-auto">
          <div className="flex items-center gap-2">
            <FilterLabel>
              {t('games.lounge.filters.participationLabel')}
            </FilterLabel>
            {!canFilterParticipation && (
              <span className="text-[11px] italic text-slate-400 opacity-60">
                ({t('games.create.loginRequired').toLowerCase()})
              </span>
            )}
          </div>
          <FilterChips>
            {(
              Object.keys(PARTICIPATION_KEYS) as Array<
                keyof typeof PARTICIPATION_KEYS
              >
            ).map((value) => {
              const label = t(PARTICIPATION_KEYS[value] as TranslationKey);
              const isActive = participationFilter === value;
              return (
                <FilterChip
                  key={value}
                  active={isActive}
                  disabled={value !== 'all' && !canFilterParticipation}
                  onClick={() => onParticipationChange(value)}
                  aria-label={`Filter by participation: ${label || value}`}
                  aria-pressed={isActive}
                >
                  {label || value}
                  {isActive ? ' ✓' : ''}
                </FilterChip>
              );
            })}
          </FilterChips>
        </FilterGroup>
      </div>
    </Filters>
  );
}
