'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { XStack, YStack, Text, styled, useTheme } from 'tamagui';

type ThemeRecord = Record<string, { val?: string; get?: () => string }>;

export type ActivityTickerItem = {
  tag: string;
  who: string;
  what: string;
  when?: string;
  color?: string;
};

export type ActivityTickerProps = {
  items: ActivityTickerItem[];
  interval?: number;
  label?: string;
  pauseOnHover?: boolean;
  'data-testid'?: string;
};

const TickerShell = styled(XStack, {
  name: 'ActivityTicker',
  alignItems: 'center',
  gap: '$3',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$glassBorder',
  backgroundColor: '$glassBg',
  overflow: 'hidden',
});

const TickerLabel = styled(Text, {
  name: 'ActivityTickerLabel',
  fontSize: 11,
  letterSpacing: 1.4,
  color: '$textSecondary',
  textTransform: 'uppercase',
  flexShrink: 0,
  $sm: { display: 'none' },
});

const TickerTrack = styled(YStack, {
  flex: 1,
  height: 22,
  position: 'relative',
});

const TickerRow = styled(XStack, {
  name: 'ActivityTickerRow',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  alignItems: 'center',
  gap: '$3',
  variants: {
    active: {
      true: {
        opacity: 1,
        y: 0,
        pointerEvents: 'auto',
        animation: 'medium',
      },
      false: {
        opacity: 0,
        y: 8,
        pointerEvents: 'none',
        animation: 'medium',
      },
    },
  } as const,
});

// Plain HTML span — Tamagui's runtime emits styled-component output that
// differs between server and client when `style` overrides include shorthand
// props like `borderColor`, which produces hydration mismatches. A plain
// span with inline style hydrates consistently regardless of theme runtime.
const tagBaseStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  padding: '3px 8px',
  borderRadius: 999,
  borderWidth: 1,
  borderStyle: 'solid',
  flexShrink: 0,
  fontFamily: 'inherit',
  lineHeight: 1.2,
};

export function ActivityTicker({
  items,
  interval = 3200,
  label,
  pauseOnHover = true,
  'data-testid': testId,
}: ActivityTickerProps) {
  const theme = useTheme() as unknown as ThemeRecord;
  const colorMain =
    theme.color?.val ?? theme.color?.get?.() ?? '#ecefee';
  const colorMuted =
    theme.textSecondary?.val ??
    theme.textSecondary?.get?.() ??
    '#8e9196';

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (reduced) return;
    }
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length, interval, paused]);

  if (items.length === 0) return null;

  const handleMouseEnter = () => {
    if (pauseOnHover) setPaused(true);
  };
  const handleMouseLeave = () => {
    if (pauseOnHover) setPaused(false);
  };

  return (
    <TickerShell
      aria-live="polite"
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label ? <TickerLabel>{label}</TickerLabel> : null}
      <TickerTrack>
        {items.map((it, i) => {
          const active = i === idx;
          const accent = it.color ?? '#38bdf8';
          return (
            <TickerRow key={`${it.tag}-${i}`} active={active}>
              <span
                style={{
                  ...tagBaseStyle,
                  color: accent,
                  borderColor: accent,
                }}
              >
                {it.tag}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: colorMain,
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                <strong style={{ fontWeight: 700, color: colorMain }}>
                  {it.who}
                </strong>{' '}
                <span style={{ color: colorMuted }}>{it.what}</span>
              </span>
              {it.when ? (
                <span
                  className="ticker-when"
                  style={{
                    fontSize: 12,
                    color: colorMuted,
                    flexShrink: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  {it.when}
                </span>
              ) : null}
            </TickerRow>
          );
        })}
      </TickerTrack>
    </TickerShell>
  );
}

ActivityTicker.displayName = 'ActivityTicker';
