import { en } from './notifications/en';
import { ru } from './notifications/ru';
import { es } from './notifications/es';
import { fr } from './notifications/fr';
import { by } from './notifications/by';
import type { DeepPartial } from '../base-types';

export { en, ru, es, fr, by };

export type NotificationsMessages = DeepPartial<typeof en>;

export const notificationsMessages = {
  en,
  ru,
  es,
  fr,
  by,
} as const;
