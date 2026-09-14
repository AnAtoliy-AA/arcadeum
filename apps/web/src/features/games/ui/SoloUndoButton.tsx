'use client';

import { cx } from '@arcadeum/ui/utils/cx';

export interface SoloUndoButtonProps {
  onUndo: () => void;
  canUndo: boolean;
  disabled?: boolean;
  className?: string;
}

export function SoloUndoButton({
  onUndo,
  canUndo,
  disabled = false,
  className,
}: SoloUndoButtonProps) {
  const isEnabled = canUndo && !disabled;

  return (
    <button
      type="button"
      onClick={onUndo}
      disabled={!isEnabled}
      title={isEnabled ? 'Undo last move (Ctrl+Z)' : 'Nothing to undo'}
      data-testid="solo-undo-button"
      className={cx(
        'inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 h-8 text-xs font-semibold transition-colors shadow-xs active:scale-95 select-none whitespace-nowrap',
        isEnabled
          ? 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--color)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10'
          : 'border-[var(--glassBorder)] bg-[var(--backgroundHover)] text-[var(--textSecondary)] opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <span>↩️</span>
      <span>Undo</span>
    </button>
  );
}
