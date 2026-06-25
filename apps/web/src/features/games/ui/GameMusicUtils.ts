export interface MusicTrack {
  src: string;
  title: string;
}

const CDN_BASE = 'https://pub-xxx.r2.dev/music';

const REMOTE_TRACKS: MusicTrack[] = [
  { src: `${CDN_BASE}/clockwork-horizon-v2.mp3`, title: 'Brass Meridian' },
  { src: `${CDN_BASE}/glass-grid.mp3`, title: 'Glass Grid' },
  { src: `${CDN_BASE}/glass-grid-v2.mp3`, title: 'Crystal Dispatch' },
  { src: `${CDN_BASE}/iron-tide.mp3`, title: 'Iron Tide' },
  { src: `${CDN_BASE}/iron-tide-v2.mp3`, title: 'Steel Current' },
  { src: `${CDN_BASE}/iron-wake.mp3`, title: 'Iron Wake' },
  { src: `${CDN_BASE}/iron-wake-v2.mp3`, title: 'Ember Drift' },
  { src: `${CDN_BASE}/iron-wake-v3.mp3`, title: 'Ashen Signal' },
  { src: `${CDN_BASE}/iron-wake-v4.mp3`, title: 'Final Surge' },
];

export const TRACKS: readonly MusicTrack[] = [
  { src: '/music/clockwork-horizon.mp3', title: 'Clockwork Horizon' },
  { src: '/music/clockwork-horizon-v2.mp3', title: 'Brass Meridian' },
  ...REMOTE_TRACKS,
] as const;

if (process.env.NODE_ENV !== 'production') {
  const titles = TRACKS.map((t) => t.title);
  const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
  if (dupes.length > 0) {
    console.error('[GameMusic] Duplicate track titles:', dupes);
  }
}

export const DEFAULT_VOLUME = 0.3;

export type RepeatMode = 'off' | 'all' | 'one';

export function trackIndexForGame(gameId?: string | null): number {
  const id = gameId ?? '';
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % TRACKS.length;
}

export function trackForGame(gameId?: string | null): MusicTrack {
  return TRACKS[trackIndexForGame(gameId)];
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
