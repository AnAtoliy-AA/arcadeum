import * as fs from 'fs';
import * as path from 'path';

const AUDIO_EXT = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac']);

/** Audio files in a folder, sorted. Empty when missing. */
export function listTracks(
  dir: string,
  readdir: (d: string) => string[] = (d) => fs.readdirSync(d),
): string[] {
  if (!dir) return [];
  try {
    return readdir(dir)
      .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => path.resolve(dir, f));
  } catch {
    return [];
  }
}

/** ffconcat playlist body. Looped forever by ffmpeg with -stream_loop -1. */
export function buildConcatList(tracks: string[]): string {
  return (
    'ffconcat version 1.0\n' +
    tracks.map((t) => `file '${t.replace(/'/g, "'\\''")}'`).join('\n') +
    '\n'
  );
}

export function writeConcatList(tracks: string[], file: string): string {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buildConcatList(tracks));
  return file;
}
