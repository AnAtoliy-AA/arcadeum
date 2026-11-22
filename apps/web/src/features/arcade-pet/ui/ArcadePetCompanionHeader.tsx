import React from 'react';
import type { PetState } from '@arcadeum/games-core';
import { stageTranslationKey } from '../lib/arcade-pet-stage-key';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ArcadePetRenameField } from './ArcadePetRenameField';
import type { ThemePetPalette } from '../lib/arcade-pet-economy';

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
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{speciesEmoji}</span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            {pet.stage === 'egg' ? (
              <span className="text-sm font-bold leading-tight">
                {t('arcadePetCompanion.mysteryEgg')}
              </span>
            ) : (
              <ArcadePetRenameField name={pet.name} onRename={onRename} />
            )}
            {pet.stage === 'egg' ? (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-neutral-800 border border-neutral-700 text-amber-300">
                🥚 {t('arcadePetCompanion.mystery')}
              </span>
            ) : (
              themePalette && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                  {themePalette.emoji} {themePalette.title}
                </span>
              )
            )}
          </div>
          <span className="text-xs text-neutral-400 uppercase tracking-wider">
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
      <div className="flex items-center gap-1.5">
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-xs font-bold text-amber-300"
          title={t('arcadePetCompanion.coins')}
        >
          <span>🪙</span>
          <span data-testid="companion-coin-balance">{coinBalance}</span>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-xs font-bold text-indigo-300"
          title={t('arcadePetCompanion.gems')}
        >
          <span>💎</span>
          <span>{gemBalance}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 text-xs"
          aria-label={t('arcadePetCompanion.closeCompanion')}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
