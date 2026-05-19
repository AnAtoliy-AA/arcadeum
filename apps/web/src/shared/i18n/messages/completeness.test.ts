/**
 * Translation completeness audit.
 *
 * Walks the EN bundle, collects every leaf key path, and reports the keys
 * each non-EN locale is missing. The current set of known gaps is
 * snapshotted in `missing-keys.baseline.json` next to this file — a PR
 * that adds an EN-only key will fail the test until either the key is
 * translated or the baseline is regenerated with intent.
 *
 * Regenerate the baseline with:
 *   pnpm vitest run src/shared/i18n/messages/completeness.test.ts -u
 *
 * Hard-failing means we can't ship English-only strings silently. A
 * conscious baseline bump is required to acknowledge a known gap.
 */
import { describe, it, expect } from 'vitest';
import { loadMessages } from './index';
import { SUPPORTED_LOCALES, type Locale } from '../../config/locale-slugs';

type Bundle = Record<string, unknown>;

function isPlainObject(v: unknown): v is Bundle {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function walkKeys(obj: unknown, prefix = ''): string[] {
  if (!isPlainObject(obj)) return prefix ? [prefix] : [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) out.push(...walkKeys(v, path));
    else out.push(path);
  }
  return out;
}

function getAt(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (!isPlainObject(cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

describe('i18n completeness', () => {
  it('every non-EN locale matches the keys present in EN (modulo baseline)', async () => {
    const en = await loadMessages('en');
    // Only require non-empty EN keys. EN values that are deliberately empty
    // (e.g. a stub message intended to render nothing) don't need a
    // translation in other locales.
    const requiredKeys = walkKeys(en).filter((k) => {
      const v = getAt(en, k);
      return typeof v === 'string' && v !== '';
    });

    const report: Record<string, string[]> = {};
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === 'en') continue;
      const bundle = await loadMessages(locale as Locale);
      const missing: string[] = [];
      for (const key of requiredKeys) {
        const v = getAt(bundle, key);
        if (v === undefined || v === '') missing.push(key);
      }
      report[locale] = missing.sort();
    }

    // Snapshot-style assertion: the set of missing keys per locale must
    // match the baseline. Adding an English-only key fails this test
    // until the baseline is regenerated (`-u`) — making the gap a
    // deliberate, reviewed decision rather than silent drift.
    expect(report).toMatchSnapshot();
  });
});
