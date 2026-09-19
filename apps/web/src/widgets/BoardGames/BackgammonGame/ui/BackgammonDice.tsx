'use client';

import { memo, useState } from 'react';
import { DiceRollOverlay } from '@arcadeum/ui';

interface BackgammonDiceProps {
  rolledDice: [number, number] | null;
  remainingDice: number[];
  canRoll: boolean;
  onRoll: () => void;
  rollLabel: string;
  isRolling?: boolean;
}

export const BackgammonDice = memo(function BackgammonDice({
  rolledDice,
  remainingDice,
  canRoll,
  onRoll,
  rollLabel,
  isRolling: externalRolling,
}: BackgammonDiceProps) {
  const [internalRolling, setInternalRolling] = useState(false);

  const isRolling = externalRolling ?? internalRolling;

  const isDoubles =
    Boolean(rolledDice) &&
    rolledDice?.[0] === rolledDice?.[1] &&
    (rolledDice?.[0] ?? 0) > 0;

  const handleRoll = () => {
    setInternalRolling(true);
    onRoll();
    setTimeout(() => {
      setInternalRolling(false);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 select-none z-30">
      {isDoubles && rolledDice && (
        <div className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1 border border-amber-300 animate-bounce">
          <span>✨</span>
          <span>
            DOUBLE {rolledDice[0]}s! ({remainingDice.length} moves left)
          </span>
        </div>
      )}

      <DiceRollOverlay
        canRoll={canRoll}
        diceCount={2}
        isDoubles={isDoubles}
        isRolling={isRolling}
        lastValues={rolledDice ?? undefined}
        layout="bare"
        onRoll={handleRoll}
        rollButtonTestId="roll-dice-btn"
        rollLabel={rollLabel}
        size="md"
        testIdPrefix="backgammon"
        values={remainingDice.length > 0 ? remainingDice : undefined}
        variant="wood"
      />
    </div>
  );
});
