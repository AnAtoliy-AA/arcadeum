import type { DeepPartial } from '../../base-types';
import { en, type SeoMessages as SeoMessagesEn } from './en';
import { es } from './es';
import { fr } from './fr';
import { ru } from './ru';
import { by } from './by';

export { en, es, fr, ru, by };

export const seoMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;

export type SeoMessages = DeepPartial<SeoMessagesEn>;
