import { by } from './pages/by';
import { en } from './pages/en';
import { es } from './pages/es';
import { fr } from './pages/fr';
import { ru } from './pages/ru';
import type { DeepPartial } from '../base-types';

export { en, es, fr, ru, by };

/** Derived type with DeepPartial wrapper for backward compatibility */
export type PagesMessages = DeepPartial<typeof en>;

export const pagesMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;
