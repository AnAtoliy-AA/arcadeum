import React from 'react';
import { Button } from '@arcadeum/ui';
import type { PetState } from '@arcadeum/games-core';
import { stageTranslationKey } from '../lib/arcade-pet-stage-key';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ArcadePetRenameField } from './ArcadePetRenameField';
import type { ThemePetPalette } from '../lib/arcade-pet-palette';

interface ArcadePetCompanionHeaderProps {
  pet: PetState;
  petCount: number;
  speciesEmoji: string;
  themePalette?: ThemePetPalette;
  coinBalance: number;
  gemBalance: number;
  onClose: () => void;
  onRename: (name: string) => { success: boolean };
}

export const ArcadePetCompanionHeader: React.FC<
  ArcadePetCompanionHeaderProps
> = ({
  pet,
  petCount,
  speciesEmoji,
  themePalette,
  coinBalance,
  gemBalance,
  onClose,
  onRename,
}) => {
  const { t } = useTranslation();
  const chipBase = 'rounded-full border text-xs';
  return (
    <div
      data-testid="companion-header"
      className="flex min-w-0 flex-col gap-1.5 border-b border-[var(--glassBorder)] pb-2"
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="shrink-0 text-2xl">
            {speciesEmoji}
          </span>
          {pet.stage === 'egg' ? (
            <span className="min-w-0 break-words text-sm font-bold leading-tight">
              {t('arcadePetCompanion.mysteryEgg')}
            </span>
          ) : (
            <ArcadePetRenameField name={pet.name} onRename={onRename} />
          )}
        </div>
        <Button
          variant="icon"
          size="sm"
          className="shrink-0"
          onClick={onClose}
          aria-label={t('arcadePetCompanion.closeCompanion')}
        >
          <span aria-hidden="true">✕</span>
        </Button>
      </div>
      <div
        data-testid="companion-header-meta"
        className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1"
      >
        {pet.stage === 'egg' ? (
          <span
            className={`${chipBase} px-1.5 py-0.5 border-[var(--glassBorder)] text-[var(--color)]`}
          >
            🥚 {t('arcadePetCompanion.mystery')}
          </span>
        ) : (
          themePalette && (
            <span
              className={`${chipBase} px-1.5 py-0.5 border-[var(--glassBorder)] text-[var(--textSecondary)]`}
            >
              {themePalette.emoji} {themePalette.title}
            </span>
          )
        )}
        <div
          className={`${chipBase} flex items-center gap-1 px-2 py-0.5 border-[var(--warning)] font-bold text-[var(--color)]`}
          title={t('arcadePetCompanion.coins')}
        >
          <span>🪙</span>
          <span data-testid="companion-coin-balance">{coinBalance}</span>
        </div>
        <div
          className={`${chipBase} flex items-center gap-1 px-2 py-0.5 border-[var(--primary)] font-bold text-[var(--color)]`}
          title={t('arcadePetCompanion.gems')}
        >
          <span>💎</span>
          <span>{gemBalance}</span>
        </div>
        <span className="min-w-0 break-words text-xs uppercase tracking-wider text-[var(--textSecondary)]">
          {pet.stage === 'egg'
            ? t('arcadePetCompanion.incubating')
            : t('arcadePetCompanion.levelOwned', {
                level: pet.stats.level,
                stage: t(stageTranslationKey(pet.stage)),
                count: petCount,
              })}
        </span>
      </div>
    </div>
  );
};
