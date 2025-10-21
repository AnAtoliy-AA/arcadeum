import type { LanguagePreference } from '@/stores/settings';

export type TranslationTree = {
  [key: string]: string | TranslationTree;
};

export type TranslationMap = Record<LanguagePreference, TranslationTree>;

export type Replacements = Record<string, string | number> | undefined;

export type TranslationLeafPaths<T, Prefix extends string = ''> = {
  [K in Extract<keyof T, string>]: T[K] extends string
    ? `${Prefix}${K}`
    : `${Prefix}${K}` | TranslationLeafPaths<T[K], `${Prefix}${K}.`>;
}[Extract<keyof T, string>];
