import type { TranslationKey } from '@/lib/i18n/messages';

export interface GlobalErrorPayload {
  translationKey?: TranslationKey;
  fallbackMessage?: string;
  rawMessage?: string;
  replacements?: Record<string, string | number>;
  duration?: number;
}

type ErrorHandler = (payload: GlobalErrorPayload) => void;

let handler: ErrorHandler | undefined;

export function registerGlobalErrorHandler(fn: ErrorHandler) {
  handler = fn;
}

export function unregisterGlobalErrorHandler(fn: ErrorHandler) {
  if (handler === fn) {
    handler = undefined;
  }
}

export function emitGlobalError(payload: GlobalErrorPayload) {
  handler?.(payload);
}
