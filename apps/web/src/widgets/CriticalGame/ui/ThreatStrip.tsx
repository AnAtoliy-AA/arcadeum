'use client';

import { useMemo, type CSSProperties } from 'react';
import { ShieldIcon } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { CriticalCard } from '../types';

interface ThreatStripProps {
  hand: CriticalCard[];
  deck: CriticalCard[];
  /**
   * Count of deck cards the snapshot has masked (Tracker/future-peek,
   * etc.). Folded into the client-fallback denominator so the percentage
   * doesn't overstate when most of the deck is hidden. Ignored when
   * `serverOverloadOdds` is supplied.
   */
  hiddenCount?: number;
  /**
   * Server-authoritative draw-elimination odds. When provided, used
   * directly and the tooltip drops its "min odds (visible only)" caveat.
   * Falls back to the visible-deck approximation when undefined.
   */
  serverOverloadOdds?: number | null;
}

const DEFUSE_CARDS: readonly CriticalCard[] = [
  'neutralizer',
  'containment_field',
];

function countDefuses(hand: CriticalCard[]): number {
  return hand.filter((c) => DEFUSE_CARDS.includes(c)).length;
}

function computeOverloadOdds(
  deck: CriticalCard[],
  externalHiddenCount: number,
): number | null {
  // Hidden cards COULD be a critical, but we can't count them in the
  // numerator without server data. Keeping them in the denominator
  // yields a LOWER BOUND on the true odds (a "min odds" estimate). The
  // tooltip labels this clearly so users don't read the percentage as
  // exact. Production should source `overloadOdds` directly from the
  // snapshot.
  //
  // `deck` may contain `'hidden'` placeholders (Tracker/peek masks) OR
  // exclude hidden cards entirely — `externalHiddenCount` covers the
  // latter case so the denominator stays honest when most of the deck
  // is opaque to the client.
  const visible = deck.filter((c) => (c as string) !== 'hidden').length;
  const totalHidden = deck.length - visible + Math.max(0, externalHiddenCount);
  if (visible === 0 && totalHidden > 0) return null;
  const denominator = visible + totalHidden;
  if (denominator === 0) return null;
  const criticals = deck.filter((c) => c === 'critical_event').length;
  return Math.round((criticals / denominator) * 100);
}

function levelFromOdds(odds: number | null): 'safe' | 'warn' | 'danger' {
  if (odds === null) return 'safe';
  if (odds >= 30) return 'danger';
  if (odds >= 10) return 'warn';
  return 'safe';
}

const LEVEL_COLOR: Record<'safe' | 'warn' | 'danger', string> = {
  safe: '#22c55e',
  warn: '#f59e0b',
  danger: '#ef4444',
};

export function ThreatStrip({
  hand,
  deck,
  hiddenCount = 0,
  serverOverloadOdds,
}: ThreatStripProps) {
  const { t } = useTranslation();
  const defuseCount = useMemo(() => countDefuses(hand), [hand]);
  const clientOdds = useMemo(
    () => computeOverloadOdds(deck, hiddenCount),
    [deck, hiddenCount],
  );
  const fromServer =
    serverOverloadOdds !== undefined && serverOverloadOdds !== null;
  const overloadOdds = fromServer ? (serverOverloadOdds as number) : clientOdds;
  const oddsLevel = levelFromOdds(overloadOdds);
  const noDefuses = defuseCount === 0;

  const shouldPulse = noDefuses || oddsLevel === 'danger';
  const containerStyle: CSSProperties = {
    display: 'inline-grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: 10,
    padding: '6px 14px',
    minWidth: 240,
    borderRadius: 9999,
    background: 'rgba(0,0,0,0.45)',
    border: `1px solid ${shouldPulse ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}`,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  };

  const barTrackStyle: CSSProperties = {
    position: 'relative',
    height: 6,
    minWidth: 80,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  };

  const barFillStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: `${overloadOdds ?? 0}%`,
    background: 'linear-gradient(90deg, #22c55e 0%, #f59e0b 60%, #ef4444 100%)',
    transition: 'width 240ms ease-out',
  };

  const defuseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: noDefuses ? LEVEL_COLOR.danger : LEVEL_COLOR.safe,
    fontVariantNumeric: 'tabular-nums',
  };

  const oddsLabel = overloadOdds === null ? '—' : `${overloadOdds}%`;

  return (
    <div
      data-testid="threat-strip"
      data-level={oddsLevel}
      data-no-defuses={noDefuses ? 'true' : 'false'}
      data-pulse={shouldPulse ? 'true' : 'false'}
      data-odds-source={fromServer ? 'server' : 'client'}
      style={containerStyle}
      aria-label={t('games.table.hud.threat.label')}
    >
      <span
        data-testid="threat-strip-odds"
        style={{ color: LEVEL_COLOR[oddsLevel] }}
        title={t(
          fromServer
            ? 'games.table.hud.threat.oddsTitleServer'
            : 'games.table.hud.threat.oddsTitle',
        )}
      >
        {oddsLabel}
      </span>
      <span style={barTrackStyle} aria-hidden>
        <span style={barFillStyle} />
      </span>
      <span
        data-testid="threat-strip-defuses"
        style={defuseStyle}
        title={t('games.table.hud.threat.defusesTitle')}
      >
        <ShieldIcon size={14} />
        {' '}
        {defuseCount}
      </span>
    </div>
  );
}
