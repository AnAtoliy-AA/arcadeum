'use client';

import React, { useState } from 'react';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { MinigameGuess } from '../types';

interface ArcadePetMinigameProps {
  onComplete: (won: boolean) => void;
  onCancel: () => void;
}

export const ArcadePetMinigame: React.FC<ArcadePetMinigameProps> = ({
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [currentNumber] = useState<number>(
    () => Math.floor(Math.random() * 7) + 2,
  );
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);

  const handleGuess = (guess: MinigameGuess) => {
    let nextNum = Math.floor(Math.random() * 9) + 1;
    if (nextNum === currentNumber) {
      nextNum = nextNum === 9 ? 8 : nextNum + 1;
    }
    setRevealedNumber(nextNum);

    const isHigher = nextNum > currentNumber;
    const didWin =
      (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);
    setWon(didWin);
    onComplete(didWin);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg bg-black/60 p-4 font-mono text-white">
      <div className="text-xs font-bold uppercase tracking-wider text-[var(--arcade-accent,var(--accent))]">
        {t('arcadePetCompanion.game.miniTitle')}
      </div>

      <div className="flex items-center gap-4 py-2 text-2xl font-bold">
        <div className="flex h-16 w-12 items-center justify-center rounded bg-white text-black shadow-inner">
          {currentNumber}
        </div>
        <span className="text-lg text-white/70">
          {t('arcadePetCompanion.game.miniVs')}
        </span>
        <div className="flex h-16 w-12 items-center justify-center rounded border-2 border-dashed border-white/60 bg-black/40 text-white shadow-inner">
          {revealedNumber !== null ? revealedNumber : '?'}
        </div>
      </div>

      {won !== null ? (
        <div
          role="status"
          className="animate-pulse text-sm font-bold text-white motion-reduce:animate-none"
        >
          {won
            ? t('arcadePetCompanion.game.miniWin')
            : t('arcadePetCompanion.game.miniLose')}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleGuess('higher')}
            className="text-xs uppercase tracking-wider"
          >
            {t('arcadePetCompanion.game.miniHigher')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleGuess('lower')}
            className="text-xs uppercase tracking-wider"
          >
            {t('arcadePetCompanion.game.miniLower')}
          </Button>
        </div>
      )}

      <Button variant="link" size="sm" onClick={onCancel} className="text-xs">
        {t('arcadePetCompanion.game.miniExit')}
      </Button>
    </div>
  );
};
