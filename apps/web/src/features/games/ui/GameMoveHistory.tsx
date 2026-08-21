'use client';

import type { CSSProperties } from 'react';

/**
 * Minimal log-entry shape shared across game widgets. Structurally compatible
 * with `CriticalLogEntry` and per-game `*LogEntry` types (extra optional
 * fields are fine — extra keys are allowed).
 */
export interface GameLogEntry {
  id: string;
  type: string;
  message?: string | null;
  createdAt?: string | number | null;
  senderId?: string | null;
  senderName?: string | null;
}

export interface GameMoveHistoryProps {
  logs: GameLogEntry[];
  /** Renders a log entry's raw message into display text. */
  formatMessage: (message?: string | null) => string;
  /**
   * Resolves a `senderId` to its display name. Optional because system
   * entries have no sender; when missing we fall back to the log entry's own
   * `senderName` field.
   */
  resolveDisplayName?: (playerId: string, fallback: string) => string;
  /** Max rows to keep in the strip. Defaults to 5. */
  limit?: number;
}

const wrapperStyle: CSSProperties = {
  width: '100%',
  maxWidth: 360,
  margin: '4px auto 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.3px',
  color: 'rgba(226,232,240,0.7)',
  // The wrapper itself stays passthrough so clicks fall through to the
  // arena underneath. Individual rows re-enable pointer events below so
  // the native `title` tooltip on truncated text actually fires —
  // `pointer-events: none` was previously inherited and killed the
  // hover that triggers the tooltip.
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
  pointerEvents: 'auto',
};

const timeStyle: CSSProperties = {
  flexShrink: 0,
  opacity: 0.55,
  minWidth: 32,
  textAlign: 'right',
};

const actorStyle: CSSProperties = {
  flexShrink: 0,
  maxWidth: 96,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: 'rgba(226,232,240,0.95)',
  fontWeight: 700,
};

const textStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

/**
 * Shared last-N timeline strip for action/system log entries, rendered as a
 * compact scrollable history with relative timestamps and actor names. Game
 * widgets mount this beneath their board/arena to recap recent moves without
 * opening the full game log. Action-typed entries only — chat / lobby noise
 * stays out so the strip reads as game telemetry rather than feed.
 */
export function GameMoveHistory({
  logs,
  formatMessage,
  resolveDisplayName,
  limit = 5,
}: GameMoveHistoryProps) {
  const entries = logs
    .filter((entry) => entry.type === 'action' || entry.type === 'system')
    .slice(-limit)
    .reverse();

  if (entries.length === 0) return null;

  return (
    <div
      data-testid="game-move-history"
      role="log"
      aria-live="off"
      aria-label="Recent match events"
      style={wrapperStyle}
    >
      {entries.map((entry, idx) => {
        const text = formatMessage(entry.message).trim();
        if (!text) return null;
        const actor = resolveActor(entry, resolveDisplayName);
        return (
          // `${entry.id}-${idx}` defends against the rare case where the
          // server snapshot yields two entries with the same `id`
          // (optimistic + authoritative double-tick, replay buffer
          // churn). React would otherwise warn and reuse rows wrong.
          <div
            key={`${entry.id}-${idx}`}
            data-testid="game-move-history-row"
            data-entry-id={entry.id}
            data-actor={actor || undefined}
            style={rowStyle}
          >
            <span style={timeStyle}>{formatTimestamp(entry.createdAt)}</span>
            {actor && (
              <span
                data-testid="game-move-history-actor"
                style={actorStyle}
                title={actor}
              >
                {actor}
              </span>
            )}
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
 * Resolve the visible actor name for a row. Prefers the resolver
 * (so renamed players display their fresh name), falls back to the
 * `senderName` snapshot the log entry was tagged with at write time,
 * and finally to empty when neither is available (system entries with
 * no actor).
 */
function resolveActor(
  entry: GameLogEntry,
  resolveDisplayName?: (playerId: string, fallback: string) => string,
): string {
  if (entry.senderId && resolveDisplayName) {
    const resolved = resolveDisplayName(entry.senderId, entry.senderName ?? '');
    if (resolved) return resolved;
  }
  return entry.senderName ?? '';
}

/**
 * Render `createdAt` as a compact `HH:MM` string. Falls back to an
 * empty timestamp slot when the log entry pre-dates the createdAt
 * field, so layout stays stable.
 */
function formatTimestamp(
  createdAt: string | number | null | undefined,
): string {
  if (createdAt == null) return '';
  const ts = typeof createdAt === 'string' ? Date.parse(createdAt) : createdAt;
  if (!Number.isFinite(ts)) return '';
  const date = new Date(ts);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
