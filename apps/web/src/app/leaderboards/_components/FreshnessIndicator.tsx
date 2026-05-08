'use client';
import { useEffect, useState } from 'react';
import { XStack, Text, View } from 'tamagui';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const STALE_MS = 30_000;
const LIVE_PULSE_MS = 2_000;
const PULSE_STYLE_ID = '__arcadeum-freshness-pulse';
const PULSE_KEYFRAMES = `
@keyframes arcadeum-freshness-pulse {
  0% { box-shadow: 0 0 0 0 rgba(52,211,153,0.6); }
  100% { box-shadow: 0 0 0 10px rgba(52,211,153,0); }
}
`;

if (
  typeof document !== 'undefined' &&
  !document.getElementById(PULSE_STYLE_ID)
) {
  const styleEl = document.createElement('style');
  styleEl.id = PULSE_STYLE_ID;
  styleEl.textContent = PULSE_KEYFRAMES;
  document.head.appendChild(styleEl);
}

function formatAgo(deltaMs: number, t?: PageTranslations): string {
  const tt = (t?.freshness ?? {}) as Record<string, string | undefined>;
  if (deltaMs < 5_000) return tt.justNow ?? 'just now';
  if (deltaMs < 60_000) {
    return (tt.secondsAgo ?? '{n}s ago').replace(
      '{n}',
      String(Math.round(deltaMs / 1000)),
    );
  }
  if (deltaMs < 3_600_000) {
    return (tt.minutesAgo ?? '{n}m ago').replace(
      '{n}',
      String(Math.round(deltaMs / 60_000)),
    );
  }
  return (tt.hoursAgo ?? '{n}h ago').replace(
    '{n}',
    String(Math.round(deltaMs / 3_600_000)),
  );
}

export function FreshnessIndicator({
  capturedAt,
  pulseKey,
  t,
}: {
  capturedAt?: string;
  pulseKey: number;
  t?: PageTranslations;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (pulseKey === 0) return;
    const on = setTimeout(() => setPulse(true), 0);
    const off = setTimeout(() => setPulse(false), LIVE_PULSE_MS);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [pulseKey]);

  if (!capturedAt) return null;
  const captured = new Date(capturedAt).getTime();
  const delta = Math.max(0, now - captured);
  const stale = delta > STALE_MS && !pulse;
  const tt = (t?.freshness ?? {}) as Record<string, string | undefined>;
  const updatedLabel = (tt.updatedAt ?? 'Updated {ago}').replace(
    '{ago}',
    formatAgo(delta, t),
  );

  return (
    <XStack
      alignItems="center"
      gap="$2"
      testID="leaderboard-freshness"
      data-fresh={!stale}
    >
      <View
        width={8}
        height={8}
        borderRadius={4}
        backgroundColor={stale ? '$textSecondary' : '$success'}
        style={
          pulse
            ? {
                animation: 'arcadeum-freshness-pulse 2s ease-out',
              }
            : undefined
        }
      />
      <Text fontSize="$1" letterSpacing={1} opacity={0.7}>
        {updatedLabel}
      </Text>
    </XStack>
  );
}
