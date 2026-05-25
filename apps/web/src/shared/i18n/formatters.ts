/**
 * Locale-aware Intl formatters. Use these instead of bare
 * `Number.prototype.toLocaleString()` / `Date.prototype.toLocaleString()`
 * — those use the *browser's* locale, not the user-selected app locale,
 * so they render fr_FR digit grouping for an EN user (and vice versa).
 *
 * BCP-47 mapping mirrors `SCHEMA_LANGUAGE_MAP` in [locale]/layout.tsx —
 * keep them in sync.
 */
import { DEFAULT_LOCALE, type Locale } from '@/shared/config/locale-slugs';

const BCP47: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  ru: 'ru-RU',
  by: 'be-BY',
};

function bcp47(locale: Locale | string | undefined): string {
  if (!locale) return BCP47[DEFAULT_LOCALE];
  return BCP47[locale as Locale] ?? locale;
}

function toDate(value: Date | string | number | undefined | null): Date | null {
  if (value === undefined || value === null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(bcp47(locale), options).format(value);
}

export function formatCurrency(
  value: number,
  locale: Locale,
  currency: string,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(bcp47(locale), {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}

export function formatDate(
  value: Date | string | number | undefined | null,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  fallback = '',
): string {
  const d = toDate(value);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(bcp47(locale), options).format(d);
}

export function formatTime(
  value: Date | string | number | undefined | null,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
  fallback = '',
): string {
  const d = toDate(value);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(bcp47(locale), options).format(d);
}

export function formatDateTime(
  value: Date | string | number | undefined | null,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  },
  fallback = '',
): string {
  const d = toDate(value);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(bcp47(locale), options).format(d);
}

const RELATIVE_THRESHOLDS: Array<{
  unit: Intl.RelativeTimeFormatUnit;
  ms: number;
}> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
];

export function formatRelative(
  value: Date | string | number | undefined | null,
  locale: Locale,
  now: Date = new Date(),
  fallback = '',
): string {
  const d = toDate(value);
  if (!d) return fallback;
  const diffMs = d.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(bcp47(locale), { numeric: 'auto' });
  for (const { unit, ms } of RELATIVE_THRESHOLDS) {
    if (abs >= ms || unit === 'second') {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return rtf.format(0, 'second');
}
