import { interpolate } from '@arcadeum/games-core';
import { streamEn } from '@/shared/i18n/messages/pages/stream/en';

/** Real English strings, `{{param}}` interpolation: mirrors `useTranslation`. */
export function testT(
  key: string,
  params?: Record<string, string | number>,
): string {
  const parts = key.split('.');
  let cur: unknown = { pages: { stream: streamEn } };
  for (const p of parts) {
    if (typeof cur === 'object' && cur !== null && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return key;
    }
  }
  return typeof cur === 'string' ? interpolate(cur, params ?? {}) : key;
}
