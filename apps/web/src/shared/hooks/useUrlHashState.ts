'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseUrlHashStateOptions<T> {
  /**
   * Encode the value for the URL hash. Return `null` to remove the key
   * entirely (keeps the hash clean for empty/default states).
   */
  serialize: (value: T) => string | null;
  /** Decode the raw value from the hash; receives `null` when absent. */
  deserialize: (raw: string | null) => T;
}

function parseHash(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  const raw = window.location.hash;
  return new URLSearchParams(raw.startsWith('#') ? raw.slice(1) : raw);
}

function writeHash(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  const params = parseHash();
  const current = params.get(key);
  if (value === null) {
    if (current === null) return;
    params.delete(key);
  } else {
    if (current === value) return;
    params.set(key, value);
  }
  const str = params.toString();
  const newHash = str ? `#${str}` : '';
  const { pathname, search } = window.location;
  // `replaceState` so the URL bar updates without polluting browser
  // history — every selection toggle would otherwise add an entry the
  // user'd have to click Back through.
  window.history.replaceState(null, '', `${pathname}${search}${newHash}`);
}

/**
 * Persist a piece of UI state in the URL hash so that:
 *
 *  - refresh restores it,
 *  - copy/share-link round-trips it,
 *  - browser Back/Forward + manual edits resync it via `hashchange`.
 *
 * The codec is caller-supplied so the URL stays readable (e.g.
 * comma-separated ids instead of percent-encoded JSON). Return `null`
 * from `serialize` for the default/empty case to keep the hash clean.
 *
 * Multiple keys coexist — internally the hash is parsed as
 * `URLSearchParams`, so each key reads/writes independently and won't
 * clobber siblings (`#sel=a,b&tab=hand`).
 *
 * Uses `history.replaceState` rather than pushing a new entry so rapid
 * toggles don't flood the browser back-stack.
 */
export function useUrlHashState<T>(
  key: string,
  initial: T,
  options: UseUrlHashStateOptions<T>,
): [T, (next: T | ((prev: T) => T)) => void] {
  // Callers should pass module-level constants for `serialize` /
  // `deserialize` (or memoize them) so the dep arrays below stay stable
  // across renders. Passing inline lambdas works but re-creates the
  // `update` setter every render — fine for correctness, just wasted
  // referential churn.
  const { serialize, deserialize } = options;

  const readFromHash = useCallback((): T => {
    if (typeof window === 'undefined') return initial;
    return deserialize(parseHash().get(key));
    // `initial` is captured at first call; subsequent reads come from the hash.
  }, [key, initial, deserialize]);

  const [value, setValue] = useState<T>(readFromHash);

  // Resync on external hash changes (Back/Forward, address-bar edit,
  // links). Only this hook can write its own key so we don't loop.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setValue(readFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, [readFromHash]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
        writeHash(key, serialize(resolved));
        return resolved;
      });
    },
    [key, serialize],
  );

  return [value, update];
}
