'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TimeControl } from '../types';

export interface QuickPlayCard {
  id: string;
  label: string;
  category: string;
  durationLabel: string;
  categoryColor: string;
  timeControl: TimeControl | null;
}

export const QUICK_PLAY_CARDS: QuickPlayCard[] = [
  {
    id: 'bullet-1-0',
    label: '1+0',
    category: 'Bullet',
    durationLabel: '1 min',
    categoryColor: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
    timeControl: { type: 'bullet', initialSeconds: 60, incrementSeconds: 0 },
  },
  {
    id: 'blitz-3-0',
    label: '3+0',
    category: 'Blitz',
    durationLabel: '3 min',
    categoryColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
    timeControl: { type: 'blitz', initialSeconds: 180, incrementSeconds: 0 },
  },
  {
    id: 'blitz-3-2',
    label: '3+2',
    category: 'Blitz',
    durationLabel: '3m + 2s',
    categoryColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
    timeControl: { type: 'blitz', initialSeconds: 180, incrementSeconds: 2 },
  },
  {
    id: 'blitz-5-0',
    label: '5+0',
    category: 'Blitz',
    durationLabel: '5 min',
    categoryColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
    timeControl: { type: 'blitz', initialSeconds: 300, incrementSeconds: 0 },
  },
  {
    id: 'rapid-10-0',
    label: '10+0',
    category: 'Rapid',
    durationLabel: '10 min',
    categoryColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
    timeControl: { type: 'rapid', initialSeconds: 600, incrementSeconds: 0 },
  },
  {
    id: 'rapid-15-10',
    label: '15+10',
    category: 'Rapid',
    durationLabel: '15m + 10s',
    categoryColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
    timeControl: {
      type: 'rapid',
      initialSeconds: 900,
      incrementSeconds: 10,
    },
  },
  {
    id: 'classical-30-0',
    label: '30+0',
    category: 'Classical',
    durationLabel: '30 min',
    categoryColor: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
    timeControl: {
      type: 'classical',
      initialSeconds: 1800,
      incrementSeconds: 0,
    },
  },
  {
    id: 'no-clock',
    label: 'No clock',
    category: 'Casual',
    durationLabel: 'Unlimited',
    categoryColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
    timeControl: null,
  },
];

export interface QuickPlayPanelProps {
  selectedTimeControl?: TimeControl | null;
  onSelectTimeControl: (tc: TimeControl | null) => void;
  disabled?: boolean;
}

function isCardSelected(
  cardTc: TimeControl | null,
  selectedTc: TimeControl | null | undefined,
): boolean {
  if (selectedTc === undefined) return false;
  if (cardTc === null) return selectedTc === null;
  if (selectedTc === null) return false;
  return (
    selectedTc.initialSeconds === cardTc.initialSeconds &&
    selectedTc.incrementSeconds === cardTc.incrementSeconds
  );
}

function QuickPlayPanelImpl({
  selectedTimeControl,
  onSelectTimeControl,
  disabled = false,
}: QuickPlayPanelProps) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--textPrimary)]">
            Time Control
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--color)] border border-[var(--primary)]/30">
            Presets
          </span>
        </div>
        {disabled && (
          <span className="text-[11px] text-[var(--textMuted)]">
            Host controls time
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_PLAY_CARDS.map((card) => {
          const isSelected = isCardSelected(
            card.timeControl,
            selectedTimeControl,
          );
          const buttonId = `quick-play-${card.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

          return (
            <button
              key={card.id}
              type="button"
              id={buttonId}
              data-testid={buttonId}
              data-active={isSelected ? 'true' : 'false'}
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onSelectTimeControl(card.timeControl)}
              className={cx(
                'relative flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all text-center',
                'bg-[var(--surface)]/90 backdrop-blur-md',
                disabled && 'opacity-60 cursor-not-allowed',
                !disabled &&
                  'cursor-pointer hover:border-indigo-400/60 hover:bg-[var(--surfaceHover)] active:scale-95',
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/60 bg-indigo-500/15 shadow-[0_0_16px_rgba(99,102,241,0.3)] scale-[1.02]'
                  : 'border-[var(--glassBorder)] text-[var(--textSecondary)]',
              )}
            >
              {isSelected && (
                <span
                  data-testid="selected-indicator"
                  className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-sm"
                >
                  ✓
                </span>
              )}

              <div className="flex flex-col items-center gap-0.5 mb-1.5">
                <span
                  className={cx(
                    'text-base font-extrabold font-mono leading-none tracking-tight',
                    isSelected ? 'text-white' : 'text-[var(--textPrimary)]',
                  )}
                >
                  {card.label}
                </span>
                <span className="text-[10px] font-medium text-[var(--textMuted)] leading-none">
                  {card.durationLabel}
                </span>
              </div>

              <span
                className={cx(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider',
                  card.categoryColor,
                )}
              >
                {card.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const QuickPlayPanel = memo(QuickPlayPanelImpl);
