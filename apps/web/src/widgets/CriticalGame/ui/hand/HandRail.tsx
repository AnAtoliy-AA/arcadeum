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

const ACCENT = '#34d399';
const ACCENT_TINT_BG = 'rgba(52, 211, 153, 0.18)';
const ACCENT_TINT_BORDER = 'rgba(52, 211, 153, 0.65)';
const NEUTRAL_BG = 'rgba(255, 255, 255, 0.07)';
const NEUTRAL_BG_HOVER = 'rgba(255, 255, 255, 0.12)';
const NEUTRAL_BORDER = 'rgba(255, 255, 255, 0.10)';
const NOPE_COLOR = '#f59e0b';

interface RailSectionProps {
  children: React.ReactNode;
}

/**
 * Visual divider for a rail group. We deliberately drop section labels —
 * a hairline + spacing is enough hierarchy at this size and saves us
 * from adding i18n keys that read awkwardly translated.
 */
function RailSection({ children }: RailSectionProps) {
  return (
    <YStack
      gap="$1.5"
      paddingTop="$2"
      borderTopWidth={1}
      borderTopColor={NEUTRAL_BORDER}
    >
      {children}
    </YStack>
  );
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
  const hasCardToggles = !!(onToggleCardName || onToggleCardDescription);
  const hasChrome = !!(onOpenRules || onToggleFullscreen);
  const lowDefuse = defuseCount === 0;

  return (
    <YStack
      data-testid="hand-rail"
      width={128}
      gap="$2"
      paddingHorizontal="$2"
      paddingVertical="$2.5"
      borderRadius={16}
      borderWidth={1}
      borderColor={NEUTRAL_BORDER}
      backgroundColor="rgba(8, 12, 20, 0.7)"
      flexShrink={0}
      $sm={{ width: '100%' }}
    >
      {/* Stats header */}
      <XStack alignItems="stretch" gap="$2">
        <YStack
          data-testid="hand-rail-count"
          flex={1}
          alignItems="center"
          paddingVertical={8}
          paddingHorizontal={6}
          borderRadius={10}
          backgroundColor={NEUTRAL_BG}
          borderWidth={1}
          borderColor={NEUTRAL_BORDER}
        >
          <Text fontSize={18} fontWeight="800" letterSpacing={0.5}>
            🃏 {handCount}
          </Text>
          <Text
            fontSize={9}
            fontWeight="700"
            letterSpacing={1}
            textTransform="uppercase"
            opacity={0.55}
            marginTop={2}
          >
            {t('games.table.state.cards')}
          </Text>
        </YStack>
        <YStack
          data-testid="hand-rail-defuses"
          flex={1}
          alignItems="center"
          paddingVertical={8}
          paddingHorizontal={6}
          borderRadius={10}
          backgroundColor={lowDefuse ? 'rgba(239,68,68,0.10)' : NEUTRAL_BG}
          borderWidth={1}
          borderColor={lowDefuse ? 'rgba(239,68,68,0.45)' : NEUTRAL_BORDER}
        >
          <Text
            fontSize={18}
            fontWeight="800"
            letterSpacing={0.5}
            color={lowDefuse ? '#ef4444' : ACCENT}
          >
            🛡 {defuseCount}
          </Text>
          <Text
            fontSize={9}
            fontWeight="700"
            letterSpacing={1}
            textTransform="uppercase"
            opacity={0.55}
            marginTop={2}
          >
            {t('games.table.state.defuses')}
          </Text>
        </YStack>
      </XStack>

      {/* Primary actions */}
      <YStack gap="$1.5">
        <Button
          data-testid="hand-rail-play"
          data-combo-kind={combo.kind}
          size="$3"
          height={48}
          borderRadius={12}
          paddingHorizontal={4}
          disabled={!canPlay}
          opacity={canPlay ? 1 : 0.45}
          backgroundColor={canPlay ? ACCENT : NEUTRAL_BG}
          hoverStyle={canPlay ? { backgroundColor: '#22c55e' } : undefined}
          pressStyle={canPlay ? { scale: 0.98 } : undefined}
          onPress={canPlay ? onPlay : undefined}
        >
          <Text
            fontSize={12}
            fontWeight="900"
            letterSpacing={0.3}
            textTransform="uppercase"
            color={canPlay ? '#062317' : 'rgba(255,255,255,0.5)'}
            numberOfLines={2}
            textAlign="center"
          >
            {combo.label}
          </Text>
        </Button>
        <Button
          data-testid="hand-rail-draw"
          size="$2"
          height={36}
          borderRadius={10}
          disabled={!canDraw}
          opacity={canDraw ? 1 : 0.45}
          backgroundColor={NEUTRAL_BG}
          borderWidth={1}
          borderColor={NEUTRAL_BORDER}
          hoverStyle={
            canDraw ? { backgroundColor: NEUTRAL_BG_HOVER } : undefined
          }
          pressStyle={canDraw ? { scale: 0.98 } : undefined}
          onPress={canDraw ? onDraw : undefined}
        >
          <Text
            fontSize={11}
            fontWeight="800"
            letterSpacing={0.3}
            textTransform="uppercase"
          >
            ↓ {t('games.table.actions.draw')}
          </Text>
        </Button>
        {canNope && (
          <Button
            data-testid="hand-rail-nope"
            size="$2"
            height={36}
            borderRadius={10}
            backgroundColor={NOPE_COLOR}
            hoverStyle={{ backgroundColor: '#fbbf24' }}
            pressStyle={{ scale: 0.98 }}
            onPress={onNope}
          >
            <Text
              fontSize={11}
              fontWeight="900"
              letterSpacing={0.3}
              textTransform="uppercase"
              color="#1c0f00"
            >
              ✋ {t('games.table.actions.playNope')}
            </Text>
          </Button>
        )}
      </YStack>

      {/* Card-text toggles — compact 2-column row so the rail keeps its
          128px footprint instead of stacking two full-width buttons. */}
      {hasCardToggles && (
        <RailSection>
          <XStack gap="$1.5" data-testid="hand-rail-card-toggles">
            {onToggleCardName && (
              <Button
                data-testid="hand-rail-toggle-name"
                size="$2"
                height={32}
                flex={1}
                paddingHorizontal={4}
                borderRadius={8}
                backgroundColor={showCardName ? ACCENT_TINT_BG : NEUTRAL_BG}
                borderWidth={1}
                borderColor={showCardName ? ACCENT_TINT_BORDER : NEUTRAL_BORDER}
                hoverStyle={{
                  backgroundColor: showCardName
                    ? 'rgba(52,211,153,0.28)'
                    : NEUTRAL_BG_HOVER,
                }}
                onPress={onToggleCardName}
                aria-pressed={!!showCardName}
                aria-label={t('games.table.hud.cards.toggleName')}
              >
                <Text
                  fontSize={11}
                  fontWeight="800"
                  letterSpacing={0.3}
                  color={showCardName ? ACCENT : 'rgba(255,255,255,0.7)'}
                >
                  Aa {showCardName ? '✓' : '○'}
                </Text>
              </Button>
            )}
            {onToggleCardDescription && (
              <Button
                data-testid="hand-rail-toggle-description"
                size="$2"
                height={32}
                flex={1}
                paddingHorizontal={4}
                borderRadius={8}
                backgroundColor={
                  showCardDescription ? ACCENT_TINT_BG : NEUTRAL_BG
                }
                borderWidth={1}
                borderColor={
                  showCardDescription ? ACCENT_TINT_BORDER : NEUTRAL_BORDER
                }
                hoverStyle={{
                  backgroundColor: showCardDescription
                    ? 'rgba(52,211,153,0.28)'
                    : NEUTRAL_BG_HOVER,
                }}
                onPress={onToggleCardDescription}
                aria-pressed={!!showCardDescription}
                aria-label={t('games.table.hud.cards.toggleDescription')}
              >
                <Text
                  fontSize={11}
                  fontWeight="800"
                  letterSpacing={0.3}
                  color={showCardDescription ? ACCENT : 'rgba(255,255,255,0.7)'}
                >
                  ¶ {showCardDescription ? '✓' : '○'}
                </Text>
              </Button>
            )}
          </XStack>
        </RailSection>
      )}

      {/* Chrome */}
      {hasChrome && (
        <RailSection>
          <XStack gap="$1.5" data-testid="hand-rail-menu">
            {onOpenRules && (
              <Button
                data-testid="hand-rail-rules"
                size="$3"
                height={40}
                flex={1}
                borderRadius={8}
                backgroundColor={NEUTRAL_BG}
                borderWidth={1}
                borderColor={NEUTRAL_BORDER}
                hoverStyle={{ backgroundColor: NEUTRAL_BG_HOVER }}
                onPress={onOpenRules}
              >
                <YStack alignItems="center" gap={2}>
                  <Text fontSize={16}>📖</Text>
                  <Text
                    fontSize={9}
                    fontWeight="800"
                    letterSpacing={0.6}
                    textTransform="uppercase"
                    opacity={0.85}
                  >
                    {t('games.table.controlPanel.rules')}
                  </Text>
                </YStack>
              </Button>
            )}
            {onToggleFullscreen && (
              <Button
                data-testid="hand-rail-fullscreen"
                size="$3"
                height={40}
                flex={1}
                borderRadius={8}
                backgroundColor={NEUTRAL_BG}
                borderWidth={1}
                borderColor={NEUTRAL_BORDER}
                hoverStyle={{ backgroundColor: NEUTRAL_BG_HOVER }}
                onPress={onToggleFullscreen}
                aria-label={t(
                  isFullscreen
                    ? 'games.table.controlPanel.exitFullscreen'
                    : 'games.table.controlPanel.enterFullscreen',
                )}
              >
                <YStack alignItems="center" gap={2}>
                  <Text fontSize={16}>{isFullscreen ? '⤡' : '⛶'}</Text>
                  <Text
                    fontSize={9}
                    fontWeight="800"
                    letterSpacing={0.6}
                    textTransform="uppercase"
                    opacity={0.85}
                  >
                    {isFullscreen
                      ? t('games.table.controlPanel.exitFullscreen')
                      : t('games.table.controlPanel.enterFullscreen')}
                  </Text>
                </YStack>
              </Button>
            )}
          </XStack>
        </RailSection>
      )}
    </YStack>
  );
}
