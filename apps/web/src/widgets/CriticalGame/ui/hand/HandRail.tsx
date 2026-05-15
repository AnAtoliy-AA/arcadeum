'use client';

import { YStack, XStack, Text, Button } from 'tamagui';
import {
  BookOpenIcon,
  CardsIcon,
  HandIcon,
  MaximizeIcon,
  MinimizeIcon,
  ShieldIcon,
} from '@arcadeum/ui';
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

// Defuse-card pill shape lookup. Hoisted so the literal object isn't
// rebuilt on every render — that re-allocation prevented tamagui from
// memoizing the style hash, so the rendered class changed across renders
// even when nothing visual moved.
const DEFUSE_VARIANT = {
  low: {
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.45)',
    color: '#ef4444',
  },
  ok: {
    bg: NEUTRAL_BG,
    border: NEUTRAL_BORDER,
    color: ACCENT,
  },
} as const;

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
  const defuseVariant =
    defuseCount === 0 ? DEFUSE_VARIANT.low : DEFUSE_VARIANT.ok;

  return (
    <YStack
      data-testid="hand-rail"
      // 144 (up from 128) so the Play button label can fit "Play 3× …"
      // on two lines without mid-word ellipsis. The hand track still has
      // ample room — 144px is ≤6% of the 1240px max-width grid.
      //
      // No `$sm` width override: tamagui's `$sm` fires at ≤800px, but
      // `HandZone` already gates the rail on `useIsNarrow(480)` so the
      // rail only renders on >480px viewports. The previous
      // `$sm: { width: '100%' }` expanded the rail to fill the row at
      // tablet portrait (481–800), pushing the hand track off-screen.
      width={144}
      gap="$2"
      paddingHorizontal="$2"
      paddingVertical="$2.5"
      borderRadius={16}
      borderWidth={1}
      borderColor={NEUTRAL_BORDER}
      backgroundColor="rgba(8, 12, 20, 0.7)"
      flexShrink={0}
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
          <XStack alignItems="center" gap={6}>
            <CardsIcon size={16} />
            <Text fontSize={18} fontWeight="800" letterSpacing={0.5}>
              {handCount}
            </Text>
          </XStack>
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
          backgroundColor={defuseVariant.bg}
          borderWidth={1}
          borderColor={defuseVariant.border}
        >
          <XStack alignItems="center" gap={6}>
            <Text color={defuseVariant.color}>
              <ShieldIcon size={16} />
            </Text>
            <Text
              fontSize={18}
              fontWeight="800"
              letterSpacing={0.5}
              color={defuseVariant.color}
            >
              {defuseCount}
            </Text>
          </XStack>
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
        {/* Native tooltip carries the full combo label so the user can
            hover-confirm what 'Play 3× Targeted…' truncates to. The
            arena's ComboCard is the canonical surface for the verbose
            label — the rail is the action surface. Wrapper div is the
            only place we can attach `title` since tamagui's Button
            doesn't forward HTML title through. */}
        <div title={combo.label}>
          <Button
            data-testid="hand-rail-play"
            data-combo-kind={combo.kind}
            size="$3"
            height={48}
            width="100%"
            borderRadius={12}
            paddingHorizontal={6}
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
        </div>
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
            <XStack gap="$1.5" alignItems="center">
              <HandIcon size={14} />
              <Text
                fontSize={11}
                fontWeight="900"
                letterSpacing={0.3}
                textTransform="uppercase"
                color="#1c0f00"
              >
                {t('games.table.actions.playNope')}
              </Text>
            </XStack>
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
                  <BookOpenIcon size={16} />
                  <Text
                    fontSize={9}
                    fontWeight="800"
                    letterSpacing={0.6}
                    textTransform="uppercase"
                    opacity={0.85}
                    numberOfLines={1}
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
                  {isFullscreen ? (
                    <MinimizeIcon size={16} />
                  ) : (
                    <MaximizeIcon size={16} />
                  )}
                  {/* Short label only — "ENTER FULLSCREEN" / "EXIT
                      FULLSCREEN" overflowed the flex={1} rail button
                      and ran into the Rules button text next door. The
                      Maximize/Minimize icon already signals the state;
                      the full action label lives in the aria-label
                      above for assistive tech. */}
                  <Text
                    fontSize={9}
                    fontWeight="800"
                    letterSpacing={0.6}
                    textTransform="uppercase"
                    opacity={0.85}
                    numberOfLines={1}
                  >
                    {t('games.table.controlPanel.fullscreen')}
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
