'use client';

import { DiceRollOverlay } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface DiceOverlayProps {
  canRoll: boolean;
  isRolling: boolean;
  isGameOver: boolean;
  actionBusy: boolean;
  die: number | null;
  lastDie: number | null;
  myLastDie?: number | null;
  boardRotation: number;
  onRoll: () => void;
}

export function DiceOverlay({
  canRoll,
  isRolling,
  isGameOver,
  actionBusy,
  die,
  lastDie,
  myLastDie,
  boardRotation,
  onRoll,
}: DiceOverlayProps) {
  const { t } = useTranslation();
  const effectiveLastDie = myLastDie ?? lastDie;

  return (
    <div className="pachisi-center-overlay w-full h-full">
      <DiceRollOverlay
        canRoll={canRoll}
        diceCount={1}
        disabled={actionBusy}
        isRolling={isRolling}
        lastValues={
          !isGameOver && effectiveLastDie != null
            ? [effectiveLastDie]
            : undefined
        }
        layout="bare"
        onRoll={onRoll}
        rollingLabel={t('games.pachisi_v1.game.rolling')}
        rollLabel={t('games.pachisi_v1.game.rollDice')}
        rotation={boardRotation}
        size="lg"
        testIdPrefix="pachisi"
        values={die != null ? [die] : undefined}
        variant="classic"
      />
    </div>
  );
}
