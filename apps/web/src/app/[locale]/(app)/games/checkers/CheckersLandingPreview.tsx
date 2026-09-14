'use client';

import { GameLandingPreview } from '@/features/games/ui/landing/GameLandingPreview';

const DEMO_BOARD: Array<Array<string | null>> = [
  [null, 'b', null, 'b', null, 'b', null, 'b'],
  ['b', null, 'b', null, 'b', null, 'b', null],
  [null, 'b', null, null, null, 'b', null, 'b'],
  [null, null, null, 'b', null, null, null, null],
  [null, null, null, null, 'w', null, null, null],
  ['w', null, 'w', null, null, null, 'w', null],
  [null, 'w', null, 'w', null, 'w', null, 'w'],
  ['w', null, 'w', null, 'w', null, 'w', null],
];

export function CheckersLandingPreview() {
  return (
    <GameLandingPreview
      testId="checkers-landing-preview"
      render={() => {
        return (
          <div
            aria-hidden="true"
            className="box-border w-full max-w-[320px] mx-auto aspect-square p-[10px] rounded-[16px] border-2 border-[rgba(239,68,68,0.4)] shadow-[0_16px_40px_rgba(0,0,0,0.5)] grid grid-cols-8 grid-rows-8 gap-[2px] bg-[#1c1917]"
          >
            {DEMO_BOARD.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const isDark = (rowIdx + colIdx) % 2 === 1;
                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={
                      isDark
                        ? 'box-border flex items-center justify-center rounded-sm bg-[#44403c]'
                        : 'box-border flex items-center justify-center rounded-sm bg-[#f5f5f4]'
                    }
                  >
                    {cell === 'b' ? (
                      <span className="box-border w-[22px] h-[22px] rounded-full bg-[radial-gradient(circle,#ef4444_30%,#991b1b_100%)] border-2 border-[#7f1d1d] shadow-[0_4px_6px_rgba(0,0,0,0.4)]" />
                    ) : cell === 'w' ? (
                      <span className="box-border w-[22px] h-[22px] rounded-full bg-[radial-gradient(circle,#ffffff_30%,#e4e4e7_100%)] border-2 border-[#a1a1aa] shadow-[0_4px_6px_rgba(0,0,0,0.4)]" />
                    ) : null}
                  </div>
                );
              }),
            )}
          </div>
        );
      }}
    />
  );
}
