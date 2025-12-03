import type { TranslationKey } from '@/lib/i18n/messages';

export interface ApiMessageDescriptor {
  code: number;
  translationKey: TranslationKey;
  fallbackMessage: string;
  aliases?: string[];
}
