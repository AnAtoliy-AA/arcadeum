const DEMO_GRID = [
  ['X', 'O', 'X'],
  ['O', 'X', null],
  [null, null, 'O'],
];

export function TicTacToeBoardVisual() {
  return (
    <div
      aria-hidden="true"
      className="box-border w-full max-w-[280px] mx-auto aspect-square p-3 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] shadow-xl grid grid-cols-3 grid-rows-3 gap-2"
    >
      {DEMO_GRID.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <div
            key={`${rowIdx}-${colIdx}`}
            className="box-border flex items-center justify-center rounded-xl bg-[var(--primary)]/10 border border-[var(--borderColor)] text-2xl sm:text-3xl font-black select-none transition-transform hover:scale-105"
          >
            {cell === 'X' ? (
              <span className="text-[var(--primary)] animate-pulse">✕</span>
            ) : cell === 'O' ? (
              <span className="text-cyan-400">◯</span>
            ) : null}
          </div>
        )),
      )}
    </div>
  );
}
