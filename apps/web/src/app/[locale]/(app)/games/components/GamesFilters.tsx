'use client';

import { useState, useCallback, useId } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
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
  onClearAll?: () => void;
}

const STATUS_KEYS = {
  all: 'games.lounge.filters.status.all',
  lobby: 'games.lounge.filters.status.lobby',
  in_progress: 'games.lounge.filters.status.in_progress',
  completed: 'games.lounge.filters.status.completed',
} as const;

const STATUS_ICONS: Record<string, string> = {
  all: '🌟',
  lobby: '🎮',
  in_progress: '⚔️',
  completed: '🏆',
};

const CATEGORY_ICONS: Record<string, string> = {
  all: '✨',
  strategy: '⚔️',
  card: '🃏',
  board: '♟️',
  action: '⚡',
  puzzle: '🧩',
};

const PARTICIPATION_KEYS = {
  all: 'games.lounge.filters.participation.all',
  hosting: 'games.lounge.filters.participation.hosting',
  joined: 'games.lounge.filters.participation.joined',
  not_joined: 'games.lounge.filters.participation.not_joined',
} as const;

const PARTICIPATION_ICONS: Record<string, string> = {
  all: '👥',
  hosting: '👑',
  joined: '🎮',
  not_joined: '👀',
};

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
  const searchInputId = useId();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleSearchClear = () => {
    onSearch('');
  };

  const isAllStatus =
    statusFilter.length === 0 || statusFilter.length === STATUS_VALUES.length;

  const handleStatusToggle = useCallback(
    (value: (typeof ALL_STATUS_VALUES)[number]) => {
      if (value === 'all') {
        onStatusChange([]);
        return;
      }

      if (isAllStatus) {
        onStatusChange([value]);
        return;
      }

      if (statusFilter.includes(value)) {
        const next = statusFilter.filter((s) => s !== value);
        onStatusChange(next);
      } else {
        const next = [...statusFilter, value];
        if (next.length === STATUS_VALUES.length) {
          onStatusChange([]);
        } else {
          onStatusChange(next);
        }
      }
    },
    [isAllStatus, statusFilter, onStatusChange],
  );

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
      className="box-border flex w-full max-w-full flex-col gap-3 rounded-2xl border border-[var(--glassBorderStrong)] bg-[var(--background)] p-3 shadow-md backdrop-blur-xl sm:p-4 md:gap-4"
    >
      <div className="flex w-full items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none sm:pb-0">
        <div className="inline-flex min-w-max items-center gap-1.5 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-1">
          {ALL_STATUS_VALUES.map((value) => {
            const label = t(STATUS_KEYS[value] as TranslationKey);
            const icon = STATUS_ICONS[value] || '🎮';
            const isActive =
              value === 'all'
                ? isAllStatus
                : !isAllStatus && statusFilter.includes(value);

            return (
              <button
                key={value}
                type="button"
                role="checkbox"
                aria-checked={isActive}
                aria-label={`Filter status: ${label || value}`}
                onClick={() => handleStatusToggle(value)}
                className={`relative inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)]'
                }`}
              >
                <span>{icon}</span>
                <span>{label || value}</span>
                {isActive && value !== 'all' && (
                  <span className="text-[10px] opacity-80">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            data-testid="rooms-filter-clear-all"
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-300 transition-colors hover:bg-rose-500/20 active:scale-95"
          >
            <span>✕</span>
            <span className="hidden sm:inline">
              {t('games.lounge.filters.clearAll')}
            </span>
            <span className="rounded-full bg-rose-500/30 px-1.5 py-0.2 text-[10px] text-white">
              {activeCount}
            </span>
          </button>
        )}
      </div>

      <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          role="checkbox"
          aria-checked={categoryFilter === ''}
          onClick={() => onCategoryChange('')}
          aria-label="Filter by category: All"
          className={`inline-flex shrink-0 h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all select-none cursor-pointer ${
            categoryFilter === ''
              ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-bold shadow-sm'
              : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:border-[var(--glassBorderStrong)] hover:text-[var(--color)]'
          }`}
        >
          <span>{CATEGORY_ICONS.all}</span>
          <span>{t('games.lounge.filters.status.all') || 'All'}</span>
        </button>

        {GAME_CATEGORIES.map((cat) => {
          const labelKey = getCategoryLabelKey(cat);
          const label = labelKey ? t(labelKey as TranslationKey) : cat;
          const icon = CATEGORY_ICONS[cat.toLowerCase()] || '🎲';
          const isActive = categoryFilter === cat;

          return (
            <button
              key={cat}
              type="button"
              role="checkbox"
              aria-checked={isActive}
              onClick={() => onCategoryChange(isActive ? '' : cat)}
              aria-label={`Filter by category: ${label}`}
              className={`inline-flex shrink-0 h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all select-none cursor-pointer ${
                isActive
                  ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-bold shadow-sm'
                  : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:border-[var(--glassBorderStrong)] hover:text-[var(--color)]'
              }`}
            >
              <span>{icon}</span>
              <span>{label || cat}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-1 border-t border-[var(--glassBorder)]">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <label htmlFor={searchInputId} className="sr-only">
            {t('games.lounge.searchPlaceholder') || 'Search games...'}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--textSecondary)]">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id={searchInputId}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={
              t('games.lounge.searchPlaceholder') || 'Search games...'
            }
            className="w-full rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] py-2 pl-9 pr-8 text-xs text-[var(--color)] placeholder-[var(--textSecondary)] transition-colors focus:border-[var(--primary)] focus:bg-[var(--background)] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleSearchClear}
              aria-label="Clear search input"
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[var(--textSecondary)] hover:text-[var(--color)] cursor-pointer"
            >
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() =>
              onAiVsAiChange(aiVsAiFilter === 'ai_vs_ai' ? 'all' : 'ai_vs_ai')
            }
            aria-label="Toggle AI vs AI mode"
            aria-pressed={aiVsAiFilter === 'ai_vs_ai'}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all select-none cursor-pointer ${
              aiVsAiFilter === 'ai_vs_ai'
                ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-bold'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)]'
            }`}
          >
            <span>🤖</span>
            <span>{t('games.lounge.filters.aiVsAi') || 'AI vs AI'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            data-testid="rooms-filter-toggle-advanced"
            aria-expanded={showAdvanced}
            aria-label="Toggle participation filters"
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all select-none cursor-pointer ${
              hasParticipation || showAdvanced
                ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-bold'
                : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)]'
            }`}
          >
            <span>👥</span>
            <span>{t('games.lounge.filters.participationLabel')}</span>
            {hasParticipation && (
              <span className="rounded-full bg-[var(--primary)] px-1 text-[10px] text-white">
                1
              </span>
            )}
            <span
              className={`transition-transform duration-200 ${
                showAdvanced ? 'rotate-180' : ''
              }`}
            >
              ▾
            </span>
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--glassBorder)] animate-in fade-in duration-150">
          <span className="text-xs text-[var(--textSecondary)] font-semibold mr-1">
            {t('games.lounge.filters.participationLabel')}:
          </span>
          {(
            Object.keys(PARTICIPATION_KEYS) as Array<
              keyof typeof PARTICIPATION_KEYS
            >
          ).map((value) => {
            const label = t(PARTICIPATION_KEYS[value] as TranslationKey);
            const icon = PARTICIPATION_ICONS[value] || '👥';
            const isActive = participationFilter === value;
            const isDisabled = value !== 'all' && !canFilterParticipation;

            return (
              <button
                key={value}
                type="button"
                disabled={isDisabled}
                onClick={() => onParticipationChange(value)}
                aria-label={`Filter by participation: ${label || value}`}
                aria-pressed={isActive}
                className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-all select-none ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed border-[var(--glassBorder)] bg-transparent text-[var(--textSecondary)]'
                    : isActive
                      ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--primary)] font-bold cursor-pointer'
                      : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] hover:bg-[var(--glassBgHover)] hover:text-[var(--color)] cursor-pointer'
                }`}
              >
                <span>{icon}</span>
                <span>{label || value}</span>
              </button>
            );
          })}

          {!canFilterParticipation && (
            <span className="text-[11px] italic text-[var(--textSecondary)] opacity-75 ml-1">
              ({t('games.create.loginRequired').toLowerCase()})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
