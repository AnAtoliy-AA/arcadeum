'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ComboHints } from '../ComboHints';
import type { CriticalCard } from '../../types';

export type ComboKind =
  'none' | 'single' | 'pair' | 'triple' | 'five' | 'invalid';

interface ComboCardProps {
  hand: CriticalCard[];
  allowActionCardCombos: boolean;
  /**
   * Detected combo for the current selection. ARC-633 wires only the
   * default `none` state through — ARC-635 (HandZone) lifts the actual
   * selection state and starts driving this value.
   */
  combo?: { kind: ComboKind; label: string };
  onClearSelection?: () => void;
}

const KIND_BORDER: Record<ComboKind, string> = {
  none: 'rgba(255,255,255,0.12)',
  single: '#22d3ee',
  pair: '#f59e0b',
  triple: '#a78bfa',
  five: '#f472b6',
  invalid: '#ef4444',
};

// Pre-built filter strings keyed by kind so we don't rebuild the template
// literal on every render. RN-style `shadow*` props translate to
// `box-shadow` on web; emitting both there and via `filter: drop-shadow`
// painted the glow twice — we now drop the shadow props entirely and rely
// on `filter` only, which is also the only path that paints consistently
// across browsers for non-rectangular cards.
const KIND_FILTER: Record<ComboKind, CSSProperties['filter']> = {
  none: undefined,
  single: 'drop-shadow(0 0 12px rgba(34,211,238,0.25))',
  pair: 'drop-shadow(0 0 12px rgba(245,158,11,0.28))',
  triple: 'drop-shadow(0 0 12px rgba(167,139,250,0.28))',
  five: 'drop-shadow(0 0 12px rgba(244,114,182,0.28))',
  invalid: 'drop-shadow(0 0 12px rgba(239,68,68,0.28))',
};

export function ComboCard({
  hand,
  allowActionCardCombos,
  combo,
  onClearSelection,
}: ComboCardProps) {
  const { t } = useTranslation();
  const kind: ComboKind = combo?.kind ?? 'none';
  const label = combo?.label ?? t('games.table.hud.combo.placeholder');
  const isInvalid = kind === 'invalid';
  const canClear = isInvalid && !!onClearSelection;

  return (
    <div
      className={`flex flex-col items-center gap-2 px-3 py-2 rounded-[14px] border bg-[rgba(0,0,0,0.45)] transition-all select-none ${
        canClear
          ? 'cursor-pointer hover:bg-[rgba(239,68,68,0.15)] active:scale-[0.98]'
          : ''
      }`}
      style={{
        filter: KIND_FILTER[kind],
        borderColor: KIND_BORDER[kind],
        opacity: 1,
      }}
      onClick={canClear ? onClearSelection : undefined}
      role={canClear ? 'button' : undefined}
      tabIndex={canClear ? 0 : undefined}
      onKeyDown={
        canClear
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClearSelection();
              }
            }
          : undefined
      }
      data-testid="combo-card"
      data-kind={kind}
    >
      <div className="flex flex-row items-center gap-2">
        <span
          className="text-[11px] font-extrabold tracking-[0.6px] uppercase text-[#e2e8f0]"
          data-testid="combo-card-label"
        >
          {label}
        </span>
        {isInvalid && onClearSelection && (
          <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-[0.4px] bg-[rgba(239,68,68,0.2)] px-1.5 py-0.5 rounded-[4px]">
            ✕ {t('games.table.mobile.cancel')}
          </span>
        )}
      </div>
      {/* Hide the chip strip at idle — three "possible" chips read as
          decorative clutter without a selection. Once the player picks
          anything (kind !== 'none') the strip surfaces the active /
          possible combo states. */}
      {kind !== 'none' && (
        <ComboHints
          hand={hand}
          allowActionCardCombos={allowActionCardCombos}
          activeKind={kind}
        />
      )}
    </div>
  );
}
