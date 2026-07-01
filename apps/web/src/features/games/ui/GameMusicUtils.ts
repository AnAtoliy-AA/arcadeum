export interface MusicTrack {
  src: string;
  title: string;
}

export const CDN_BASE = process.env.NEXT_PUBLIC_CDN_URL || '';
export const MUSIC_FOLDER = 'music';
export const MUSIC_CDN_URL = `${CDN_BASE}/${MUSIC_FOLDER}`;
export const TRACKS_JSON_URL = `${MUSIC_CDN_URL}/tracks.json`;

export const FALLBACK_TRACKS: MusicTrack[] = [
  { src: `${MUSIC_CDN_URL}/battleship-grid.mp3`, title: 'Battleship Grid' },
  { src: `${MUSIC_CDN_URL}/clockwork-thesis.mp3`, title: 'Clockwork Thesis' },
  { src: `${MUSIC_CDN_URL}/glass-grid.mp3`, title: 'Glass Grid' },
  { src: `${MUSIC_CDN_URL}/grid-of-torpedoes.mp3`, title: 'Grid of Torpedoes' },
  { src: `${MUSIC_CDN_URL}/gridline-armada.mp3`, title: 'Gridline Armada' },
  { src: `${MUSIC_CDN_URL}/iron-tide.mp3`, title: 'Iron Tide' },
  { src: `${MUSIC_CDN_URL}/iron-wake.mp3`, title: 'Iron Wake' },
  {
    src: `${MUSIC_CDN_URL}/saltwater-coordinates.mp3`,
    title: 'Saltwater Coordinates',
  },
  { src: `${MUSIC_CDN_URL}/lobby-glow.mp3`, title: 'Lobby Glow' },
  { src: `${MUSIC_CDN_URL}/victory-bloom.mp3`, title: 'Victory Bloom' },
];

if (process.env.NODE_ENV !== 'production') {
  const titles = FALLBACK_TRACKS.map((t) => t.title);
  const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
  if (dupes.length > 0) {
    console.error('[GameMusic] Duplicate track titles:', dupes);
  }
}

let cachedTracks: readonly MusicTrack[] | null = null;

async function loadTracksJson(): Promise<MusicTrack[] | null> {
  const res = await fetch(TRACKS_JSON_URL);
  if (!res.ok) throw new Error(`Failed to fetch tracks: ${res.status}`);
  const data: MusicTrack[] = await res.json();
  return Array.isArray(data) && data.length > 0 ? data : null;
}

export async function fetchTracks(): Promise<readonly MusicTrack[]> {
  if (cachedTracks) return cachedTracks;
  if (CDN_BASE && process.env.NODE_ENV !== 'development') {
    try {
      const data = await loadTracksJson();
      if (data) {
        const resolved = data.map((t) => ({
          ...t,
          src: t.src.startsWith('http') ? t.src : `${CDN_BASE}/${t.src}`,
        }));
        cachedTracks = resolved;
        return resolved;
      }
    } catch {
      // Fall through to fallback
    }
  }
  return FALLBACK_TRACKS;
}

export const DEFAULT_VOLUME = 0.3;

export type RepeatMode = 'off' | 'all' | 'one';

const HASH_PRIME = 31;
const SECONDS_PER_MINUTE = 60;

export function trackIndexForGame(
  gameId: string | null | undefined,
  trackCount: number,
): number {
  const id = gameId ?? '';
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * HASH_PRIME + id.charCodeAt(i)) >>> 0;
  }
  return hash % trackCount;
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / SECONDS_PER_MINUTE);
  const s = Math.floor(seconds % SECONDS_PER_MINUTE);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
