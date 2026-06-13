import type { DeepPartial } from '../../base-types';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ru } from './ru';
import { by } from './by';

export { en, es, fr, ru, by };

export const homeMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;

/** Derived type with Partial wrapper for backward compatibility */
export type HomeMessages = DeepPartial<typeof en>;
