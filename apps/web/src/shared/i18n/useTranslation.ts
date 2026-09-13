import { interpolate } from '@arcadeum/games-core';
import { useLanguage } from './useLanguage';
import type { EnglishTranslations } from './messages';
import type { StringPaths } from './translation-paths';

/**
 * Type-safe translation key - inferred from actual English translations
 * This ensures all keys are based on the concrete implementation
 */
export type TranslationKey = StringPaths<EnglishTranslations>;

/**
 * Checks if we're in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logs a warning in development mode when a translation is missing
 */
function warnMissingTranslation(key: TranslationKey, locale: string): void {
  if (isDevelopment) {
    console.warn(
      `[Translation] Missing translation for key "${key}" in locale "${locale}". Falling back to key.`,
    );
  }
}

/**
 * Hook for accessing translations with type-safe keys
 * @example
 * const { t } = useTranslation();
 * t("common.actions.login") // ✅ Valid
 * t("common.invalid.key") // ❌ TypeScript error
 */
export function useTranslation() {
  const { messages, locale } = useLanguage();

  /**
   * Translates a key to its localized string value
   * @param key - Dot-separated path to translation (type-checked)
   * @param params - Optional parameters for string interpolation
   * @returns Translated string or key if not found
   */
  const t = (
    key: TranslationKey,
    params?: Record<string, string | number>,
  ): string => {
    const keys = key.split('.');
    let value: unknown = messages;

    // Navigate through the translation object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Translation not found - warn in development and return key
        warnMissingTranslation(key, locale || 'unknown');
        return key;
      }
    }

    // If we found a string value, interpolate parameters if provided
    if (typeof value === 'string') {
      if (params && Object.keys(params).length > 0) {
        const result = interpolate(value, params);

        if (isDevelopment) {
          // Warn about unused parameters
          const usedParams = new Set<string>();
          for (const k of Object.keys(params)) {
            if (value.includes(`{{${k}}}`)) {
              usedParams.add(k);
            }
          }
          const unusedParams = Object.keys(params).filter(
            (k) => !usedParams.has(k),
          );
          if (unusedParams.length > 0) {
            console.warn(
              `[Translation] Unused parameters provided: ${unusedParams.join(', ')}`,
            );
          }

          // Warn about missing placeholders
          const missingPlaceholders = result.match(/\{\{[^}]+\}\}/g);
          if (missingPlaceholders) {
            const uniqueMissing = [...new Set(missingPlaceholders)];
            console.warn(
              `[Translation] Missing parameter values for placeholders: ${uniqueMissing.join(', ')}`,
            );
          }
        }

        return result;
      }
      return value;
    }

    // Value exists but is not a string (shouldn't happen with type safety, but defensive)
    warnMissingTranslation(key, locale || 'unknown');
    return key;
  };

  return { t };
}
