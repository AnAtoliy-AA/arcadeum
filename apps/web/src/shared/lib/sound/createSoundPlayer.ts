import { SOUNDS, type SoundId } from './sound-manifest';

/**
 * Minimal slice of HTMLAudioElement we depend on. Kept as an interface so the
 * player is unit-testable with an injected factory (jsdom does not implement
 * media playback).
 */
export type AudioLike = {
  currentTime: number;
  preload?: string;
  play: () => Promise<void> | void;
  load?: () => void;
};

export type AudioFactory = (src: string) => AudioLike;

const defaultFactory: AudioFactory = (src) => new Audio(src);

export type SoundPlayer = {
  /** Warm the browser cache so the first real play has no fetch latency. */
  preloadAll: () => void;
  /** Play a sound. No-ops when `enabled` is false or audio is unavailable. */
  play: (id: SoundId, enabled: boolean) => void;
};

/**
 * Framework-agnostic SFX player. Lazily creates and caches one audio element
 * per sound id. All playback errors (autoplay policy, decode failures) are
 * swallowed — sound is non-essential and must never break the UI.
 */
export function createSoundPlayer(
  factory: AudioFactory = defaultFactory,
): SoundPlayer {
  const cache = new Map<SoundId, AudioLike>();

  const get = (id: SoundId): AudioLike | null => {
    if (typeof window === 'undefined') return null;
    let audio = cache.get(id);
    if (!audio) {
      audio = factory(SOUNDS[id]);
      cache.set(id, audio);
    }
    return audio;
  };

  return {
    preloadAll() {
      (Object.keys(SOUNDS) as SoundId[]).forEach((id) => {
        const audio = get(id);
        if (!audio) return;
        audio.preload = 'auto';
        audio.load?.();
      });
    },
    play(id, enabled) {
      if (!enabled) return;
      const audio = get(id);
      if (!audio) return;
      try {
        audio.currentTime = 0;
        const result = audio.play();
        if (result && typeof (result as Promise<void>).catch === 'function') {
          (result as Promise<void>).catch(() => {});
        }
      } catch {
        // ignore playback errors — audio is best-effort
      }
    },
  };
}
