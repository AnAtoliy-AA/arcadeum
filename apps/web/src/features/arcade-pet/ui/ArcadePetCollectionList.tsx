import React from 'react';
import type { PetState } from '@arcadeum/games-core';
import { Button, EmptyState } from '@arcadeum/ui';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { SPECIES_PALETTE } from '../lib/arcade-pet-palette';
import { stageTranslationKey } from '../lib/arcade-pet-stage-key';

export function ArcadePetCollectionList({
  pets,
  activePetId,
  onSelectPet,
}: {
  pets: PetState[];
  activePetId: string | null;
  onSelectPet: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (pets.length === 0) {
    return (
      <div data-testid="pet-collection-empty">
        <EmptyState
          icon="🥚"
          message={t('arcadePetCompanion.collectionEmpty')}
          className="p-4 text-xs"
        />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <span className="block text-xs font-bold text-[var(--color)]">
        {t('arcadePetCompanion.collection.title', { count: pets.length })}
      </span>

      <ul className="max-h-64 space-y-2 overflow-y-auto">
        {pets.map((p) => {
          const isActive = p.id === activePetId;
          const palette = SPECIES_PALETTE[p.theme];
          const displayName =
            p.stage === 'egg' ? t('arcadePetCompanion.mysteryEgg') : p.name;
          return (
            <li
              key={p.id}
              data-testid={`pet-item-${p.id}`}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                isActive
                  ? 'border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)]'
                  : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ArcadePetWalkingSprite
                  species={p.species}
                  state="idle"
                  theme={p.theme}
                  stage={p.stage}
                  className="h-10 w-10"
                />
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color)]">
                    {displayName}
                    {p.stage !== 'egg' && palette && (
                      <span className="rounded-full border border-[var(--glassBorder)] px-1.5 text-xs text-[var(--textSecondary)]">
                        {palette.emoji} {palette.title}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[var(--textSecondary)]">
                    {p.stage === 'egg'
                      ? t('arcadePetCompanion.collection.incubating')
                      : t('arcadePetCompanion.collection.levelLine', {
                          level: p.stats.level,
                          species: t(
                            `arcadePetCompanion.gifts.species.${p.species}`,
                          ),
                          stage: t(stageTranslationKey(p.stage)),
                        })}
                  </span>
                </div>
              </div>

              {isActive ? (
                <span className="rounded-full border border-[var(--success)] px-3 py-1 text-xs font-bold text-[var(--color)]">
                  {t('arcadePetCompanion.collection.active')}
                </span>
              ) : (
                <Button
                  variant="glass"
                  size="sm"
                  padding="px-3"
                  data-testid={`equip-pet-${p.id}`}
                  aria-label={t('arcadePetCompanion.collection.equipAria', {
                    name: displayName,
                  })}
                  onClick={() => onSelectPet(p.id)}
                  className="text-xs font-semibold"
                >
                  {t('arcadePetCompanion.collection.equip')}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
