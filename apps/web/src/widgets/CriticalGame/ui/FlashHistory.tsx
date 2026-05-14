'use client';

import type { CSSProperties } from 'react';
import type { CriticalLogEntry } from '../types';

interface FlashHistoryProps {
  logs: CriticalLogEntry[];
  formatMessage: (message?: string | null) => string;
  /** Max rows to keep in the strip. Defaults to 5 (the spec from §4.7). */
  limit?: number;
}

/**
 * §4.7 — last-N timeline strip mounted beneath `FlashBanner`. The
 * banner is single-shot (1.6s) so power users miss the message if they
 * were looking at their hand. This strip surfaces a scrollable history
 * of the last few action / system entries with relative timestamps,
 * giving the player a quick recap without opening the full game log.
 *
 * Action-typed entries only — chat / lobby noise stays out so the
 * strip reads as game telemetry rather than feed.
 */
export function FlashHistory({
  logs,
  formatMessage,
  limit = 5,
}: FlashHistoryProps) {
  const entries = logs
    .filter((entry) => entry.type === 'action' || entry.type === 'system')
    .slice(-limit)
    .reverse();

  if (entries.length === 0) return null;

  const wrapperStyle: CSSProperties = {
    width: '100%',
    maxWidth: 360,
    margin: '4px auto 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: 'rgba(226,232,240,0.7)',
    pointerEvents: 'none',
  };

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 6,
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.05)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  };

  const timeStyle: CSSProperties = {
    flexShrink: 0,
    opacity: 0.55,
    minWidth: 32,
    textAlign: 'right',
  };

  const textStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div
      data-testid="flash-history"
      role="log"
      aria-live="off"
      aria-label="Recent match events"
      style={wrapperStyle}
    >
      {entries.map((entry) => {
        const text = formatMessage(entry.message).trim();
        if (!text) return null;
        return (
          <div
            key={entry.id}
            data-testid="flash-history-row"
            data-entry-id={entry.id}
            style={rowStyle}
          >
            <span style={timeStyle}>{formatTimestamp(entry.createdAt)}</span>
            <span style={textStyle} title={text}>
              {text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render `createdAt` as a compact `HH:MM` string. Falls back to an
 * empty timestamp slot when the log entry pre-dates the createdAt
 * field, so layout stays stable.
 */
function formatTimestamp(createdAt: number | string | undefined): string {
  if (createdAt == null) return '';
  const ts = typeof createdAt === 'string' ? Date.parse(createdAt) : createdAt;
  if (!Number.isFinite(ts)) return '';
  const date = new Date(ts);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
