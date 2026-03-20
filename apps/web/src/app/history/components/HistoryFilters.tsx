'use client';

import { XStack, YStack } from '@arcadeum/ui';
import { Input, Select, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

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

  const statusOptions = [
    { value: 'all', label: t('history.filter.all') },
    { value: 'lobby', label: t('history.status.lobby') },
    { value: 'in_progress', label: t('history.status.in_progress') },
    { value: 'completed', label: t('history.status.completed') },
    { value: 'waiting', label: t('history.status.waiting') },
    { value: 'active', label: t('history.status.active') },
  ];

  return (
    <XStack flexWrap="wrap" gap="$4" ai="center" $xs={{ flexDirection: 'column' }}>
      <Input
        flex={1}
        minWidth={250}
        $xs={{ minWidth: '100%', width: '100%' } as any}
        type="text"
        placeholder={t('history.search.placeholder')}
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        aria-label={t('history.search.label')}
      />
      <YStack style={{ minWidth: 180 }} $xs={{ width: '100%' } as any}>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
          aria-label={t('history.filter.label')}
        />
      </YStack>
      {(searchQuery || statusFilter !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          whiteSpace="nowrap"
          $xs={{ width: '100%' } as any}
          onClick={handleClearFilters}
        >
          {t('history.filter.clear')}
        </Button>
      )}
    </XStack>
  );
}
