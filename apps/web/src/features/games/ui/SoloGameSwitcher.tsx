'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cx } from '@arcadeum/ui/utils/cx';
import { useLocale } from '@/shared/config/useRoutes';

export interface SoloGameItem {
  id: string;
  slug: string;
  name: string;
  emoji: string;
}

export const SOLO_GAMES_LIST: SoloGameItem[] = [
  {
    id: 'minesweeper_v1',
    slug: 'minesweeper',
    name: 'Minesweeper',
    emoji: '💣',
  },
  { id: 'sudoku_v1', slug: 'sudoku', name: 'Sudoku', emoji: '🧩' },
  { id: 'game_2048_v1', slug: '2048', name: '2048', emoji: '🔢' },
  { id: 'solitaire_v1', slug: 'solitaire', name: 'Solitaire', emoji: '🃏' },
];

export interface SoloGameSwitcherProps {
  currentGameId: string;
  className?: string;
}

export function SoloGameSwitcher({
  currentGameId,
  className,
}: SoloGameSwitcherProps) {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentGame =
    SOLO_GAMES_LIST.find((g) => g.id === currentGameId) ?? SOLO_GAMES_LIST[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelectGame = (slug: string) => {
    setOpen(false);
    router.push(`/${locale}/games/${slug}/play`);
  };

  return (
    <div ref={containerRef} className={cx('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        data-testid="solo-game-switcher-button"
        className={cx(
          'flex items-center gap-1.5 rounded-lg border border-[var(--glassBorder)] bg-[var(--backgroundHover)] px-2 py-0.5 text-xs font-black uppercase tracking-wider text-[var(--color)] transition-colors hover:border-[var(--primary)]',
          open && 'border-[var(--primary)] ring-1 ring-[var(--primary)]',
        )}
      >
        <span className="text-sm leading-none">{currentGame.emoji}</span>
        <span>{currentGame.name}</span>
        <span
          className={cx(
            'text-[10px] text-[var(--textSecondary)] transition-transform duration-200',
            open && 'rotate-180',
          )}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          data-testid="solo-game-switcher-dropdown"
          aria-label="Select solo game"
          className="absolute left-0 top-full z-50 mt-1 max-h-56 w-48 overflow-y-auto rounded-xl border border-[var(--glassBorder)] bg-[var(--background)] p-1 shadow-2xl"
        >
          {SOLO_GAMES_LIST.map((game) => {
            const isSelected = game.id === currentGameId;
            return (
              <button
                key={game.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-testid={`solo-game-option-${game.slug}`}
                onClick={() => handleSelectGame(game.slug)}
                className={cx(
                  'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  isSelected
                    ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                    : 'text-[var(--color)] hover:bg-[var(--backgroundHover)]',
                )}
              >
                <span className="text-sm leading-none">{game.emoji}</span>
                <span className="flex-1 text-left">{game.name}</span>
                {isSelected && (
                  <span className="text-[10px] text-[var(--primary)] font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
