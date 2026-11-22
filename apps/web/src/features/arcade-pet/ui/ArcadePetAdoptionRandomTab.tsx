'use client';

import React from 'react';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { getSignaturePet } from '../lib/arcade-pet-economy';
import { SPECIES_PALETTE } from '../lib/arcade-pet-palette';

interface ArcadePetAdoptionRandomTabProps {
  isFirstMountFree: boolean;
  nextCost: number;
  isHomeFull: boolean;
  onAdopt: () => void;
}

const PANEL =
  'space-y-2 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-4 text-xs text-[var(--textSecondary)]';

export function ArcadePetAdoptionRandomTab({
  isFirstMountFree,
  nextCost,
  isHomeFull,
  onAdopt,
}: ArcadePetAdoptionRandomTabProps) {
  const { t } = useTranslation();
  const tiers = [
    {
      label: t('arcadePetCompanion.adoption.tier1'),
      cost: t('arcadePetCompanion.adoption.tierFree'),
      free: true,
    },
    { label: t('arcadePetCompanion.adoption.tier2'), cost: '💎 50' },
    { label: t('arcadePetCompanion.adoption.tier3'), cost: '💎 150' },
    { label: t('arcadePetCompanion.adoption.tier4'), cost: '💎 300' },
    { label: t('arcadePetCompanion.adoption.tier5'), cost: '💎 500+' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-5 text-center">
        <div
          aria-hidden="true"
          className="inline-flex animate-pulse rounded-full border border-[var(--primary)] p-4 text-4xl motion-reduce:animate-none"
        >
          🎁
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[var(--color)]">
            {isFirstMountFree
              ? t('arcadePetCompanion.adoption.firstTitle')
              : t('arcadePetCompanion.adoption.nextTitle', { cost: nextCost })}
          </h3>
          <p className="mx-auto max-w-sm text-xs text-[var(--textSecondary)]">
            {isFirstMountFree
              ? t('arcadePetCompanion.adoption.firstBody')
              : t('arcadePetCompanion.adoption.nextBody', { cost: nextCost })}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          fullWidth
          data-testid="adopt-random-btn"
          disabled={isHomeFull}
          onClick={onAdopt}
        >
          {isHomeFull
            ? t('arcadePetCompanion.adoption.upgradeToAdopt')
            : isFirstMountFree
              ? t('arcadePetCompanion.adoption.rollFirst')
              : t('arcadePetCompanion.adoption.rollRandom', {
                  cost: nextCost,
                })}
        </Button>
      </div>

      <div className={PANEL}>
        <span className="block font-bold text-[var(--color)]">
          {t('arcadePetCompanion.adoption.progressionTitle')}
        </span>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className="rounded border border-[var(--glassBorder)] p-2"
            >
              <span className="block text-[var(--textSecondary)]">
                {tier.label}
              </span>
              <span
                className={`font-bold ${
                  tier.free ? 'text-[var(--success)]' : 'text-[var(--color)]'
                }`}
              >
                {tier.cost}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={PANEL}>
        <div className="flex items-center justify-between">
          <span className="block font-bold text-[var(--color)]">
            {t('arcadePetCompanion.adoption.themesTitle')}
          </span>
          <span className="rounded-full border border-[var(--primary)] px-2 py-0.5 text-xs font-semibold text-[var(--color)]">
            {t('arcadePetCompanion.adoption.themesBadge')}
          </span>
        </div>
        <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3">
          {Object.values(SPECIES_PALETTE).map((pal) => {
            const signature = getSignaturePet(pal.id);
            return (
              <div
                key={pal.id}
                data-testid={`theme-pet-card-${pal.id}`}
                className="flex flex-col gap-1 rounded-xl border border-[var(--glassBorder)] p-2"
              >
                <div className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-base">
                    {pal.emoji}
                  </span>
                  <span className="truncate text-xs font-bold text-[var(--color)]">
                    {pal.title}
                  </span>
                </div>
                <span className="truncate text-xs font-medium text-[var(--accent)]">
                  ⭐ {signature.name}
                </span>
                <span className="line-clamp-1 text-xs text-[var(--textSecondary)]">
                  {signature.tagline}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
