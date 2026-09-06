export type SoundType =
  | 'move'
  | 'capture'
  | 'check'
  | 'castle'
  | 'promotion'
  | 'gameStart'
  | 'gameEnd'
  | 'drawOffer'
  | 'notification'
  | 'error';

const SOUND_URLS: Record<SoundType, string> = {
  move: '/sounds/chess/move.mp3',
  capture: '/sounds/chess/capture.mp3',
  check: '/sounds/chess/check.mp3',
  castle: '/sounds/chess/castle.mp3',
  promotion: '/sounds/chess/promotion.mp3',
  gameStart: '/sounds/chess/game-start.mp3',
  gameEnd: '/sounds/chess/game-end.mp3',
  drawOffer: '/sounds/chess/draw-offer.mp3',
  notification: '/sounds/chess/notification.mp3',
  error: '/sounds/chess/error.mp3',
};

class ChessSoundManager {
  private audioContext: AudioContext | null = null;
  private buffers: Map<SoundType, AudioBuffer> = new Map();
  private muted = false;
  private volume = 0.5;
  private loaded = false;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async loadAll(): Promise<void> {
    if (this.loaded) return;
    const ctx = this.getContext();
    const entries = Object.entries(SOUND_URLS) as [SoundType, string][];

    await Promise.allSettled(
      entries.map(async ([type, url]) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          this.buffers.set(type, audioBuffer);
        } catch {
          // Silently skip if sound file not found
        }
      }),
    );

    this.loaded = true;
  }

  play(type: SoundType): void {
    if (this.muted || !this.buffers.has(type)) return;

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const buffer = this.buffers.get(type);
    if (!buffer) return;

    source.buffer = buffer;
    gainNode.gain.value = this.volume;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
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

export const chessSounds = new ChessSoundManager();
