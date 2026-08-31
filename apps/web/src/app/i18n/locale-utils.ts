import { SUPPORTED_LOCALES, Locale } from '@/shared/i18n';
import { LOCALE_SLUGS, type SlugKey } from '@/shared/config/locale-slugs';

export const LOCALIZED_SLUG_TO_KEY: Record<
  Locale,
  Record<string, SlugKey>
> = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [
    locale,
    Object.fromEntries(
      Object.entries(LOCALE_SLUGS[locale]).map(([key, slug]) => [
        slug,
        key as SlugKey,
      ]),
    ),
  ]),
) as Record<Locale, Record<string, SlugKey>>;

export function swapLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0];
  const isLocaleSegment =
    !!currentLocale &&
    (SUPPORTED_LOCALES as readonly string[]).includes(currentLocale);

  if (!isLocaleSegment) {
    return `/${nextLocale}${pathname === '/' ? '' : pathname}`;
  }

  segments[0] = nextLocale;

  const secondSegment = segments[1];
  if (secondSegment) {
    const key = LOCALIZED_SLUG_TO_KEY[currentLocale as Locale]?.[secondSegment];
    if (key) {
      segments[1] = LOCALE_SLUGS[nextLocale][key];
    }
  }

  return '/' + segments.join('/');
}
