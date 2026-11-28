'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { LobbyOptionGroup } from '@/features/games/ui/LobbyOptionKit';
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
  const { t } = useTranslation();
  return (
    <LobbyOptionGroup
      data-testid="chess-time-control"
      title={t('games.chess_v1.lobby.timeControl')}
      hint={t('games.chess_v1.lobby.timeControlHint')}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_PLAY_CARDS.map((card) => {
          const isSelected = isCardSelected(
            card.timeControl,
            selectedTimeControl,
          );
          const isNoClock = card.timeControl === null;
          const cardLabel = isNoClock
            ? t('games.chess_v1.lobby.noClock')
            : card.label;
          const cardDuration = isNoClock
            ? t('games.chess_v1.lobby.unlimited')
            : card.durationLabel;
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
                'relative flex min-h-[64px] flex-col items-center justify-between p-2.5 rounded-xl border transition-colors motion-reduce:transition-none text-center',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]',
                'bg-[var(--surface)]/90 backdrop-blur-md',
                disabled && 'opacity-60 cursor-not-allowed',
                !disabled &&
                  'cursor-pointer hover:border-[var(--primary)]/60 hover:bg-[var(--surfaceHover)]',
                isSelected
                  ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/50 bg-[var(--primary)]/15'
                  : 'border-[var(--glassBorder)] text-[var(--textSecondary)]',
              )}
            >
              {isSelected && (
                <span
                  data-testid="selected-indicator"
                  className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-[var(--primaryText)] shadow-sm"
                >
                  ✓
                </span>
              )}

              <div className="flex flex-col items-center gap-0.5 mb-1.5">
                <span
                  className={cx(
                    'text-base font-extrabold font-mono leading-none tracking-tight',
                    'text-[var(--textPrimary)]',
                  )}
                >
                  {cardLabel}
                </span>
                <span className="text-[10px] font-medium text-[var(--textMuted)] leading-none">
                  {cardDuration}
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
    </LobbyOptionGroup>
  );
}

export const QuickPlayPanel = memo(QuickPlayPanelImpl);
