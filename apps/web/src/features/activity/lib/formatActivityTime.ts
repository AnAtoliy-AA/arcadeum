/** Map app locale codes to BCP 47 tags understood by Intl. */
export function toIntlLocale(locale: string | undefined): string {
  if (locale === 'by') return 'be';
  return locale || 'en';
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/**
 * Short localized relative time ("5 min ago"). Anything under a minute is
 * "now"; older than a week falls back to a short date.
 */
export function formatRelativeTime(
  timestamp: string,
  locale: string | undefined,
  now: number = Date.now(),
): string {
  const tag = toIntlLocale(locale);
  const then = Date.parse(timestamp);
  if (Number.isNaN(then)) return '';
  const diffSec = Math.max(0, Math.round((now - then) / 1000));
  const rtf = new Intl.RelativeTimeFormat(tag, {
    numeric: 'auto',
    style: 'short',
  });
  if (diffSec < 60) return rtf.format(0, 'second');
  if (diffSec >= 7 * 86_400) {
    return new Intl.DateTimeFormat(tag, {
      day: 'numeric',
      month: 'short',
    }).format(then);
  }
  for (const [unit, size] of UNITS) {
    if (diffSec >= size) return rtf.format(-Math.floor(diffSec / size), unit);
  }
  return rtf.format(0, 'second');
}

/** Full date and time for the hover title / datetime tooltip. */
export function formatAbsoluteTime(
  timestamp: string,
  locale: string | undefined,
): string {
  const then = Date.parse(timestamp);
  if (Number.isNaN(then)) return '';
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(then);
}

/** Signed rating delta: "+12", "-8", "±0". */
export function formatRatingDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `−${Math.abs(delta)}`;
  return '±0';
}

/** "3 - 1" or "120 - 85 - 40" with the actor's score first. */
export function formatScore(score: {
  actor: number;
  opponents: number[];
}): string {
  return [score.actor, ...score.opponents].join(' - ');
}
