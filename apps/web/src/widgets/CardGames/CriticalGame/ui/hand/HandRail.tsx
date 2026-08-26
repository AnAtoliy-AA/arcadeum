'use client';

import {
  BookOpenIcon,
  CardsIcon,
  HandIcon,
  MaximizeIcon,
  MinimizeIcon,
  ShieldIcon,
  Typography,
} from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
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
  onClearSelection?: () => void;
  onPlay: () => void;
  onDraw: () => void;
  onNope: () => void;
  onOpenRules?: () => void;
  onToggleFullscreen?: () => void;
}

const ACCENT = '#34d399';
const NEUTRAL_BG = 'rgba(255, 255, 255, 0.07)';
const NEUTRAL_BORDER = 'rgba(255, 255, 255, 0.10)';

// Defuse-card pill shape lookup. Hoisted so the literal object isn't
// rebuilt on every render — that re-allocation prevented class caching
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
      className="flex flex-col items-stretch gap-[6px] border-t pt-2"
      style={{ borderTopColor: NEUTRAL_BORDER }}
    >
      {children}
    </div>
  );
}

function RailButton({
  className,
  disabled,
  onClick,
  'data-testid': testId,
  'data-combo-kind': comboKind,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  children,
}: {
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  'data-testid'?: string;
  'data-combo-kind'?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      className={cx(
        'flex select-none cursor-pointer items-center justify-center transition-colors duration-150',
        className,
      )}
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      data-combo-kind={comboKind}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
    >
      {children}
    </button>
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
  onClearSelection,
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
  const isInvalid = combo.kind === 'invalid';
  const handleComboClick = isInvalid
    ? onClearSelection
    : canPlay
      ? onPlay
      : undefined;

  return (
    <div
      className="flex w-[144px] shrink-0 flex-col items-stretch gap-2 rounded-[16px] border bg-[rgba(8,12,20,0.7)] px-2 py-[10px]"
      style={{ borderColor: NEUTRAL_BORDER }}
      data-testid="hand-rail"
    >
      {/* Stats header */}
      <div className="flex flex-row items-stretch gap-2">
        <div
          className="flex flex-1 flex-col items-center rounded-[10px] border px-[6px] py-[8px]"
          style={{ backgroundColor: NEUTRAL_BG, borderColor: NEUTRAL_BORDER }}
          data-testid="hand-rail-count"
        >
          <div className="flex flex-row items-center gap-1.5">
            <CardsIcon size={16} />
            <Typography weight="800">{handCount}</Typography>
          </div>
          <Typography
            uiSize="xs"
            weight="700"
            alpha="low"
            className="uppercase"
          >
            {t('games.table.state.cards')}
          </Typography>
        </div>
        <div
          className="flex flex-1 flex-col items-center rounded-[10px] border px-[6px] py-[8px]"
          style={{
            backgroundColor: defuseVariant.bg,
            borderColor: defuseVariant.border,
          }}
          data-testid="hand-rail-defuses"
        >
          <div className="flex flex-row items-center gap-1.5">
            <span className="" style={{ color: defuseVariant.color }}>
              <ShieldIcon size={16} />
            </span>
            <Typography weight="800" style={{ color: defuseVariant.color }}>
              {defuseCount}
            </Typography>
          </div>
          <Typography
            uiSize="xs"
            weight="700"
            alpha="low"
            className="uppercase"
          >
            {t('games.table.state.defuses')}
          </Typography>
        </div>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col items-stretch gap-[6px]">
        {/* Native tooltip carries the full combo label so the user can
            hover-confirm what 'Play 3× Targeted…' truncates to. The
            arena's ComboCard is the canonical surface for the verbose
            label — the rail is the action surface. Wrapper div is the
            only place we can attach `title` since the legacy Button
            doesn't forward HTML title through. */}
        <div title={combo.label}>
          <RailButton
            className={`h-[48px] w-full rounded-[12px] px-4 ${cx(
              canPlay
                ? 'bg-[#34d399] hover:bg-[#22c55e] active:scale-[0.98]'
                : isInvalid
                  ? 'bg-[rgba(239,68,68,0.18)] border border-[rgba(239,68,68,0.45)] hover:bg-[rgba(239,68,68,0.28)] active:scale-[0.98]'
                  : 'bg-[rgba(255,255,255,0.07)]',
            )}`}
            data-testid="hand-rail-play"
            data-combo-kind={combo.kind}
            disabled={!canPlay && !isInvalid}
            onClick={handleComboClick}
          >
            <div className="flex flex-col items-center justify-center">
              <Typography
                uiSize="xs"
                weight="800"
                className={cx(
                  'text-center uppercase line-clamp-2',
                  canPlay
                    ? 'text-[#062317]'
                    : isInvalid
                      ? 'text-[#ef4444]'
                      : 'text-[rgba(255,255,255,0.5)]',
                )}
              >
                {combo.label}
              </Typography>
              {isInvalid && (
                <Typography
                  uiSize="xs"
                  weight="700"
                  className="text-[9px] text-[#ef4444] uppercase tracking-[0.5px] mt-0.5"
                >
                  ✕ {t('games.table.mobile.cancel')}
                </Typography>
              )}
            </div>
          </RailButton>
        </div>
        <RailButton
          className={`h-[36px] rounded-[10px] ${cx(
            'border border-[rgba(255,255,255,0.10)]',
            canDraw
              ? 'bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.12)] active:scale-[0.98]'
              : '',
          )}`}
          data-testid="hand-rail-draw"
          disabled={!canDraw}
          onClick={canDraw ? onDraw : undefined}
        >
          <Typography uiSize="xs" weight="800" className="uppercase">
            ↓ {t('games.table.actions.draw')}
          </Typography>
        </RailButton>
        {canNope && (
          <RailButton
            className="h-[36px] rounded-[10px]"
            data-testid="hand-rail-nope"
            onClick={onNope}
          >
            <div className="flex flex-row items-center gap-[6px]">
              <HandIcon size={14} />
              <Typography
                uiSize="xs"
                weight="800"
                className="uppercase text-[#1c0f00]"
              >
                {t('games.table.actions.playNope')}
              </Typography>
            </div>
          </RailButton>
        )}
      </div>

      {/* Card-text toggles — compact 2-column row so the rail keeps its
          128px footprint instead of stacking two full-width buttons. */}
      {hasCardToggles && (
        <RailSection>
          <div
            className="flex flex-row items-stretch gap-[6px]"
            data-testid="hand-rail-card-toggles"
          >
            {onToggleCardName && (
              <RailButton
                className={`h-[32px] flex-1 px-4 rounded-[8px] ${cx(
                  'border',
                  showCardName
                    ? 'border-[rgba(52,211,153,0.65)] bg-[rgba(52,211,153,0.18)] hover:bg-[rgba(52,211,153,0.28)]'
                    : 'border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.12)]',
                )}`}
                data-testid="hand-rail-toggle-name"
                onClick={onToggleCardName}
                aria-pressed={!!showCardName}
                aria-label={t('games.table.hud.cards.toggleName')}
              >
                <Typography
                  uiSize="xs"
                  weight="800"
                  className={cx(
                    showCardName
                      ? 'text-[#34d399]'
                      : 'text-[rgba(255,255,255,0.7)]',
                  )}
                >
                  Aa {showCardName ? '✓' : '○'}
                </Typography>
              </RailButton>
            )}
            {onToggleCardDescription && (
              <RailButton
                className={`h-[32px] flex-1 px-4 rounded-[8px] ${cx(
                  'border',
                  showCardDescription
                    ? 'border-[rgba(52,211,153,0.65)] bg-[rgba(52,211,153,0.18)] hover:bg-[rgba(52,211,153,0.28)]'
                    : 'border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.12)]',
                )}`}
                data-testid="hand-rail-toggle-description"
                onClick={onToggleCardDescription}
                aria-pressed={!!showCardDescription}
                aria-label={t('games.table.hud.cards.toggleDescription')}
              >
                <Typography
                  uiSize="xs"
                  weight="800"
                  className={cx(
                    showCardDescription
                      ? 'text-[#34d399]'
                      : 'text-[rgba(255,255,255,0.7)]',
                  )}
                >
                  ¶ {showCardDescription ? '✓' : '○'}
                </Typography>
              </RailButton>
            )}
          </div>
        </RailSection>
      )}

      {/* Chrome */}
      {hasChrome && (
        <RailSection>
          <div
            className="flex flex-row items-stretch gap-[6px]"
            data-testid="hand-rail-menu"
          >
            {onOpenRules && (
              <RailButton
                className="h-[48px] flex-1 rounded-[10px] py-1.5"
                data-testid="hand-rail-rules"
                onClick={onOpenRules}
              >
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <BookOpenIcon size={16} />
                  <Typography
                    uiSize="xs"
                    weight="800"
                    alpha="high"
                    className="uppercase tracking-[0.5px] text-[10px]"
                  >
                    {t('games.table.controlPanel.rules')}
                  </Typography>
                </div>
              </RailButton>
            )}
            {onToggleFullscreen && (
              <RailButton
                className="h-[48px] flex-1 rounded-[10px] py-1.5"
                data-testid="hand-rail-fullscreen"
                onClick={onToggleFullscreen}
                aria-label={t(
                  isFullscreen
                    ? 'games.table.controlPanel.exitFullscreen'
                    : 'games.table.controlPanel.enterFullscreen',
                )}
              >
                <div className="flex flex-col items-center justify-center gap-0.5">
                  {isFullscreen ? (
                    <MinimizeIcon size={16} />
                  ) : (
                    <MaximizeIcon size={16} />
                  )}
                  <Typography
                    uiSize="xs"
                    weight="800"
                    alpha="high"
                    className="uppercase tracking-[0.5px] text-[10px]"
                  >
                    {t('games.table.controlPanel.fullscreen')}
                  </Typography>
                </div>
              </RailButton>
            )}
          </div>
        </RailSection>
      )}
    </div>
  );
}
