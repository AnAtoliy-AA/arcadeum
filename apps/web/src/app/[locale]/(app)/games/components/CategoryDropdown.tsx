'use client';

import { useMemo, useCallback } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import type { GamesCategoryFilter } from '../types';
import { GAME_CATEGORIES } from '../types';
import { getCategoryLabelKey } from '@/features/games/registry';
import { MultiSelectDropdown, type MultiSelectOption } from '@arcadeum/ui';
import {
  CardsIcon,
  BoardIcon,
  SwordsIcon,
  LightningIcon,
  PuzzleIcon,
} from './FilterIcons';

export interface CategoryDropdownProps {
  categoryFilter: GamesCategoryFilter;
  onCategoryChange: (category: GamesCategoryFilter) => void;
  className?: string;
}

const CATEGORY_ICONS = {
  strategy: SwordsIcon,
  card: CardsIcon,
  board: BoardIcon,
  action: LightningIcon,
  puzzle: PuzzleIcon,
} as const;

export function CategoryDropdown({
  categoryFilter,
  onCategoryChange,
  className,
}: CategoryDropdownProps) {
  const { t } = useTranslation();

  const selectedValues = useMemo<string[]>(() => {
    if (!categoryFilter) return [];
    return categoryFilter
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [categoryFilter]);

  const options = useMemo<MultiSelectOption[]>(() => {
    return GAME_CATEGORIES.map((cat) => {
      const labelKey = getCategoryLabelKey(cat);
      const label = labelKey ? t(labelKey as TranslationKey) : cat;
      const IconComponent =
        CATEGORY_ICONS[cat.toLowerCase() as keyof typeof CATEGORY_ICONS] ||
        BoardIcon;

      return {
        id: cat,
        label: label || cat,
        icon: <IconComponent className="h-3.5 w-3.5" />,
        testId: `category-option-${cat.toLowerCase()}`,
      };
    });
  }, [t]);

  const handleChange = useCallback(
    (values: string[]) => {
      if (values.length === 0 || values.length === GAME_CATEGORIES.length) {
        onCategoryChange('');
      } else {
        onCategoryChange(values.join(','));
      }
    },
    [onCategoryChange],
  );

  return (
    <MultiSelectDropdown
      label={t('games.lounge.filters.categoryLabel') || 'Category'}
      options={options}
      selectedValues={selectedValues}
      onChange={handleChange}
      icon={<CardsIcon className="h-3.5 w-3.5 text-[var(--textSecondary)]" />}
      allLabel={t('games.lounge.filters.status.all') || 'All'}
      clearLabel={t('games.lounge.filters.clearAll') || 'Clear'}
      optionAriaLabelPrefix="Filter by category: "
      data-testid="rooms-filter-category-dropdown"
      className={className}
    />
  );
}
