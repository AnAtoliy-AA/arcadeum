'use client';

import { Button, EmptyState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface GamesEmptyProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function GamesEmpty({
  hasFilters = false,
  onClearFilters,
}: GamesEmptyProps) {
  const { t } = useTranslation();

  return (
    <div className="col-span-full" data-testid="games-empty">
      <EmptyState
        icon="🎲"
        message={
          hasFilters
            ? t('roomsBrowser.emptyFilteredTitle')
            : t('roomsBrowser.emptyTitle')
        }
        action={
          <div className="flex flex-col items-center gap-4">
            <p className="m-0 max-w-md text-center text-sm text-[var(--textSecondary)]">
              {hasFilters
                ? t('roomsBrowser.emptyFiltered')
                : t('roomsBrowser.emptyHint')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {hasFilters && onClearFilters && (
                <Button variant="secondary" size="md" onClick={onClearFilters}>
                  {t('roomsBrowser.clearFilters')}
                </Button>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
}
