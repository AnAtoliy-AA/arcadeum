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
  /**
   * Widget-mode replacement for the legacy CriticalGameHeader buttons.
   * When omitted, the menu row is hidden (e.g. for tests that don't care
   * about the chrome).
   */
  isFullscreen?: boolean;
  /** Toggles for the hand-card text rows (delegated to MatchWidget). */
  showCardName?: boolean;
  showCardDescription?: boolean;
  onToggleCardName?: () => void;
  onToggleCardDescription?: () => void;
  onPlay: () => void;
  onDraw: () => void;
  onNope: () => void;
  onOpenRules?: () => void;
  onToggleFullscreen?: () => void;
}

export function HandRail({
  handCount,
  defuseCount,
  combo,
  canPlay,
  canDraw,
  canNope,
  cardVariant: _cardVariant,
  isFullscreen,
  showCardName,
  showCardDescription,
  onToggleCardName,
  onToggleCardDescription,
  onPlay,
  onDraw,
  onNope,
  onOpenRules,
  onToggleFullscreen,
}: HandRailProps) {
  const { t } = useTranslation();
  const playLabel = combo.label;
  const hasCardToggles = !!(onToggleCardName || onToggleCardDescription);

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
      {hasCardToggles && (
        <XStack
          data-testid="hand-rail-card-toggles"
          gap="$1"
          paddingTop="$1"
          borderTopWidth={1}
          borderTopColor="rgba(255,255,255,0.08)"
        >
          {onToggleCardName && (
            <Button
              data-testid="hand-rail-toggle-name"
              size="$2"
              flex={1}
              backgroundColor={
                showCardName
                  ? 'rgba(52,211,153,0.15)'
                  : 'rgba(255,255,255,0.05)'
              }
              borderWidth={1}
              borderColor={
                showCardName
                  ? 'rgba(52,211,153,0.55)'
                  : 'rgba(255,255,255,0.08)'
              }
              onPress={onToggleCardName}
              aria-pressed={!!showCardName}
              aria-label={t('games.table.hud.cards.toggleName')}
            >
              <Text fontSize={10} fontWeight="700" letterSpacing={0.4}>
                {showCardName ? '✓ Aa' : '   Aa'}
              </Text>
            </Button>
          )}
          {onToggleCardDescription && (
            <Button
              data-testid="hand-rail-toggle-description"
              size="$2"
              flex={1}
              backgroundColor={
                showCardDescription
                  ? 'rgba(52,211,153,0.15)'
                  : 'rgba(255,255,255,0.05)'
              }
              borderWidth={1}
              borderColor={
                showCardDescription
                  ? 'rgba(52,211,153,0.55)'
                  : 'rgba(255,255,255,0.08)'
              }
              onPress={onToggleCardDescription}
              aria-pressed={!!showCardDescription}
              aria-label={t('games.table.hud.cards.toggleDescription')}
            >
              <Text fontSize={10} fontWeight="700" letterSpacing={0.4}>
                {showCardDescription ? '✓ ¶' : '   ¶'}
              </Text>
            </Button>
          )}
        </XStack>
      )}
      {(onOpenRules || onToggleFullscreen) && (
        <XStack
          data-testid="hand-rail-menu"
          gap="$1"
          paddingTop="$1"
          borderTopWidth={1}
          borderTopColor="rgba(255,255,255,0.08)"
        >
          {onOpenRules && (
            <Button
              data-testid="hand-rail-rules"
              size="$2"
              flex={1}
              backgroundColor="rgba(255,255,255,0.05)"
              onPress={onOpenRules}
            >
              <Text fontSize={10} fontWeight="700" letterSpacing={0.4}>
                {t('games.table.controlPanel.rules')}
              </Text>
            </Button>
          )}
          {onToggleFullscreen && (
            <Button
              data-testid="hand-rail-fullscreen"
              size="$2"
              flex={1}
              backgroundColor="rgba(255,255,255,0.05)"
              onPress={onToggleFullscreen}
              aria-label={t(
                isFullscreen
                  ? 'games.table.controlPanel.exitFullscreen'
                  : 'games.table.controlPanel.enterFullscreen',
              )}
            >
              <Text fontSize={12} fontWeight="700">
                {isFullscreen ? '⤡' : '⛶'}
              </Text>
            </Button>
          )}
        </XStack>
      )}
    </YStack>
  );
}
