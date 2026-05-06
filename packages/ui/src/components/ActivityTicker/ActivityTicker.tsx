'use client';

import { useEffect, useRef, useState } from 'react';
import { XStack, YStack, Text, styled } from 'tamagui';

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

const TickerTag = styled(Text, {
  name: 'ActivityTickerTag',
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
  borderWidth: 1,
  flexShrink: 0,
});

export function ActivityTicker({
  items,
  interval = 3200,
  label,
  pauseOnHover = true,
  'data-testid': testId,
}: ActivityTickerProps) {
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
              <TickerTag style={{ color: accent, borderColor: accent }}>
                {it.tag}
              </TickerTag>
              <Text
                fontSize={13}
                color="$color"
                flex={1}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                <Text fontWeight="700" color="$color">
                  {it.who}
                </Text>{' '}
                <Text color="$textSecondary">{it.what}</Text>
              </Text>
              {it.when ? (
                <Text
                  fontSize={12}
                  color="$textSecondary"
                  flexShrink={0}
                  $sm={{ display: 'none' }}
                >
                  {it.when}
                </Text>
              ) : null}
            </TickerRow>
          );
        })}
      </TickerTrack>
    </TickerShell>
  );
}

ActivityTicker.displayName = 'ActivityTicker';
