import { interpolate } from '@arcadeum/games-core';
import { en } from '@/shared/i18n/messages/arcade-pet-companion';

/** English-resolving stand-in for useTranslation in arcade-pet component tests. */
export function mockUseTranslation() {
  return {
    t: (key: string, params?: Record<string, string | number>): string => {
      const name = key.replace(/^arcadePetCompanion\./, '');
      const value = (en as Record<string, string>)[name];
      if (typeof value !== 'string') return key;
      return params ? interpolate(value, params) : value;
    },
  };
}
