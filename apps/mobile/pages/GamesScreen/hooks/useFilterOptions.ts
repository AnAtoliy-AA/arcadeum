import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import type {
  StatusFilterValue,
  ParticipationFilterValue,
  FilterOption,
  ParticipationFilterOption,
} from '../types';

export function useFilterOptions(isAuthenticated: boolean) {
  const { t } = useTranslation();

  const statusOptions = useMemo<FilterOption<StatusFilterValue>[]>(() => {
    return [
      { value: 'all', label: t('games.lounge.filters.status.all') },
      { value: 'lobby', label: t('games.lounge.filters.status.lobby') },
      {
        value: 'in_progress',
        label: t('games.lounge.filters.status.inProgress'),
      },
      {
        value: 'completed',
        label: t('games.lounge.filters.status.completed'),
      },
    ];
  }, [t]);

  const participationOptions = useMemo<ParticipationFilterOption[]>(() => {
    return [
      {
        value: 'all',
        label: t('games.lounge.filters.participation.all'),
        requiresAuth: false,
      },
      {
        value: 'hosting',
        label: t('games.lounge.filters.participation.hosting'),
        requiresAuth: true,
      },
      {
        value: 'joined',
        label: t('games.lounge.filters.participation.joined'),
        requiresAuth: true,
      },
      {
        value: 'not_joined',
        label: t('games.lounge.filters.participation.notJoined'),
        requiresAuth: true,
      },
    ];
  }, [t]);

  return {
    statusOptions,
    participationOptions,
  };
}
