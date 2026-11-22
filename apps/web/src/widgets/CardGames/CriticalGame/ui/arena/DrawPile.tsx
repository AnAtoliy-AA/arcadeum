import { useTranslation } from '@/shared/i18n/useTranslation';
import type { CriticalCard } from '../../types';
import { DeckDisplay } from '../DeckDisplay';
import { CardSlot } from '../styles';

interface DrawPileProps {
  deck: CriticalCard[];
  count: number;
  disabled: boolean;
  onDraw: () => void;
  cardVariant?: string;
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
  const tCompat = t as unknown as (key: string) => string;

  return (
    <div
      className="flex flex-col items-center gap-1 shrink-0 transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
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
      <CardSlot
        role="deck"
        style={{
          width: isNarrow ? 76 : 120,
          height: isNarrow ? 106 : 168,
        }}
      >
        <DeckDisplay deck={deck} t={tCompat} cardVariant={cardVariant} />
      </CardSlot>
      <span
        className="text-xs font-extrabold tracking-[0.4px] text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        data-testid="arena-draw-pile-count"
      >
        {t('games.table.state.deck')} · {count}
      </span>
      <span
        className="text-xs font-semibold uppercase tracking-[0.4px] text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        data-testid="arena-draw-pile-hint"
      >
        {t('games.table.arena.drawHint')}
      </span>
    </div>
  );
}
