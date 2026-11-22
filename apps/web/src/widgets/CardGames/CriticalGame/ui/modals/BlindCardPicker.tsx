import React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { CardFrame } from '../styles/card-decorations';
import { CardImage } from '../styles/card-image';

interface BlindCardPickerProps {
  targetHandSize: number;
  selectedIndex: number | null;
  onSelectIndex: (index: number) => void;
  targetName?: string;
  cardVariant?: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const BlindCardPicker: React.FC<BlindCardPickerProps> = ({
  targetHandSize,
  selectedIndex,
  onSelectIndex,
  targetName,
  cardVariant,
  t,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
        <span>{t('games.table.modals.eventCombo.pickCardBlind')}</span>
        {targetName && (
          <span className="text-white/70 lowercase font-normal">
            (
            {t('games.table.modals.eventCombo.cardsCount', {
              count: targetHandSize,
            })}
            )
          </span>
        )}
      </div>

      <div
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-2 justify-items-center max-h-[300px] overflow-y-auto"
        data-testid="blind-card-picker"
      >
        {Array.from({ length: targetHandSize }, (_, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelectIndex(index)}
              data-testid={`blind-card-${index}`}
              aria-pressed={isSelected}
              className={cx(
                'group relative flex flex-col items-center justify-center w-[72px] h-[108px] sm:w-[84px] sm:h-[126px] rounded-xl cursor-pointer select-none transition-all duration-200 outline-none overflow-hidden aspect-[2/3] bg-[rgba(255,255,255,0.03)] border-2',
                isSelected
                  ? 'border-amber-400 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.5)] -translate-y-1 z-10 ring-2 ring-amber-400/50'
                  : 'border-white/15 hover:border-white/40 hover:scale-102 hover:-translate-y-0.5 hover:shadow-lg',
              )}
            >
              <CardImage variant={cardVariant ?? ''} faceDown />
              <CardFrame variant={cardVariant} />

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-950 shadow">
                  ✓
                </div>
              )}

              <div
                className={cx(
                  'absolute bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider z-20 transition-colors',
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-black/85 text-white font-bold border border-white/30 backdrop-blur-sm shadow-md',
                )}
              >
                #{index + 1}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
