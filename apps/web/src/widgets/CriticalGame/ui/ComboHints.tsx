'use client';

import { useMemo, type CSSProperties } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalCard } from '../types';
import { COMBO_CARDS, FIVER_COMBO_SIZE } from '../types';

interface ComboHintsProps {
  hand: CriticalCard[];
  allowActionCardCombos: boolean;
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

export function ComboHints({ hand, allowActionCardCombos }: ComboHintsProps) {
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

  const chip = (active: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 9999,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: active ? '#0b0b0b' : 'rgba(255,255,255,0.55)',
    background: active ? '#34d399' : 'rgba(255,255,255,0.06)',
    border: `1px solid ${active ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
    transition: 'all 180ms ease-out',
  });

  return (
    <div data-testid="combo-hints" style={containerStyle}>
      <span
        data-testid="combo-hint-pair"
        data-active={pair ? 'true' : 'false'}
        style={chip(pair)}
      >
        {t('games.table.hud.combo.pair')}
      </span>
      <span
        data-testid="combo-hint-triple"
        data-active={triple ? 'true' : 'false'}
        style={chip(triple)}
      >
        {t('games.table.hud.combo.triple')}
      </span>
      <span
        data-testid="combo-hint-fiver"
        data-active={fiver ? 'true' : 'false'}
        style={chip(fiver)}
      >
        {t('games.table.hud.combo.fiver')}
      </span>
    </div>
  );
}
