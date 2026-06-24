'use client';

import { useCountUp } from '@/shared/hooks/useCountUp';
import { formatNumber } from '@/shared/i18n/formatters';
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';

interface AnimatedNumberProps {
  value: number;
  locale?: Locale;
  durationMs?: number;
  'data-testid'?: string;
}

/**
 * Renders a number that counts up/down to `value` when it changes (e.g. wallet
 * balance after a purchase, a reward payout). Locale-formatted; snaps on first
 * render and under reduced motion. Thin wrapper over {@link useCountUp}.
 */
export function AnimatedNumber({
  value,
  locale = DEFAULT_LOCALE,
  durationMs,
  'data-testid': testId,
}: AnimatedNumberProps) {
  const current = useCountUp(value, durationMs);
  return <span data-testid={testId}>{formatNumber(current, locale)}</span>;
}
