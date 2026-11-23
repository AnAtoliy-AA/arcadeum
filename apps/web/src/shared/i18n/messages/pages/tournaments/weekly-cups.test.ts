import { describe, it, expect } from 'vitest';
import { tournamentsEn } from './en';
import { tournamentsRu } from './ru';
import { tournamentsEs } from './es';
import { tournamentsFr } from './fr';
import { tournamentsBy } from './by';

const locales = {
  en: tournamentsEn,
  ru: tournamentsRu,
  es: tournamentsEs,
  fr: tournamentsFr,
  by: tournamentsBy,
};

describe('weeklyCups.checkers i18n', () => {
  const enKeys = Object.keys(tournamentsEn.weeklyCups.checkers).sort();

  it.each(Object.entries(locales))(
    '%s has the same keys as en, all non-empty, no em dash',
    (_locale, messages) => {
      const block = messages.weeklyCups.checkers;
      expect(Object.keys(block).sort()).toEqual(enKeys);
      for (const value of Object.values(block)) {
        expect(value.trim().length).toBeGreaterThan(0);
        expect(value).not.toContain('—');
      }
    },
  );

  it('only overrides keys that exist in the shared banner labels', () => {
    for (const key of enKeys) {
      expect(Object.keys(tournamentsEn.blitzBanner)).toContain(key);
    }
  });
});
