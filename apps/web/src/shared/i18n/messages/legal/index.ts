import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ru } from './ru';
import { by } from './by';

export { en, es, fr, ru, by };

export type {
  LegalMessages,
  TermsMessages,
  PrivacyMessages,
  ContactMessages,
} from './types';

export const legalMessages = {
  en,
  es,
  fr,
  ru,
  by,
} as const;
