'use client';

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

  return (
    <div className="box-border flex flex-row flex-wrap gap-4 items-center max-[660px]:flex-column">
      <Input
        className="flex-1 min-w-[250px]"
        type="text"
        placeholder={t('history.search.placeholder')}
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onSearchChange(e.target.value)
        }
        aria-label={t('history.search.label')}
        size="md"
      />
      <div
        className="box-border flex flex-col items-stretch max-[660px]:w-full"
        style={{ minWidth: 180 }}
      >
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
      </div>
      {(searchQuery || statusFilter !== 'all') && (
        <Button
          className="whitespace-nowrap max-[480px]:w-full"
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
        >
          {t('history.filter.clear')}
        </Button>
      )}
    </div>
  );
}
