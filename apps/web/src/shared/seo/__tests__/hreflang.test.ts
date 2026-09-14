import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { buildPageMetadata, type SeoPageKey } from '../buildPageMetadata';
import { appConfig } from '@/shared/config/app-config';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  localeToHreflang,
  type Locale,
} from '@/shared/i18n';

describe('Hreflang & Canonical URL Integrity', () => {
  it('sitemap generates reciprocal hreflang links across all supported locales', () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(0);

    const urlMap = new Map<string, Record<string, string>>();

    for (const entry of entries) {
      expect(entry.url).toMatch(/^https?:\/\//);
      expect(entry.alternates?.languages).toBeDefined();

      const languages = entry.alternates?.languages as Record<string, string>;
      expect(languages['x-default']).toBeDefined();
      expect(languages[localeToHreflang(DEFAULT_LOCALE)]).toBe(
        languages['x-default'],
      );

      const isBlog = entry.url.includes('/blog/');
      if (!isBlog) {
        for (const locale of SUPPORTED_LOCALES) {
          const hreflang = localeToHreflang(locale);
          expect(languages[hreflang]).toBeDefined();
          expect(languages[hreflang]).toMatch(new RegExp(`/${locale}(/|$)`));
        }
      }

      urlMap.set(entry.url, languages);
    }

    for (const [url, languages] of urlMap.entries()) {
      for (const [langKey, targetUrl] of Object.entries(languages)) {
        if (langKey === 'x-default') continue;
        const targetLanguages = urlMap.get(targetUrl);
        expect(
          targetLanguages,
          `Reciprocal URL missing in sitemap: ${targetUrl} (referenced by ${url})`,
        ).toBeDefined();

        if (targetLanguages) {
          expect(targetLanguages[localeToHreflang(DEFAULT_LOCALE)]).toBe(
            languages[localeToHreflang(DEFAULT_LOCALE)],
          );
        }
      }
    }
  });

  const SAMPLE_PAGES: SeoPageKey[] = [
    'home',
    'games',
    'chessLanding',
    'seaBattleLanding',
    'battleshipLanding',
    'criticalLanding',
    'glimwormLanding',
    'backgammonLanding',
    'checkersLanding',
    'solitaireLanding',
  ];

  for (const pageKey of SAMPLE_PAGES) {
    it(`buildPageMetadata emits valid canonical and alternates for ${pageKey}`, async () => {
      for (const locale of SUPPORTED_LOCALES) {
        const meta = await buildPageMetadata({
          locale: locale as Locale,
          page: pageKey,
        });

        const canonical = meta.alternates?.canonical;
        expect(canonical).toBeDefined();
        expect(typeof canonical === 'string' ? canonical : '').toContain(
          `${appConfig.siteUrl}/${locale}`,
        );

        const languages = meta.alternates?.languages as Record<string, string>;
        expect(languages).toBeDefined();
        expect(languages['x-default']).toBeDefined();
        expect(languages[localeToHreflang(DEFAULT_LOCALE)]).toBe(
          languages['x-default'],
        );

        for (const targetLocale of SUPPORTED_LOCALES) {
          const hreflang = localeToHreflang(targetLocale);
          expect(languages[hreflang]).toBeDefined();
          expect(languages[hreflang]).toContain(
            `${appConfig.siteUrl}/${targetLocale}`,
          );
        }
      }
    });
  }
});
