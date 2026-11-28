'use client';

import { Button, CreateRoomLinkButton, EmptyState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface GamesEmptyProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  /** Destination of the primary "Create room" call to action. */
  createRoomHref?: string;
}

export function GamesEmpty({
  hasFilters = false,
  onClearFilters,
  createRoomHref,
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
              {createRoomHref && (
                <CreateRoomLinkButton href={createRoomHref}>
                  {t('roomsBrowser.createRoom')}
                </CreateRoomLinkButton>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
}
