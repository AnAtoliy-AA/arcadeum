#!/usr/bin/env node
/**
 * Generates the UI sound effects referenced by
 * `src/shared/lib/sound/sound-manifest.ts`.
 *
 * These are simple synthesized tones (no external assets/deps) that are real,
 * lightweight, and pleasant enough to ship. Swap the .wav files for
 * professionally designed audio later without changing any call sites.
 *
 * Run: `node apps/web/scripts/generate-sound-assets.mjs`
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 44100;
const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'sounds',
);

/** Build a 16-bit PCM mono WAV Buffer from Float32 samples in [-1, 1]. */
function encodeWav(samples) {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // audio format = PCM
  buffer.writeUInt16LE(1, 22); // channels = mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buffer;
}

/**
 * Render a sequence of notes. Each note: { freq, duration }. Notes are
 * concatenated with a short release tail and an attack/decay envelope so the
 * result sounds plucked rather than buzzy.
 */
function renderNotes(notes, { gain = 0.32 } = {}) {
  const samples = [];
  for (const { freq, duration } of notes) {
    const count = Math.floor(SAMPLE_RATE * duration);
    for (let i = 0; i < count; i += 1) {
      const t = i / SAMPLE_RATE;
      const progress = i / count;
      // 5ms attack, exponential decay across the note.
      const attack = Math.min(1, t / 0.005);
      const decay = Math.exp(-3.5 * progress);
      const env = attack * decay;
      // fundamental + soft 2nd harmonic for a warmer tone
      const wave =
        Math.sin(2 * Math.PI * freq * t) +
        0.25 * Math.sin(2 * Math.PI * freq * 2 * t);
      samples.push(wave * env * gain);
    }
  }
  return samples;
}

// Note frequencies (equal temperament)
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const G4 = 392.0;
const E4 = 329.63;
const C4 = 261.63;

const ASSETS = {
  // Triumphant ascending arpeggio.
  'win.wav': renderNotes([
    { freq: C5, duration: 0.12 },
    { freq: E5, duration: 0.12 },
    { freq: G5, duration: 0.12 },
    { freq: C6, duration: 0.3 },
  ]),
  // Gentle descending "aww".
  'lose.wav': renderNotes(
    [
      { freq: G4, duration: 0.16 },
      { freq: E4, duration: 0.16 },
      { freq: C4, duration: 0.28 },
    ],
    { gain: 0.26 },
  ),
  // Short crisp UI blip.
  'click.wav': renderNotes([{ freq: 1200, duration: 0.05 }], { gain: 0.22 }),
  // Classic two-tone coin chime.
  'coin.wav': renderNotes([
    { freq: 987.77, duration: 0.06 },
    { freq: 1318.51, duration: 0.14 },
  ]),
};


mkdirSync(OUT_DIR, { recursive: true });
for (const [name, samples] of Object.entries(ASSETS)) {
  const path = join(OUT_DIR, name);
  writeFileSync(path, encodeWav(samples));
  // eslint-disable-next-line no-console
  console.log(`wrote ${path} (${samples.length} samples)`);
}
