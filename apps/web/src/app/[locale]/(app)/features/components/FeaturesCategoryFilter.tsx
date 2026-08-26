'use client';

import { FilterChip, Typography } from '@arcadeum/ui';
import type { FeatureCategory } from '../features-parser';

export type CategoryFilterItem = {
  id: FeatureCategory | 'all';
  label: string;
  icon: string;
  count: number;
};

type FeaturesCategoryFilterProps = {
  categories: CategoryFilterItem[];
  selectedCategory: FeatureCategory | 'all';
  onSelectCategory: (category: FeatureCategory | 'all') => void;
  searchQuery: string;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
  clearFiltersText: string;
};

export function FeaturesCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  filteredCount,
  totalCount,
  onClearFilters,
  clearFiltersText,
}: FeaturesCategoryFilterProps) {
  const isFiltered = searchQuery.length > 0 || selectedCategory !== 'all';

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <FilterChip
              key={cat.id}
              active={isActive}
              onClick={() => onSelectCategory(cat.id)}
              data-testid={`filter-${cat.id}`}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.label} ({cat.count})
            </FilterChip>
          );
        })}
      </div>

      {isFiltered && (
        <div className="flex items-center justify-between pt-2 border-t border-[var(--glassBorder)] text-xs">
          <button
            type="button"
            data-testid="features-clear-filters"
            onClick={onClearFilters}
            className="px-3 py-1 rounded-lg font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
          >
            {clearFiltersText}
          </button>
          <Typography variant="caption" uiSize="xs" alpha="medium">
            {filteredCount} of {totalCount} sections match
          </Typography>
        </div>
      )}
    </div>
  );
}
