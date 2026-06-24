'use client';

import { useSoundContext } from './SoundProvider';
import type { SoundId } from './sound-manifest';

const NOOP = () => {};

/**
 * Access the app sound layer. Returns a `play(id)` function that respects the
 * user's mute setting. Falls back to a no-op when rendered outside a
 * `SoundProvider` (e.g. isolated component tests), so callers never need to
 * guard.
 */
export function useSound(): { play: (id: SoundId) => void } {
  const ctx = useSoundContext();
  return ctx ?? { play: NOOP };
}
