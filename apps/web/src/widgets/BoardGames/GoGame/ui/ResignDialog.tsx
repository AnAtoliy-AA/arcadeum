'use client';

import { memo, useCallback, useEffect, useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface ResignDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResignDialog = memo(function ResignDialog({
  open,
  onConfirm,
  onCancel,
}: ResignDialogProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === dialogRef.current) onCancel();
    },
    [onCancel],
  );

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('games.go_v1.resign.title')}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl">🏳️</div>
          <h2 className="text-lg font-bold text-center">
            {t('games.go_v1.resign.title')}
          </h2>
          <p className="text-sm text-center opacity-70">
            {t('games.go_v1.resign.message')}
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              className={cx(
                'flex-1 rounded-xl border border-[var(--borderColor)] px-4 py-2.5',
                'text-sm font-semibold transition-colors',
                'hover:bg-[var(--backgroundHover)]',
              )}
            >
              {t('games.go_v1.resign.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={cx(
                'flex-1 rounded-xl px-4 py-2.5',
                'bg-red-600 text-white text-sm font-semibold',
                'hover:bg-red-700 transition-colors',
              )}
            >
              {t('games.go_v1.resign.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
