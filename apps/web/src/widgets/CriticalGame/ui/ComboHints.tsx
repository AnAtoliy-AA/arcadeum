'use client';

import { useMemo, type CSSProperties } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalCard } from '../types';
import { COMBO_CARDS, FIVER_COMBO_SIZE } from '../types';

interface ComboHintsProps {
  hand: CriticalCard[];
  allowActionCardCombos: boolean;
  /**
   * The combo kind currently formed by the player's selection. When a
   * chip matches this kind it renders in the "active" state (filled
   * green); the other chips fall back to the softer "possible" state
   * that only reflects what's available in the hand.
   */
  activeKind?: 'none' | 'single' | 'pair' | 'triple' | 'five' | 'invalid';
}

interface ComboAvailability {
  pair: boolean;
  triple: boolean;
  fiver: boolean;
}

const COMBO_CARD_SET = new Set<CriticalCard>(COMBO_CARDS);

function computeAvailability(
  hand: CriticalCard[],
  allowActionCardCombos: boolean,
): ComboAvailability {
  const counts = new Map<CriticalCard, number>();
  for (const card of hand) {
    if (allowActionCardCombos || COMBO_CARD_SET.has(card)) {
      counts.set(card, (counts.get(card) ?? 0) + 1);
    }
  }
  let pair = false;
  let triple = false;
  for (const n of counts.values()) {
    if (n >= 2) pair = true;
    if (n >= 3) triple = true;
  }
  const distinctTitles = new Set(hand).size;
  const fiver = distinctTitles >= FIVER_COMBO_SIZE;
  return { pair, triple, fiver };
}

export function ComboHints({
  hand,
  allowActionCardCombos,
  activeKind,
}: ComboHintsProps) {
  const { t } = useTranslation();
  const { pair, triple, fiver } = useMemo(
    () => computeAvailability(hand, allowActionCardCombos),
    [hand, allowActionCardCombos],
  );

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 9999,
    background: 'rgba(0,0,0,0.45)',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  // Three states per chip:
  //   - active: the selection currently forms this combo kind. Filled
  //     green with dark text — preview's "you have this right now".
  //   - possible: the hand could form this combo but the selection
  //     hasn't yet. Soft outline — at-idle affordance.
  //   - inactive: neither active nor possible. Dimmed.
  const chip = (state: 'active' | 'possible' | 'inactive'): CSSProperties => {
    const isActive = state === 'active';
    const isPossible = state === 'possible';
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 8px',
      borderRadius: 9999,
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: isActive
        ? '#0b0b0b'
        : isPossible
          ? 'rgba(255,255,255,0.85)'
          : 'rgba(255,255,255,0.4)',
      background: isActive
        ? '#34d399'
        : isPossible
          ? 'rgba(52,211,153,0.10)'
          : 'rgba(255,255,255,0.04)',
      border: `1px solid ${
        isActive
          ? '#34d399'
          : isPossible
            ? 'rgba(52,211,153,0.45)'
            : 'rgba(255,255,255,0.08)'
      }`,
      transition: 'all 180ms ease-out',
    };
  };

  const stateFor = (
    kind: 'pair' | 'triple' | 'five',
    possible: boolean,
  ): 'active' | 'possible' | 'inactive' => {
    if (activeKind === kind) return 'active';
    return possible ? 'possible' : 'inactive';
  };

  const pairState = stateFor('pair', pair);
  const tripleState = stateFor('triple', triple);
  const fiverState = stateFor('five', fiver);

  return (
    <div data-testid="combo-hints" style={containerStyle}>
      <span
        data-testid="combo-hint-pair"
        data-active={pairState === 'active' ? 'true' : 'false'}
        data-state={pairState}
        style={chip(pairState)}
      >
        {t('games.table.hud.combo.pair')}
      </span>
      <span
        data-testid="combo-hint-triple"
        data-active={tripleState === 'active' ? 'true' : 'false'}
        data-state={tripleState}
        style={chip(tripleState)}
      >
        {t('games.table.hud.combo.triple')}
      </span>
      <span
        data-testid="combo-hint-fiver"
        data-active={fiverState === 'active' ? 'true' : 'false'}
        data-state={fiverState}
        style={chip(fiverState)}
      >
        {t('games.table.hud.combo.fiver')}
      </span>
    </div>
  );
}
