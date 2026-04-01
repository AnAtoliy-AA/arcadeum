import type { DeepPartial, Locale } from '../types';
import { by } from './pages/by';
import { en } from './pages/en';
import { es } from './pages/es';
import { fr } from './pages/fr';
import { ru } from './pages/ru';

const pagesMessagesDefinition = {
  en,
  es,
  fr,
  ru,
  by,
};

export type PagesMessages = DeepPartial<
  (typeof pagesMessagesDefinition)[typeof import('../types').DEFAULT_LOCALE]
>;

type PagesMessagesWithLocale = {
  [K in Locale]: PagesMessages;
};

export const pagesMessages: PagesMessagesWithLocale = pagesMessagesDefinition;
