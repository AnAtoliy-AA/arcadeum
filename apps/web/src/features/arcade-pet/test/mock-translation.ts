import { interpolate } from '@arcadeum/games-core';
import { en } from '@/shared/i18n/messages/arcade-pet-companion';

function lookup(path: string): string | null {
  let value: unknown = en;
  for (const part of path.split('.')) {
    if (typeof value !== 'object' || value === null || !(part in value)) {
      return null;
    }
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string' ? value : null;
}

/** English-resolving stand-in for useTranslation in arcade-pet component tests. */
export function mockUseTranslation() {
  return {
    t: (key: string, params?: Record<string, string | number>): string => {
      const value = lookup(key.replace(/^arcadePetCompanion\./, ''));
      if (value === null) return key;
      return params ? interpolate(value, params) : value;
    },
  };
}
