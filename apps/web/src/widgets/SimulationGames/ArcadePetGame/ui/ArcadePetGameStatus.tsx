'use client';

import React from 'react';
import { Button, Input, ProgressBar, Select } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { PetSpecies, PetState } from '../types';

interface ArcadePetGameStatusProps {
  pet: PetState;
  coins: number;
  themeLabel: string;
  petNameInput: string;
  onPetNameChange: (name: string) => void;
  hatchSpecies: PetSpecies;
  onHatchSpeciesChange: (species: PetSpecies) => void;
  onHatch: () => void;
}

const SPECIES: readonly { id: PetSpecies; emoji: string }[] = [
  { id: 'dragon', emoji: '🐲' },
  { id: 'cyber_cat', emoji: '🐱' },
  { id: 'slime', emoji: '👾' },
  { id: 'dino', emoji: '🦖' },
  { id: 'blob', emoji: '🐡' },
];

const STAT_ROWS = [
  { key: 'hunger', emoji: '🍖', labelKey: 'hunger', color: 'var(--warning)' },
  {
    key: 'happiness',
    emoji: '💖',
    labelKey: 'happiness',
    color: 'var(--danger)',
  },
  { key: 'energy', emoji: '⚡', labelKey: 'game.energy', color: 'var(--info)' },
  {
    key: 'hygiene',
    emoji: '🛁',
    labelKey: 'game.hygiene',
    color: 'var(--accent)',
  },
  {
    key: 'discipline',
    emoji: '🏆',
    labelKey: 'game.discipline',
    color: 'var(--primary)',
  },
  {
    key: 'health',
    emoji: '🩺',
    labelKey: 'game.health',
    color: 'var(--success)',
  },
] as const;

const CARD =
  'rounded-lg border border-[var(--glassBorder)] bg-[var(--backgroundHover)]';

export const ArcadePetGameStatus: React.FC<ArcadePetGameStatusProps> = ({
  pet,
  coins,
  themeLabel,
  petNameInput,
  onPetNameChange,
  hatchSpecies,
  onHatchSpeciesChange,
  onHatch,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-5 text-[var(--color)] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-3">
        <div className="flex flex-col">
          <span className="text-base font-bold">
            {t('arcadePetCompanion.landing.statusTitle')}
          </span>
          <span className="text-xs text-[var(--textSecondary)]">
            {t('arcadePetCompanion.game.level', {
              level: pet.stats.level,
              xp: pet.stats.xp,
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            data-testid="arcade-pet-game-coins"
            className="rounded border border-[var(--warning)] px-2.5 py-1 text-xs font-bold"
          >
            {t('arcadePetCompanion.game.coins', { coins })}
          </span>
          <span className="rounded border border-[var(--primary)] px-2.5 py-1 text-xs font-bold uppercase">
            {t('arcadePetCompanion.game.weight', { weight: pet.stats.weight })}
          </span>
        </div>
      </div>

      {pet.stage === 'egg' ? (
        <div className="flex flex-col gap-3 py-2">
          <label htmlFor="arcade-pet-game-name" className="text-xs font-bold">
            {t('arcadePetCompanion.game.petName')}
          </label>
          <Input
            id="arcade-pet-game-name"
            size="sm"
            fullWidth
            value={petNameInput}
            onChange={(e) => onPetNameChange(e.target.value)}
          />
          <label
            htmlFor="arcade-pet-game-species"
            className="text-xs font-bold"
          >
            {t('arcadePetCompanion.game.chooseSpecies')}
          </label>
          <Select
            id="arcade-pet-game-species"
            size="sm"
            fullWidth
            value={hatchSpecies}
            onValueChange={(value) => onHatchSpeciesChange(value as PetSpecies)}
            options={SPECIES.map((spec) => ({
              value: spec.id,
              label: `${spec.emoji} ${t(`arcadePetCompanion.gifts.species.${spec.id}`)}`,
            }))}
          />
          <Button variant="primary" size="md" fullWidth onClick={onHatch}>
            {t('arcadePetCompanion.game.hatchEgg')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-xs">
          {STAT_ROWS.map((row) => {
            const label = t(`arcadePetCompanion.${row.labelKey}`);
            const value = pet.stats[row.key];
            return (
              <div
                key={row.key}
                className={`flex flex-col gap-1 p-2.5 ${CARD}`}
              >
                <span className="text-[var(--textSecondary)]">
                  <span aria-hidden="true">{row.emoji}</span> {label}
                </span>
                <ProgressBar
                  value={value}
                  height={8}
                  color={row.color}
                  ariaLabel={label}
                />
                <span className="text-right font-bold">{value}%</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[var(--glassBorder)] pt-3 text-xs text-[var(--textSecondary)]">
        <span>{t('arcadePetCompanion.game.theme', { theme: themeLabel })}</span>
        <span>{t('arcadePetCompanion.landing.offlineSynced')}</span>
      </div>
    </div>
  );
};
