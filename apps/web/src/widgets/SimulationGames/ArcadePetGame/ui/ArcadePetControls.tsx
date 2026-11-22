'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface ArcadePetControlsProps {
  onPressA: () => void;
  onPressB: () => void;
  onPressC: () => void;
  isSleeping: boolean;
  isEgg: boolean;
}

interface PetActionButtonProps {
  testId: string;
  ariaLabel: string;
  caption: string;
  glyph: string;
  /** CSS variable (with fallback) that colours the button. */
  colorVar: string;
  sizeClass: string;
  glyphClass: string;
  onPress: () => void;
}

const BUTTON_BASE =
  'rounded-full border-4 border-black/30 shadow-lg active:translate-y-1 active:shadow-sm flex items-center justify-center font-bold text-white transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black/60';

function PetActionButton({
  testId,
  ariaLabel,
  caption,
  glyph,
  colorVar,
  sizeClass,
  glyphClass,
  onPress,
}: PetActionButtonProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        data-testid={testId}
        onClick={onPress}
        style={{ backgroundColor: colorVar }}
        className={`${BUTTON_BASE} ${sizeClass} ${glyphClass}`}
        aria-label={ariaLabel}
      >
        {glyph}
      </button>
      <span className="text-xs font-bold tracking-wider uppercase text-white/70">
        {caption}
      </span>
    </div>
  );
}

export const ArcadePetControls: React.FC<ArcadePetControlsProps> = ({
  onPressA,
  onPressB,
  onPressC,
  isSleeping,
  isEgg,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-4 w-full pt-4">
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        <PetActionButton
          testId="arcade-pet-btn-a"
          ariaLabel={t('arcadePetCompanion.landing.btnSelectAria')}
          caption={t('arcadePetCompanion.landing.labelSelect')}
          glyph="A"
          colorVar="var(--arcade-btn-a, #ef4444)"
          sizeClass="w-14 h-14"
          glyphClass="text-lg"
          onPress={onPressA}
        />
        <PetActionButton
          testId="arcade-pet-btn-b"
          ariaLabel={t('arcadePetCompanion.landing.btnConfirmAria')}
          caption={
            isEgg
              ? t('arcadePetCompanion.landing.labelHatch')
              : t('arcadePetCompanion.landing.labelConfirm')
          }
          glyph={isEgg ? t('arcadePetCompanion.landing.labelHatch') : 'B'}
          colorVar="var(--arcade-btn-b, #10b981)"
          sizeClass="w-16 h-16"
          glyphClass="text-xl"
          onPress={onPressB}
        />
        <PetActionButton
          testId="arcade-pet-btn-c"
          ariaLabel={t('arcadePetCompanion.landing.btnCancelAria')}
          caption={
            isSleeping
              ? t('arcadePetCompanion.landing.labelWake')
              : t('arcadePetCompanion.landing.labelCancel')
          }
          glyph="C"
          colorVar="var(--arcade-btn-c, #f59e0b)"
          sizeClass="w-14 h-14"
          glyphClass="text-lg"
          onPress={onPressC}
        />
      </div>
    </div>
  );
};
