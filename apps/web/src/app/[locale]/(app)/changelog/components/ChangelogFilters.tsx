'use client';

import { Typography, FilterChip, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

type CategoryCount = {
  type: string;
  count: number;
};

type ChangelogFiltersProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  categories: CategoryCount[];
  onExpandAll: () => void;
  onCollapseAll: () => void;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
};

export function ChangelogFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  onExpandAll,
  onCollapseAll,
  filteredCount,
  totalCount,
  onClearFilters,
}: ChangelogFiltersProps) {
  const { t } = useTranslation();

  const isFiltered = Boolean(searchQuery || selectedCategory);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--foregroundSecondary)] pointer-events-none">
            🔍
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('pages.changelog.filters.searchPlaceholder')}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[var(--bgCard)] border border-[var(--glassBorder)] text-sm text-[var(--foreground)] placeholder:text-[var(--foregroundSecondary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--foregroundSecondary)] hover:text-[var(--foreground)] w-5 h-5 rounded-full bg-[var(--glassBg)] flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpandAll}
            className="text-xs"
          >
            {t('pages.changelog.filters.expandAll')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapseAll}
            className="text-xs"
          >
            {t('pages.changelog.filters.collapseAll')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={selectedCategory === null}
          onClick={() => onSelectCategory(null)}
        >
          {t('pages.changelog.filters.allCategories')} ({totalCount})
        </FilterChip>
        {categories.map((cat) => (
          <FilterChip
            key={cat.type}
            active={selectedCategory === cat.type}
            onClick={() =>
              onSelectCategory(selectedCategory === cat.type ? null : cat.type)
            }
          >
            {cat.type} ({cat.count})
          </FilterChip>
        ))}
      </div>

      {isFiltered && (
        <div className="flex items-center justify-between pt-2 border-t border-[var(--glassBorder)]">
          <Typography variant="caption" uiSize="xs" alpha="medium">
            {t('pages.changelog.filters.showingResults', {
              shown: filteredCount,
              total: totalCount,
            })}
          </Typography>
          <Button
            variant="link"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-[var(--primary)] p-0 h-auto"
          >
            {t('pages.changelog.filters.clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}
