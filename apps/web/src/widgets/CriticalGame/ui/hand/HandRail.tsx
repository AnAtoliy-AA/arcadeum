'use client';

import { Button } from 'tamagui';
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
    <div
      className={
        '"box-border flex flex-col items-stretch gap-null pt-2 border-t"'
      }
      style={{ borderTopColor: NEUTRAL_BORDER }}
    >
      {children}
    </div>
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
    <div
      className={
        '"box-border flex flex-col items-stretch w-[144px] gap-2 px-2 rounded-[16px] border bg-[rgba(8,_12,_20,_0.7)] shrink-0"'
      }
      style={{ borderColor: NEUTRAL_BORDER }}
      data-testid="hand-rail"
    >
      {/* Stats header */}
      <div className="box-border flex flex-row items-stretch gap-2">
        <div
          className={
            '"box-border flex flex-col flex-1 items-center py-8 px-6 rounded-[10px] border"'
          }
          style={{ backgroundColor: NEUTRAL_BG, borderColor: NEUTRAL_BORDER }}
          data-testid="hand-rail-count"
        >
          <div className="box-border flex flex-row items-center gap-6">
            <CardsIcon size={16} />
            <span className="box-border text-[18px] font-extrabold tracking-[0.5px]">
              {handCount}
            </span>
          </div>
          <span className="box-border text-[40px] font-bold tracking-[1px] uppercase opacity-[0.55] -mt-2">
            {t('games.table.state.cards')}
          </span>
        </div>
        <div
          className={
            '"box-border flex flex-col flex-1 items-center py-8 px-6 rounded-[10px] border"'
          }
          style={{
            backgroundColor: defuseVariant.bg,
            borderColor: defuseVariant.border,
          }}
          data-testid="hand-rail-defuses"
        >
          <div className="box-border flex flex-row items-center gap-6">
            <span
              className={'"box-border"'}
              style={{ color: defuseVariant.color }}
            >
              <ShieldIcon size={16} />
            </span>
            <span
              className={
                '"box-border text-[18px] font-extrabold tracking-[0.5px]"'
              }
              style={{ color: defuseVariant.color }}
            >
              {defuseCount}
            </span>
          </div>
          <span className="box-border text-[40px] font-bold tracking-[1px] uppercase opacity-[0.55] -mt-2">
            {t('games.table.state.defuses')}
          </span>
        </div>
      </div>

      {/* Primary actions */}
      <div className="box-border flex flex-col items-stretch gap-null">
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
            <span
              className={
                '"box-border text-[12px] font-black tracking-[0.3px] uppercase line-clamp-2 text-center"'
              }
              style={{ color: canPlay ? '#062317' : 'rgba(255,255,255,0.5)' }}
            >
              {combo.label}
            </span>
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
          <span className="box-border text-[11px] font-extrabold tracking-[0.3px] uppercase">
            ↓ {t('games.table.actions.draw')}
          </span>
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
            <div className="box-border flex flex-row gap-null items-center">
              <HandIcon size={14} />
              <span className="box-border text-[11px] font-black tracking-[0.3px] uppercase text-[#1c0f00]">
                {t('games.table.actions.playNope')}
              </span>
            </div>
          </Button>
        )}
      </div>

      {/* Card-text toggles — compact 2-column row so the rail keeps its
          128px footprint instead of stacking two full-width buttons. */}
      {hasCardToggles && (
        <RailSection>
          <div
            className="box-border flex flex-row items-stretch gap-null"
            data-testid="hand-rail-card-toggles"
          >
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
                <span
                  className={
                    '"box-border text-[11px] font-extrabold tracking-[0.3px]"'
                  }
                  style={{
                    color: showCardName ? ACCENT : 'rgba(255,255,255,0.7)',
                  }}
                >
                  Aa {showCardName ? '✓' : '○'}
                </span>
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
                <span
                  className={
                    '"box-border text-[11px] font-extrabold tracking-[0.3px]"'
                  }
                  style={{
                    color: showCardDescription
                      ? ACCENT
                      : 'rgba(255,255,255,0.7)',
                  }}
                >
                  ¶ {showCardDescription ? '✓' : '○'}
                </span>
              </Button>
            )}
          </div>
        </RailSection>
      )}

      {/* Chrome */}
      {hasChrome && (
        <RailSection>
          <div
            className="box-border flex flex-row items-stretch gap-null"
            data-testid="hand-rail-menu"
          >
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
                <div className="box-border flex flex-col items-center gap-2">
                  <BookOpenIcon size={16} />
                  <span className="box-border text-[40px] font-extrabold tracking-[0.6px] uppercase opacity-[0.85] line-clamp-1">
                    {t('games.table.controlPanel.rules')}
                  </span>
                </div>
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
                <div className="box-border flex flex-col items-center gap-2">
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
                  <span className="box-border text-[40px] font-extrabold tracking-[0.6px] uppercase opacity-[0.85] line-clamp-1">
                    {t('games.table.controlPanel.fullscreen')}
                  </span>
                </div>
              </Button>
            )}
          </div>
        </RailSection>
      )}
    </div>
  );
}
