import { enMessages as en } from './en';
import { esMessages as es } from './es';
import { frMessages as fr } from './fr';
import { ruMessages as ru } from './ru';
import { byMessages as by } from './by';

export { en, es, fr, ru, by };

export type CascadeMessages = typeof en;

export const cascadeMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;
