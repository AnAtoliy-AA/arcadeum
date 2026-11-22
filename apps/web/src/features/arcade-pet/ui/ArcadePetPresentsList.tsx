'use client';

import React from 'react';
import { Button, EmptyState, ErrorState, Skeleton } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { PetGiftPresent } from '../lib/arcade-pet-economy';
import { SPECIES_PALETTE } from '../lib/arcade-pet-palette';
import type { ArcadePetSyncStatus } from '../hooks/useArcadePetSync';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';

interface ArcadePetPresentsListProps {
  presents: PetGiftPresent[];
  /** Sync status of the signed-in collection; drives loading and error states. */
  syncStatus: ArcadePetSyncStatus;
  onRetry: () => void;
  onClaim: (presentId: string) => void;
}

export function ArcadePetPresentsList({
  presents,
  syncStatus,
  onRetry,
  onClaim,
}: ArcadePetPresentsListProps) {
  const { t } = useTranslation();

  if (presents.length === 0 && syncStatus === 'syncing') {
    return (
      <div
        data-testid="presents-loading"
        role="status"
        aria-live="polite"
        aria-label={t('arcadePetCompanion.states.giftsLoading')}
        className="space-y-3"
      >
        {[0, 1].map((i) => (
          <Skeleton key={i} height="h-20" width="w-full" />
        ))}
      </div>
    );
  }

  if (presents.length === 0 && syncStatus === 'error') {
    return (
      <div data-testid="presents-error">
        <ErrorState
          message={t('arcadePetCompanion.states.giftsError')}
          retryLabel={t('arcadePetCompanion.states.retry')}
          onRetry={onRetry}
          className="p-4"
        />
      </div>
    );
  }

  if (presents.length === 0) {
    return (
      <div data-testid="presents-empty">
        <EmptyState
          icon="🎁"
          message={t('arcadePetCompanion.gifts.empty')}
          className="p-4 text-xs"
        />
      </div>
    );
  }

  return (
    <ul className="max-h-72 space-y-3 overflow-y-auto">
      {presents.map((present) => {
        const palette = SPECIES_PALETTE[present.theme];
        return (
          <li
            key={present.id}
            data-testid={`present-item-${present.id}`}
            className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
              present.isOpened
                ? 'border-[var(--glassBorder)] opacity-70'
                : 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ArcadePetWalkingSprite
                species={present.species}
                state="happy"
                theme={present.theme}
                className="h-10 w-10"
              />
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color)]">
                  {present.petName}
                  {palette && (
                    <span className="rounded-full border border-[var(--glassBorder)] px-1.5 text-xs text-[var(--textSecondary)]">
                      {palette.emoji} {palette.title}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)]">
                  {t('arcadePetCompanion.gifts.from', {
                    name: present.senderName,
                  })}
                  {present.senderId === 'admin' && (
                    <span
                      data-testid="admin-gift-badge"
                      className="rounded-full border border-[var(--warning)] px-1.5 py-0.5 text-xs font-bold text-[var(--color)]"
                    >
                      {t('arcadePetCompanion.gifts.adminGift')}
                    </span>
                  )}
                </span>
                {present.message && (
                  <span className="text-xs italic text-[var(--textSecondary)]">
                    &ldquo;{present.message}&rdquo;
                  </span>
                )}
              </div>
            </div>

            {present.isOpened ? (
              <span className="rounded px-3 py-1 text-xs text-[var(--textSecondary)]">
                {t('arcadePetCompanion.gifts.opened')}
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                data-testid={`claim-present-${present.id}`}
                onClick={() => onClaim(present.id)}
              >
                {t('arcadePetCompanion.gifts.take')}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
