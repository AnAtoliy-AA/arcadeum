export interface MusicTrack {
  src: string;
  title: string;
}

export const CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL || '';
export const MUSIC_FOLDER = 'music';
export const MUSIC_CDN_URL = `${CDN_BASE}/${MUSIC_FOLDER}`;
export const TRACKS_JSON_URL = `${MUSIC_CDN_URL}/tracks.json`;

const FALLBACK_TRACKS: MusicTrack[] = [
  { src: `${MUSIC_CDN_URL}/battleship-grid.mp3`, title: 'Battleship Grid' },
  {
    src: `${MUSIC_CDN_URL}/battleship-grid-v2.mp3`,
    title: 'Battleship Grid v2',
  },
  { src: `${MUSIC_CDN_URL}/clockwork-horizon.mp3`, title: 'Clockwork Horizon' },
  {
    src: `${MUSIC_CDN_URL}/clockwork-horizon-v2.mp3`,
    title: 'Clockwork Horizon v2',
  },
  { src: `${MUSIC_CDN_URL}/glass-grid.mp3`, title: 'Glass Grid' },
  { src: `${MUSIC_CDN_URL}/glass-grid-v2.mp3`, title: 'Glass Grid v2' },
  { src: `${MUSIC_CDN_URL}/grid-of-torpedoes.mp3`, title: 'Grid of Torpedoes' },
  {
    src: `${MUSIC_CDN_URL}/grid-of-torpedoes-v2.mp3`,
    title: 'Grid of Torpedoes v2',
  },
  { src: `${MUSIC_CDN_URL}/gridline-armada.mp3`, title: 'Gridline Armada' },
  {
    src: `${MUSIC_CDN_URL}/gridline-armada-v2.mp3`,
    title: 'Gridline Armada v2',
  },
  { src: `${MUSIC_CDN_URL}/gridwater-clash.mp3`, title: 'Gridwater Clash' },
  {
    src: `${MUSIC_CDN_URL}/gridwater-clash-v2.mp3`,
    title: 'Gridwater Clash v2',
  },
  { src: `${MUSIC_CDN_URL}/iron-tide.mp3`, title: 'Iron Tide' },
  { src: `${MUSIC_CDN_URL}/iron-tide-v2.mp3`, title: 'Iron Tide v2' },
  { src: `${MUSIC_CDN_URL}/iron-wake.mp3`, title: 'Iron Wake' },
  { src: `${MUSIC_CDN_URL}/iron-wake-v2.mp3`, title: 'Iron Wake v2' },
  { src: `${MUSIC_CDN_URL}/iron-wake-v3.mp3`, title: 'Iron Wake v3' },
  { src: `${MUSIC_CDN_URL}/iron-wake-v4.mp3`, title: 'Iron Wake v4' },
  {
    src: `${MUSIC_CDN_URL}/saltwater-coordinates.mp3`,
    title: 'Saltwater Coordinates',
  },
  {
    src: `${MUSIC_CDN_URL}/saltwater-coordinates-v2.mp3`,
    title: 'Saltwater Coordinates v2',
  },
];

export let TRACKS: readonly MusicTrack[] = [...FALLBACK_TRACKS];

if (typeof window !== 'undefined' && CDN_BASE) {
  fetch(TRACKS_JSON_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch tracks: ${res.status}`);
      return res.json();
    })
    .then((data: MusicTrack[]) => {
      if (Array.isArray(data) && data.length > 0) {
        TRACKS = data;
      }
    })
    .catch(() => {});
}

if (process.env.NODE_ENV !== 'production') {
  const titles = TRACKS.map((t) => t.title);
  const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
  if (dupes.length > 0) {
    console.error('[GameMusic] Duplicate track titles:', dupes);
  }
}

export const DEFAULT_VOLUME = 0.3;

export type RepeatMode = 'off' | 'all' | 'one';

const HASH_PRIME = 31;
const SECONDS_PER_MINUTE = 60;

export function trackIndexForGame(gameId?: string | null): number {
  const id = gameId ?? '';
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * HASH_PRIME + id.charCodeAt(i)) >>> 0;
  }
  return hash % TRACKS.length;
}

export function trackForGame(gameId?: string | null): MusicTrack {
  return TRACKS[trackIndexForGame(gameId)];
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / SECONDS_PER_MINUTE);
  const s = Math.floor(seconds % SECONDS_PER_MINUTE);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
