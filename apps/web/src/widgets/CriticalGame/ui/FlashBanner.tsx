'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { CriticalLogEntry, CriticalLogKind } from '../types';

interface FlashBannerProps {
  logs: CriticalLogEntry[];
  formatMessage: (message?: string | null) => string;
  durationMs?: number;
}

type FlashKind = 'info' | 'danger' | 'defuse' | 'eliminated';

const KIND_TO_FLASH: Record<CriticalLogKind, FlashKind> = {
  eliminated: 'eliminated',
  defuse: 'defuse',
  critical: 'danger',
  play: 'info',
  draw: 'info',
  system: 'info',
};

function classifyMessage(message: string): FlashKind {
  // Fallback path for log entries that don't carry a structured `kind`.
  // String matching is fragile across translations — entries should set
  // `kind` server-side once that contract lands.
  const lower = message.toLowerCase();
  if (lower.includes('eliminat')) return 'eliminated';
  if (lower.includes('defus') || lower.includes('neutraliz')) return 'defuse';
  if (
    lower.includes('critical_event') ||
    lower.includes('critical card') ||
    lower.includes('critical event')
  ) {
    return 'danger';
  }
  return 'info';
}

function classifyEntry(entry: CriticalLogEntry): FlashKind {
  if (entry.kind && entry.kind in KIND_TO_FLASH) {
    return KIND_TO_FLASH[entry.kind];
  }
  return classifyMessage(entry.message ?? '');
}

const KIND_COLORS: Record<
  FlashKind,
  { fg: string; bg: string; border: string }
> = {
  info: {
    fg: '#e2e8f0',
    bg: 'rgba(15,23,42,0.85)',
    border: 'rgba(255,255,255,0.16)',
  },
  defuse: { fg: '#0b0b0b', bg: '#34d399', border: '#10b981' },
  danger: { fg: '#0b0b0b', bg: '#f59e0b', border: '#d97706' },
  eliminated: { fg: '#fff', bg: '#ef4444', border: '#b91c1c' },
};

function pickLatestActionLog(
  logs: CriticalLogEntry[],
): CriticalLogEntry | null {
  for (let i = logs.length - 1; i >= 0; i -= 1) {
    const entry = logs[i];
    if (entry.type === 'action' || entry.type === 'system') return entry;
  }
  return null;
}

export function FlashBanner({
  logs,
  formatMessage,
  durationMs = 1600,
}: FlashBannerProps) {
  const latest = pickLatestActionLog(logs);
  const latestId = latest?.id ?? null;
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    if (!latestId) return;
    if (latestId === dismissedId) return;
    const timer = setTimeout(() => setDismissedId(latestId), durationMs);
    return () => clearTimeout(timer);
  }, [latestId, dismissedId, durationMs]);

  if (!latest || dismissedId === latest.id) return null;
  const text = formatMessage(latest.message).trim();
  if (!text) return null;
  const kind = classifyEntry(latest);
  const palette = KIND_COLORS[kind];

  // The banner owns its own centered wrapper so MatchHud doesn't need to
  // reserve an empty slot when nothing is flashing.
  const wrapperStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 4,
  };

  const pillStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: 9999,
    background: palette.bg,
    color: palette.fg,
    border: `1px solid ${palette.border}`,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.4,
    maxWidth: 360,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
    animation: 'flashBannerIn 200ms ease-out',
  };

  return (
    <div style={wrapperStyle}>
      <div
        data-testid="flash-banner"
        data-kind={kind}
        role="status"
        aria-live="polite"
        title={text}
        style={pillStyle}
      >
        {text}
      </div>
    </div>
  );
}
