'use client';

import type { CSSProperties } from 'react';
import { YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ComboHints } from '../ComboHints';
import type { CriticalCard } from '../../types';

export type ComboKind =
  | 'none'
  | 'single'
  | 'pair'
  | 'triple'
  | 'five'
  | 'invalid';

interface ComboCardProps {
  hand: CriticalCard[];
  allowActionCardCombos: boolean;
  /**
   * Detected combo for the current selection. ARC-633 wires only the
   * default `none` state through — ARC-635 (HandZone) lifts the actual
   * selection state and starts driving this value.
   */
  combo?: { kind: ComboKind; label: string };
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
// literal on every render. tamagui's RN-style `shadow*` props translate to
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
  invalid: 'drop-shadow(0 0 12px rgba(239,68,68,0.18))',
};

export function ComboCard({
  hand,
  allowActionCardCombos,
  combo,
}: ComboCardProps) {
  const { t } = useTranslation();
  const kind: ComboKind = combo?.kind ?? 'none';
  const label = combo?.label ?? t('games.table.hud.combo.placeholder');

  return (
    <YStack
      data-testid="combo-card"
      data-kind={kind}
      alignItems="center"
      gap="$2"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius={14}
      borderWidth={1}
      borderColor={KIND_BORDER[kind]}
      backgroundColor="rgba(0,0,0,0.45)"
      opacity={kind === 'invalid' ? 0.65 : 1}
      style={{ filter: KIND_FILTER[kind] }}
    >
      <Text
        data-testid="combo-card-label"
        fontSize={11}
        fontWeight="800"
        letterSpacing={0.6}
        textTransform="uppercase"
        color="#e2e8f0"
      >
        {label}
      </Text>
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
    </YStack>
  );
}
