'use client';

export interface CheckersCoachControlsProps {
  enabled: boolean;
  hintAvailable: boolean;
  hintText: string | null;
  onToggle: () => void;
  onHint: () => void;
}

export function CheckersCoachControls({
  enabled,
  hintAvailable,
  hintText,
  onToggle,
  onHint,
}: CheckersCoachControlsProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/60 border border-violet-500/20 backdrop-blur-sm w-full max-w-[480px] self-center">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-violet-200">
          💡 Coach hints
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Coach hints"
          data-testid="coach-toggle"
          onClick={onToggle}
          className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors duration-150 cursor-pointer ${
            enabled
              ? 'bg-emerald-500/80 justify-end'
              : 'bg-slate-700/60 justify-start'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
        </button>
      </div>
      {hintAvailable && (
        <div className="flex flex-col gap-1.5 pt-1">
          <button
            type="button"
            onClick={onHint}
            data-testid="coach-hint-button"
            aria-label="Request coach hint"
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-violet-200 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 active:scale-[0.99] transition-all cursor-pointer"
          >
            💡 Hint
          </button>
          {hintText ? (
            <div
              data-testid="coach-hint-text"
              role="status"
              className="py-1.5 px-2.5 rounded-lg bg-violet-500/10 border border-violet-500/25 text-xs text-violet-100"
            >
              {hintText}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
