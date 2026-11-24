'use strict';

const fs = require('fs');
const path = require('path');

const AUDIO_EXT = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac']);

/** Audio files in a folder, sorted. Empty when missing. */
function listTracks(dir, readdir = fs.readdirSync) {
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
function buildConcatList(tracks) {
  return (
    'ffconcat version 1.0\n' +
    tracks.map((t) => `file '${t.replace(/'/g, "'\\''")}'`).join('\n') +
    '\n'
  );
}

function writeConcatList(tracks, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buildConcatList(tracks));
  return file;
}

module.exports = { listTracks, buildConcatList, writeConcatList };
