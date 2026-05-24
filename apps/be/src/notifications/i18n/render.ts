import {
  NOTIFICATIONS_MESSAGES,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from './notifications-messages';

const FALLBACK_LOCALE: SupportedLocale = 'en';
const KEY_PREFIX = 'notifications.';

export function resolveLocale(value: unknown): SupportedLocale {
  if (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  ) {
    return value as SupportedLocale;
  }
  return FALLBACK_LOCALE;
}

/**
 * Looks up `key` in the locale bundle. `key` is a dotted path under
 * `notifications`, e.g. `notifications.daily_reward_ready.title`. Falls
 * back to English if the locale or key is missing. Returns the key
 * itself as a last resort so the user sees *something* instead of empty.
 */
export function renderNotification(
  key: string,
  params: Record<string, unknown>,
  locale: SupportedLocale,
): string {
  const template = lookup(key, locale) ?? lookup(key, FALLBACK_LOCALE) ?? key;
  return interpolate(template, params);
}

function lookup(key: string, locale: SupportedLocale): string | null {
  if (!key.startsWith(KEY_PREFIX)) return null;
  const bundle = NOTIFICATIONS_MESSAGES[locale];
  if (!bundle) return null;
  const path = key.slice(KEY_PREFIX.length).split('.');
  let current: unknown = bundle.notifications;
  for (const segment of path) {
    if (
      current &&
      typeof current === 'object' &&
      segment in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return null;
    }
  }
  return typeof current === 'string' ? current : null;
}

function interpolate(
  template: string,
  params: Record<string, unknown>,
): string {
  return template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, name: string) => {
    const value = params[name];
    if (value === undefined || value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '';
  });
}
