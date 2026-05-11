'use client';

import { YStack, XStack, Text, Button } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ComboKind } from '../../lib/combo';

interface HandRailProps {
  handCount: number;
  defuseCount: number;
  /**
   * Combo summary pre-rendered by `MatchWidget` so the same label is
   * shown on both the arena's ComboCard and the rail's Play button.
   */
  combo: { kind: ComboKind; label: string };
  canPlay: boolean;
  canDraw: boolean;
  canNope: boolean;
  cardVariant?: string;
  onPlay: () => void;
  onDraw: () => void;
  onNope: () => void;
}

/**
 * Side rail next to the hand: shows the player's hand count, defuse
 * count, and the two primary action buttons (contextual Play + Draw +
 * end). A Nope button appears reactively when a nope-eligible pending
 * action is on the table.
 */
export function HandRail({
  handCount,
  defuseCount,
  combo,
  canPlay,
  canDraw,
  canNope,
  cardVariant: _cardVariant,
  onPlay,
  onDraw,
  onNope,
}: HandRailProps) {
  const { t } = useTranslation();
  const playLabel = combo.label;

  return (
    <YStack
      data-testid="hand-rail"
      width={180}
      gap="$2"
      paddingHorizontal="$2"
      paddingVertical="$3"
      borderRadius={12}
      borderWidth={1}
      borderColor="rgba(255,255,255,0.10)"
      backgroundColor="rgba(0,0,0,0.45)"
      $sm={{ width: '100%' }}
    >
      <XStack alignItems="center" justifyContent="space-between" gap="$2">
        <Text
          data-testid="hand-rail-count"
          fontSize={11}
          fontWeight="800"
          letterSpacing={0.5}
          textTransform="uppercase"
          opacity={0.85}
        >
          🃏 {handCount}
        </Text>
        <Text
          data-testid="hand-rail-defuses"
          fontSize={11}
          fontWeight="800"
          letterSpacing={0.5}
          textTransform="uppercase"
          color={defuseCount === 0 ? '#ef4444' : '#34d399'}
        >
          🛡 {defuseCount}
        </Text>
      </XStack>
      <Button
        data-testid="hand-rail-play"
        data-combo-kind={combo.kind}
        size="$3"
        disabled={!canPlay}
        opacity={canPlay ? 1 : 0.5}
        backgroundColor={canPlay ? '#34d399' : 'rgba(255,255,255,0.08)'}
        onPress={canPlay ? onPlay : undefined}
      >
        <Text
          fontSize={12}
          fontWeight="800"
          letterSpacing={0.3}
          color={canPlay ? '#0b0b0b' : 'rgba(255,255,255,0.6)'}
        >
          {playLabel}
        </Text>
      </Button>
      <Button
        data-testid="hand-rail-draw"
        size="$3"
        disabled={!canDraw}
        opacity={canDraw ? 1 : 0.5}
        backgroundColor="rgba(255,255,255,0.08)"
        onPress={canDraw ? onDraw : undefined}
      >
        <Text fontSize={12} fontWeight="800" letterSpacing={0.3}>
          {t('games.table.actions.draw')} + ⏎
        </Text>
      </Button>
      {canNope && (
        <Button
          data-testid="hand-rail-nope"
          size="$3"
          backgroundColor="#f59e0b"
          onPress={onNope}
        >
          <Text
            fontSize={12}
            fontWeight="800"
            letterSpacing={0.3}
            color="#0b0b0b"
          >
            {t('games.table.actions.playNope')}
          </Text>
        </Button>
      )}
    </YStack>
  );
}
