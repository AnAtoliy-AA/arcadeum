'use client';

import { Button, CreateRoomLinkButton, EmptyState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';

interface GamesEmptyProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  gameId?: string;
}

export function GamesEmpty({
  hasFilters = false,
  onClearFilters,
  gameId,
}: GamesEmptyProps) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const createHref = gameId
    ? `${routes.gameCreate}?gameId=${encodeURIComponent(gameId)}`
    : routes.gameCreate;

  return (
    <div className="col-span-full" data-testid="games-empty">
      <EmptyState
        icon="🎲"
        message={t('roomsBrowser.emptyTitle')}
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
              <CreateRoomLinkButton href={createHref}>
                {t('roomsBrowser.createRoom')}
              </CreateRoomLinkButton>
            </div>
          </div>
        }
      />
    </div>
  );
}
