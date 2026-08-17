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

export function CheckersBoardVisual() {
  return (
    <div
      aria-hidden="true"
      className="box-border w-full max-w-[320px] mx-auto aspect-square p-2.5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] shadow-xl grid grid-cols-8 grid-rows-8 gap-0.5"
    >
      {DEMO_BOARD.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isDark = (rowIdx + colIdx) % 2 === 1;
          return (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`box-border flex items-center justify-center rounded-sm ${
                isDark ? 'bg-amber-950/40' : 'bg-amber-100/10'
              }`}
            >
              {cell === 'b' ? (
                <span className="box-border w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 border-2 border-slate-600 shadow-md flex items-center justify-center text-[10px] font-bold text-slate-300">
                  ●
                </span>
              ) : cell === 'w' ? (
                <span className="box-border w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-100 border-2 border-amber-300 shadow-md flex items-center justify-center text-[10px] font-bold text-amber-900">
                  ●
                </span>
              ) : null}
            </div>
          );
        }),
      )}
    </div>
  );
}
