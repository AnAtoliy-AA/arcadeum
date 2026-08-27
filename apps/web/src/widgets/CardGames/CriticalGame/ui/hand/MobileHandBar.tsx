'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ComboKind } from '../../lib/combo';

interface MobileHandBarProps {
  handCount: number;
  defuseCount: number;
  combo: { kind: ComboKind; label: string };
  canPlay: boolean;
  canDraw: boolean;
  canNope: boolean;
  isFullscreen?: boolean;
  showCardName: boolean;
  showCardDescription: boolean;
  onClearSelection?: () => void;
  onPlay: () => void;
  onDraw: () => void;
  onNope: () => void;
  onOpenRules?: () => void;
  onToggleFullscreen?: () => void;
  onToggleCardName: () => void;
  onToggleCardDescription: () => void;
}

/**
 * Sticky bottom action bar shown in widget mode at ≤480px. Play / Draw /
 * Nope live up front; Rules + Fullscreen tuck into an overflow popover
 * so the bar stays thumb-reachable. Pairs with `paddingBottom: 64` on
 * the game body so cards don't hide under the bar.
 *
 * Uses raw inline styles because:
 *   - `position: fixed` + `env(safe-area-inset-bottom)` aren't part of
 *     the Tailwind class surface
 *   - the bar lives outside the normal layout flow so flex/grid prop
 *     interplay doesn't help
 */
export function MobileHandBar({
  handCount,
  defuseCount,
  combo,
  canPlay,
  canDraw,
  canNope,
  isFullscreen,
  showCardName,
  showCardDescription,
  onClearSelection,
  onPlay,
  onDraw,
  onNope,
  onOpenRules,
  onToggleFullscreen,
  onToggleCardName,
  onToggleCardDescription,
}: MobileHandBarProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Card-text toggles always present, so the menu always exists.
  const hasMenu = true;

  // Rendered into a portal so an ancestor `transform`/`filter` (e.g. the
  // `animate-entrance` class on ActiveGameView) doesn't create a new
  // containing block and pin our `position: fixed` to that wrapper
  // instead of the viewport. SSR-safe via the `mounted` guard.
  // Mount-flag for SSR safety; the rule's cascading-renders concern
  // doesn't apply to a one-shot first-paint flip.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const wrapperStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
    paddingTop: 8,
    paddingLeft: 12,
    paddingRight: 12,
    background: 'rgba(7, 10, 17, 0.94)',
    borderTop: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 -8px 24px rgba(0,0,0,0.45)',
    // Above OpponentTile (z-100) and below modals (z-1000+).
    // In fullscreen mode, above GameWidgetContainer (z-1100).
    zIndex: isFullscreen ? 1200 : 150,
    backdropFilter: 'blur(8px)',
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
  };

  const pillStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 9999,
    border: '1px solid rgba(255,255,255,0.10)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.4px',
    color: '#e2e8f0',
    background: 'rgba(255,255,255,0.04)',
    whiteSpace: 'nowrap',
  };

  const defusePillStyle: CSSProperties = {
    ...pillStyle,
    color: defuseCount === 0 ? '#ef4444' : '#34d399',
    borderColor:
      defuseCount === 0 ? 'rgba(239,68,68,0.45)' : 'rgba(52,211,153,0.45)',
  };

  function buttonStyle(opts: {
    primary?: boolean;
    accent?: string;
    enabled: boolean;
    flex?: number;
  }): CSSProperties {
    const accent = opts.accent ?? '#34d399';
    return {
      flex: opts.flex ?? 1,
      minWidth: 0,
      minHeight: 44,
      padding: '0 10px',
      borderRadius: 10,
      border: opts.primary
        ? `1px solid ${accent}`
        : '1px solid rgba(255,255,255,0.22)',
      background: opts.primary
        ? opts.enabled
          ? accent
          : 'rgba(255,255,255,0.12)'
        : 'rgba(255,255,255,0.10)',
      color: opts.primary && opts.enabled ? '#0b0b0b' : '#ffffff',
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      opacity: opts.enabled ? 1 : 0.4,
      cursor: opts.enabled ? 'pointer' : 'not-allowed',
      transition: 'opacity 150ms ease, transform 100ms ease',
      transform: opts.enabled ? 'scale(1)' : 'scale(0.98)',
      filter: opts.enabled ? 'none' : 'grayscale(50%)',
    };
  }

  const overflowButtonStyle: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 9999,
    border: '1px solid rgba(255,255,255,0.22)',
    background: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 800,
    cursor: 'pointer',
    lineHeight: '40px',
  };

  const popoverStyle: CSSProperties = {
    position: 'absolute',
    bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
    right: 12,
    minWidth: 160,
    padding: 6,
    borderRadius: 12,
    background: 'rgba(7,10,17,0.98)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.55)',
    display: 'grid',
    gap: 4,
  };

  const popoverItemStyle: CSSProperties = {
    textAlign: 'left',
    padding: '8px 10px',
    borderRadius: 8,
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.3px',
    cursor: 'pointer',
  };

  if (!mounted || typeof document === 'undefined') return null;

  const isInvalid = combo.kind === 'invalid';
  const handleComboClick = isInvalid
    ? onClearSelection
    : canPlay
      ? onPlay
      : undefined;

  const bar = (
    <div data-testid="mobile-hand-bar" style={wrapperStyle}>
      <div style={rowStyle}>
        <div
          data-testid="mobile-hand-bar-stats"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <span data-testid="mobile-hand-bar-count" style={pillStyle}>
            🃏 {handCount}
          </span>
          <span data-testid="mobile-hand-bar-defuses" style={defusePillStyle}>
            🛡 {defuseCount}
          </span>
        </div>
        <button
          type="button"
          data-testid="mobile-hand-bar-play"
          data-combo-kind={combo.kind}
          disabled={!canPlay && !isInvalid}
          onClick={handleComboClick}
          style={{
            ...buttonStyle({
              primary: true,
              accent: isInvalid ? '#ef4444' : undefined,
              enabled: canPlay || isInvalid,
              flex: 3,
            }),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          aria-label={
            !canPlay && !isInvalid
              ? t('games.table.hud.combo.pickTarget')
              : combo.label
          }
        >
          {isInvalid ? `✕ ${combo.label}` : combo.label}
        </button>
        <button
          type="button"
          data-testid="mobile-hand-bar-draw"
          disabled={!canDraw}
          onClick={canDraw ? onDraw : undefined}
          style={buttonStyle({ enabled: canDraw, flex: 2 })}
        >
          {t('games.table.actions.draw')}
        </button>
        {canNope && (
          <button
            type="button"
            data-testid="mobile-hand-bar-nope"
            onClick={onNope}
            style={buttonStyle({
              primary: true,
              accent: '#f59e0b',
              enabled: true,
              flex: 2,
            })}
          >
            {t('games.table.actions.playNope')}
          </button>
        )}
        {hasMenu && (
          <button
            type="button"
            data-testid="mobile-hand-bar-overflow"
            aria-label="More"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={overflowButtonStyle}
          >
            ⋯
          </button>
        )}
      </div>
      {hasMenu && menuOpen && (
        <div
          data-testid="mobile-hand-bar-overflow-menu"
          role="menu"
          style={popoverStyle}
        >
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={showCardName}
            data-testid="mobile-hand-bar-toggle-name"
            onClick={onToggleCardName}
            style={popoverItemStyle}
          >
            {showCardName ? '☑' : '☐'} {t('games.table.hud.cards.toggleName')}
          </button>
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={showCardDescription}
            data-testid="mobile-hand-bar-toggle-description"
            onClick={onToggleCardDescription}
            style={popoverItemStyle}
          >
            {showCardDescription ? '☑' : '☐'}{' '}
            {t('games.table.hud.cards.toggleDescription')}
          </button>
          {onOpenRules && (
            <button
              type="button"
              role="menuitem"
              data-testid="mobile-hand-bar-rules"
              onClick={() => {
                setMenuOpen(false);
                onOpenRules();
              }}
              style={popoverItemStyle}
            >
              {t('games.table.controlPanel.rules')}
            </button>
          )}
          {onToggleFullscreen && (
            <button
              type="button"
              role="menuitem"
              data-testid="mobile-hand-bar-fullscreen"
              onClick={() => {
                setMenuOpen(false);
                onToggleFullscreen();
              }}
              style={popoverItemStyle}
            >
              {t(
                isFullscreen
                  ? 'games.table.controlPanel.exitFullscreen'
                  : 'games.table.controlPanel.enterFullscreen',
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(bar, document.body);
}
