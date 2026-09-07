'use client';

interface EngineEval {
  cp: number | null;
  mate: number | null;
  pv: string[];
  depth: number;
}

interface AnalysisSidebarProps {
  fenInput: string;
  onFenInputChange: (v: string) => void;
  onLoadFen: () => void;
  onFlipBoard: () => void;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
  eval_: EngineEval | null;
  analyzing: boolean;
  moveHistory: string[];
  currentTurnColor: 'white' | 'black';
  onCopyFen: () => void;
  fenOutput: string;
}

export function AnalysisSidebar({
  fenInput,
  onFenInputChange,
  onLoadFen,
  onFlipBoard,
  onReset,
  onUndo,
  canUndo,
  eval_,
  analyzing,
  moveHistory,
  currentTurnColor: _currentTurnColor,
  onCopyFen,
  fenOutput: _fenOutput,
}: AnalysisSidebarProps) {
  const evalCp =
    eval_?.cp ?? (eval_?.mate != null ? (eval_.mate > 0 ? 10000 : -10000) : 0);
  const evalLabel =
    eval_?.mate != null
      ? `Mate in ${Math.abs(eval_.mate)}`
      : eval_ != null
        ? `${(evalCp / 100).toFixed(2)}`
        : '—';

  return (
    <div className="flex-1 flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-2">
        <button
          onClick={onFlipBoard}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
        >
          Flip
        </button>
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors disabled:opacity-40"
        >
          Undo
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--textSecondary)] mb-1">
          FEN
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={fenInput}
            onChange={(e) => onFenInputChange(e.target.value)}
            className="flex-1 px-3 py-2 text-xs font-mono rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
            placeholder="Paste FEN here..."
          />
          <button
            onClick={onLoadFen}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
          >
            Load
          </button>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)]">
        <div className="text-xs font-semibold text-[var(--textSecondary)] mb-2">
          Engine Analysis
        </div>
        {eval_ ? (
          <div className="space-y-1">
            <div className="text-sm font-bold text-[var(--text)]">
              {evalLabel}
            </div>
            {eval_.pv?.length > 0 && (
              <div className="text-xs text-[var(--textSecondary)] font-mono">
                {eval_.pv.join(' ')}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--textSecondary)]">
            {analyzing ? 'Computing...' : 'Load a position to analyze'}
          </div>
        )}
      </div>

      <div className="p-3 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)]">
        <div className="text-xs font-semibold text-[var(--textSecondary)] mb-2">
          Moves ({moveHistory.length})
        </div>
        <div className="flex flex-wrap gap-1 text-xs font-mono text-[var(--text)]">
          {moveHistory.map((move, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)]"
            >
              {i % 2 === 0 && (
                <span className="text-[var(--textSecondary)] mr-1">
                  {Math.floor(i / 2) + 1}.
                </span>
              )}
              {move}
            </span>
          ))}
        </div>
        {moveHistory.length === 0 && (
          <div className="text-xs text-[var(--textSecondary)] opacity-60">
            Click pieces on the board to make moves
          </div>
        )}
      </div>

      <button
        onClick={onCopyFen}
        className="px-3 py-2 text-xs rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:text-[var(--color)] transition-colors self-start"
      >
        Copy FEN
      </button>
    </div>
  );
}
