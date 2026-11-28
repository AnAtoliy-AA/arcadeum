'use client';

import React from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { Button, EmptyState, Input, Notice } from '@arcadeum/ui';
import { SELECT_PET_COST } from '../lib/arcade-pet-economy';
import { SPECIES_PALETTE } from '../lib/arcade-pet-palette';
import { useTranslation } from '@/shared/i18n/useTranslation';

export const SPECIES_OPTIONS: readonly {
  id: PetSpecies;
  emoji: string;
}[] = [
  { id: 'cyber_cat', emoji: '🐱' },
  { id: 'dragon', emoji: '🐲' },
  { id: 'dino', emoji: '🦖' },
  { id: 'blob', emoji: '🐡' },
  { id: 'slime', emoji: '👾' },
];

interface ArcadePetVipSelectionTabProps {
  selectedSpecies: PetSpecies;
  onSelectSpecies: (species: PetSpecies) => void;
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  customName: string;
  onChangeCustomName: (name: string) => void;
  isHomeFull: boolean;
  onAdoptSelected: () => void;
}

export function ArcadePetVipSelectionTab({
  selectedSpecies,
  onSelectSpecies,
  selectedTheme,
  onSelectTheme,
  customName,
  onChangeCustomName,
  isHomeFull,
  onAdoptSelected,
}: ArcadePetVipSelectionTabProps) {
  const { t } = useTranslation();
  const themes = Object.values(SPECIES_PALETTE);
  return (
    <div className="space-y-4">
      <Notice tone="warning" icon="👑">
        <strong>
          {t('arcadePetCompanion.adoption.vipTitle', {
            cost: SELECT_PET_COST,
          })}
        </strong>{' '}
        {t('arcadePetCompanion.adoption.vipBody')}
      </Notice>

      <div className="space-y-2">
        <span className="block text-xs font-bold text-[var(--color)]">
          {t('arcadePetCompanion.adoption.chooseSpecies')}
        </span>
        <div className="grid grid-cols-5 gap-2">
          {SPECIES_OPTIONS.map((spec) => (
            <Button
              key={spec.id}
              variant="chip"
              size="auto"
              padding="p-2"
              active={selectedSpecies === spec.id}
              aria-pressed={selectedSpecies === spec.id}
              data-testid={`select-species-${spec.id}`}
              onClick={() => onSelectSpecies(spec.id)}
              className="flex-col gap-1"
            >
              <span aria-hidden="true" className="text-2xl">
                {spec.emoji}
              </span>
              <span className="text-xs">
                {t(`arcadePetCompanion.gifts.species.${spec.id}`)}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-xs font-bold text-[var(--color)]">
          {t('arcadePetCompanion.adoption.chooseTheme')}
        </span>
        {themes.length === 0 ? (
          <EmptyState
            icon="🎨"
            message={t('arcadePetCompanion.states.themesEmpty')}
            className="p-4 text-xs"
          />
        ) : (
          <div className="grid max-h-36 grid-cols-4 gap-2 overflow-y-auto p-1">
            {themes.map((theme) => (
              <Button
                key={theme.id}
                variant="chip"
                size="auto"
                padding="p-2"
                active={selectedTheme === theme.id}
                aria-pressed={selectedTheme === theme.id}
                data-testid={`select-theme-${theme.id}`}
                onClick={() => onSelectTheme(theme.id)}
                className="justify-start gap-1.5"
              >
                <span aria-hidden="true" className="text-base">
                  {theme.emoji}
                </span>
                <span className="truncate text-xs">{theme.title}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="arcade-pet-custom-name"
          className="block text-xs font-bold text-[var(--color)]"
        >
          {t('arcadePetCompanion.adoption.companionName')}
        </label>
        <Input
          id="arcade-pet-custom-name"
          size="sm"
          fullWidth
          data-testid="custom-pet-name-input"
          value={customName}
          onChange={(e) => onChangeCustomName(e.target.value)}
          placeholder={t('arcadePetCompanion.adoption.companionPlaceholder')}
        />
      </div>

      <Button
        variant="primary"
        size="md"
        fullWidth
        data-testid="adopt-selected-btn"
        disabled={isHomeFull}
        onClick={onAdoptSelected}
      >
        {isHomeFull
          ? t('arcadePetCompanion.adoption.upgradeToAdopt')
          : t('arcadePetCompanion.adoption.selectEquip', {
              cost: SELECT_PET_COST,
            })}
      </Button>
    </div>
  );
}
