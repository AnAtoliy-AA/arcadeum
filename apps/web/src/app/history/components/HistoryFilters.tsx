'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import {
  FilterBar,
  SearchInput,
  FilterSelect,
  ClearFiltersButton,
} from '../styles';

interface HistoryFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: string) => void;
}

export function HistoryFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: HistoryFiltersProps) {
  const { t } = useTranslation();

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
  };

  return (
    <FilterBar>
      <SearchInput
        type="text"
        placeholder={t('history.search.placeholder')}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={t('history.search.label')}
      />
      <FilterSelect
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label={t('history.filter.label')}
      >
        <option value="all">{t('history.filter.all')}</option>
        <option value="lobby">{t('history.status.lobby')}</option>
        <option value="in_progress">{t('history.status.in_progress')}</option>
        <option value="completed">{t('history.status.completed')}</option>
        <option value="waiting">{t('history.status.waiting')}</option>
        <option value="active">{t('history.status.active')}</option>
      </FilterSelect>
      {(searchQuery || statusFilter !== 'all') && (
        <ClearFiltersButton onClick={handleClearFilters}>
          {t('history.filter.clear')}
        </ClearFiltersButton>
      )}
    </FilterBar>
  );
}
