'use client';

import { DiceRollOverlay } from '@arcadeum/ui';

interface BackgammonDiceProps {
  rolledDice: [number, number] | null;
  remainingDice: number[];
  canRoll: boolean;
  onRoll: () => void;
  rollLabel: string;
}

export function BackgammonDice({
  rolledDice,
  remainingDice,
  canRoll,
  onRoll,
  rollLabel,
}: BackgammonDiceProps) {
  const isDoubles =
    Boolean(rolledDice) &&
    rolledDice?.[0] === rolledDice?.[1] &&
    (rolledDice?.[0] ?? 0) > 0;

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      {isDoubles && rolledDice && (
        <div className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] sm:text-[10px] tracking-wider uppercase shadow-sm flex items-center gap-1 border border-amber-300">
          <span>✨</span>
          <span>
            DOUBLE {rolledDice[0]}s! ({remainingDice.length} left)
          </span>
        </div>
      )}

      <DiceRollOverlay
        canRoll={canRoll}
        diceCount={2}
        isDoubles={isDoubles}
        isRolling={false}
        lastValues={rolledDice ?? undefined}
        layout="bare"
        onRoll={onRoll}
        rollButtonTestId="roll-dice-btn"
        rollLabel={rollLabel}
        size="md"
        testIdPrefix="backgammon"
        values={remainingDice.length > 0 ? remainingDice : undefined}
        variant="classic"
      />
    </div>
  );
}
