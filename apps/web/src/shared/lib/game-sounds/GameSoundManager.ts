import type { GameSoundId, GameSoundEntry } from './gameSoundTypes';
import { getSoundEntry } from './gameSoundRegistry';

class GameSoundManager {
  private audioContext: AudioContext | null = null;
  private buffers: Map<GameSoundId, AudioBuffer> = new Map();
  private loading: Map<GameSoundId, Promise<AudioBuffer | null>> = new Map();
  private muted = false;
  private volume = 0.5;
  private initialized = false;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    try {
      this.audioContext = new AudioContext();
    } catch {
      // Web Audio API not available
    }
  }

  private async loadSound(id: GameSoundId): Promise<AudioBuffer | null> {
    if (this.buffers.has(id)) return this.buffers.get(id)!;
    if (this.loading.has(id)) return this.loading.get(id)!;

    const entry = getSoundEntry(id);
    if (!entry) return null;

    const promise = (async () => {
      try {
        const ctx = this.getContext();
        let response = await fetch(entry.file).catch(() => null);
        if (!response || !response.ok) {
          const localUrl = entry.file.startsWith('http')
            ? entry.file.replace(/^https?:\/\/[^/]+/, '')
            : entry.file;
          if (localUrl !== entry.file) {
            response = await fetch(localUrl).catch(() => null);
          }
        }
        if (!response || !response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(id, audioBuffer);
        return audioBuffer;
      } catch {
        return null;
      }
    })();

    this.loading.set(id, promise);
    return promise;
  }

  play(id: GameSoundId): void {
    if (this.muted) return;

    const entry = getSoundEntry(id);
    if (!entry) return;

    // Fire and forget — don't block on load
    void this.playAsync(id, entry);
  }

  private async playAsync(
    id: GameSoundId,
    entry: GameSoundEntry,
  ): Promise<void> {
    const buffer = await this.loadSound(id);
    if (!buffer) return;

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      source.buffer = buffer;
      gainNode.gain.value = (entry.volume ?? 0.3) * this.volume;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    } catch {
      // Playback failed — swallow
    }
  }

  preload(gameId: string, soundIds: readonly GameSoundId[]): void {
    for (const id of soundIds) {
      void this.loadSound(id);
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  toggleMute(): void {
    this.muted = !this.muted;
  }
}

export const gameSounds = new GameSoundManager();
