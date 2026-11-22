import { describe, expect, it } from 'vitest';
import * as companion from './arcade-pet-companion';
import { byMessages } from './games/arcade-pet/by';
import { enMessages } from './games/arcade-pet/en';
import { esMessages } from './games/arcade-pet/es';
import { frMessages } from './games/arcade-pet/fr';
import { ruMessages } from './games/arcade-pet/ru';

/** Dot-paths of every string leaf, so nested objects are compared too. */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

const EM_DASH = '—';

function leafValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(leafValues);
}

const suites = [
  {
    name: 'arcadePetCompanion',
    en: companion.en,
    others: {
      es: companion.es,
      fr: companion.fr,
      ru: companion.ru,
      by: companion.by,
    },
  },
  {
    name: 'games.arcade_pet_v1',
    en: enMessages,
    others: {
      es: esMessages,
      fr: frMessages,
      ru: ruMessages,
      by: byMessages,
    },
  },
];

describe.each(suites)('$name locale parity', ({ en, others }) => {
  const enKeys = leafPaths(en).sort();

  it.each(Object.entries(others))('%s has exactly the en keys', (_l, msgs) => {
    expect(leafPaths(msgs).sort()).toEqual(enKeys);
  });

  it.each(Object.entries({ en, ...others }))(
    '%s copy has no empty strings or em dashes',
    (_l, msgs) => {
      for (const text of leafValues(msgs)) {
        expect(text.trim()).not.toBe('');
        expect(text).not.toContain(EM_DASH);
      }
    },
  );
});
