'use client';

import { XStack, YStack, Input, Select, Button } from '@arcadeum/ui';
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

  return (
    <XStack
      flexWrap="wrap"
      gap="$4"
      ai="center"
      $xs={{ flexDirection: 'column' }}
    >
      <Input
        flex={1}
        minWidth={250}
        $xs={{ minWidth: '100%', width: '100%' }}
        type="text"
        placeholder={t('history.search.placeholder')}
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onSearchChange(e.target.value)
        }
        aria-label={t('history.search.label')}
        size="md"
      />
      <YStack style={{ minWidth: 180 }} $xs={{ width: '100%' }}>
        <Select
          id="status-select"
          value={statusFilter}
          onValueChange={onStatusChange}
          size="md"
          options={[
            { value: 'all', label: t('history.filter.all') },
            { value: 'win', label: t('stats.wins') },
            { value: 'loss', label: t('stats.losses') },
          ]}
        />
      </YStack>
      {(searchQuery || statusFilter !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          whiteSpace="nowrap"
          $xs={{ width: '100%' }}
          onClick={handleClearFilters}
        >
          {t('history.filter.clear')}
        </Button>
      )}
    </XStack>
  );
}
