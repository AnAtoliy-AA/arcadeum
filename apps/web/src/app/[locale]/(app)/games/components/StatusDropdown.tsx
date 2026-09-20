'use client';

import { useMemo, useCallback } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import type { GamesStatusFilter } from '../types';
import { STATUS_VALUES } from '../types';
import { MultiSelectDropdown, type MultiSelectOption } from '@arcadeum/ui';
import { GamepadIcon, SwordsIcon, TrophyIcon } from './FilterIcons';

export interface StatusDropdownProps {
  statusFilter: GamesStatusFilter;
  onStatusChange: (statuses: GamesStatusFilter) => void;
  className?: string;
}

const STATUS_KEYS = {
  lobby: 'games.lounge.filters.status.lobby',
  in_progress: 'games.lounge.filters.status.in_progress',
  completed: 'games.lounge.filters.status.completed',
} as const;

const STATUS_ICONS = {
  lobby: GamepadIcon,
  in_progress: SwordsIcon,
  completed: TrophyIcon,
} as const;

export function StatusDropdown({
  statusFilter,
  onStatusChange,
  className,
}: StatusDropdownProps) {
  const { t } = useTranslation();

  const options = useMemo<MultiSelectOption[]>(() => {
    return STATUS_VALUES.map((val) => {
      const label = t(STATUS_KEYS[val] as TranslationKey) || val;
      const IconComponent = STATUS_ICONS[val];

      return {
        id: val,
        label,
        icon: <IconComponent className="h-3.5 w-3.5" />,
        testId: `status-option-${val}`,
      };
    });
  }, [t]);

  const handleChange = useCallback(
    (values: string[]) => {
      if (values.length === 0 || values.length === STATUS_VALUES.length) {
        onStatusChange([]);
      } else {
        onStatusChange(values as GamesStatusFilter);
      }
    },
    [onStatusChange],
  );

  return (
    <MultiSelectDropdown
      label={t('games.lounge.filters.statusLabel') || 'Status'}
      options={options}
      selectedValues={statusFilter}
      onChange={handleChange}
      icon={<GamepadIcon className="h-3.5 w-3.5 text-[var(--textSecondary)]" />}
      allLabel={t('games.lounge.filters.status.all') || 'All'}
      clearLabel={t('games.lounge.filters.clearAll') || 'Clear'}
      data-testid="rooms-filter-status-dropdown"
      className={className}
    />
  );
}
