'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalCard } from '../../types';
import { DeckDisplay } from '../DeckDisplay';
import { CardSlot } from '../styles';

interface DrawPileProps {
  deck: CriticalCard[];
  count: number;
  disabled: boolean;
  onDraw: () => void;
  cardVariant?: string;
  /**
   * When true, shrink the pile to ~80×112 so the three-column arena
   * row still fits at 390px. Passed from `Arena` once per layout so
   * piles don't each call the matchMedia hook.
   */
  isNarrow?: boolean;
}

export function DrawPile({
  deck,
  count,
  disabled,
  onDraw,
  cardVariant,
  isNarrow = false,
}: DrawPileProps) {
  const { t } = useTranslation();
  // DeckDisplay's `t` prop accepts the unparameterised string form used by
  // the existing layout — cast through to keep the typed namespace inside
  // the new components without forking DeckDisplay just for ARC-632.
  const tCompat = t as unknown as (key: string) => string;

  return (
    <div
      className="box-border flex flex-col items-center gap-1 shrink-0 transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
      style={{
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
      onClick={disabled ? undefined : onDraw}
      data-testid="arena-draw-pile"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={t('games.table.arena.drawAria')}
      onKeyDown={
        disabled
          ? undefined
          : (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDraw();
              }
            }
      }
    >
      {/* Desktop: 140×196 — the widget arena has more vertical real
          estate than the table-mode header. Phones: 80×112 so the
          three-column row still fits at 390px. */}
      <CardSlot
        $role="deck"
        style={{
          width: isNarrow ? 80 : 140,
          height: isNarrow ? 112 : 196,
        }}
      >
        <DeckDisplay deck={deck} t={tCompat} cardVariant={cardVariant} />
      </CardSlot>
      <span
        className="box-border text-[12px] font-extrabold tracking-[0.4px] opacity-[0.85]"
        data-testid="arena-draw-pile-count"
      >
        {t('games.table.state.deck')} · {count}
      </span>
      <span
        className="box-border text-[48px] font-semibold tracking-[0.4px] uppercase opacity-[0.6]"
        data-testid="arena-draw-pile-hint"
      >
        {t('games.table.arena.drawHint')}
      </span>
    </div>
  );
}
