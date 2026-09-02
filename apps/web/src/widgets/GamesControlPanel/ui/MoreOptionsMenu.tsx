'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { MusicOnIcon, MusicOffIcon } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui';

interface MoreOptionsMenuProps {
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onShowRules?: () => void;
  onShowTutorial?: () => void;
}

export function MoreOptionsMenu({
  musicEnabled,
  onToggleMusic,
  onShowRules,
  onShowTutorial,
}: MoreOptionsMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick, { capture: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick, { capture: true });
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        className="!px-1.5 sm:hidden"
        variant="glass"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-label="More options"
        aria-expanded={open}
        aria-controls="control-panel-more-menu"
        data-testid="more-options-button"
      >
        ⋯
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[180px] bg-[var(--background)] border border-[var(--glassBorderStrong)] rounded-xl p-1.5 z-[1000] shadow-2xl backdrop-blur-xl flex flex-col gap-0.5 sm:hidden"
          id="control-panel-more-menu"
          role="menu"
          aria-label="More options"
        >
          <button
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--color)] hover:bg-[var(--backgroundHover)] transition-colors"
            role="menuitem"
            onClick={() => {
              onToggleMusic();
              setOpen(false);
            }}
          >
            {musicEnabled ? (
              <MusicOnIcon size={16} />
            ) : (
              <MusicOffIcon size={16} />
            )}
            {t('settings.musicLabel')}
          </button>
          {onShowRules && (
            <button
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--color)] hover:bg-[var(--backgroundHover)] transition-colors"
              role="menuitem"
              onClick={() => {
                onShowRules();
                setOpen(false);
              }}
            >
              📖 {t('games.table.controlPanel.rules') || 'Rules'}
            </button>
          )}
          {onShowTutorial && (
            <button
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--color)] hover:bg-[var(--backgroundHover)] transition-colors"
              role="menuitem"
              data-testid="show-tutorial-button-mobile"
              onClick={() => {
                onShowTutorial();
                setOpen(false);
              }}
            >
              🎓 {t('games.tutorial.ui.button')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
