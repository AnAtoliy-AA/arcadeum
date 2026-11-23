'use strict';

const fs = require('fs');
const path = require('path');
const { LOUDNESS, MUSIC } = require('./config');

const AUDIO_EXT = new Set(['.mp3', '.m4a', '.wav', '.ogg', '.aac']);

/** List audio files in a local folder (royalty-free library). Empty if missing. */
function listLocalTracks(dir) {
  if (!dir) return [];
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

/**
 * Rotate through tracks: index = dayNumber mod N so consecutive days differ,
 * shifted by one if it would repeat `lastTrack`. Pure given inputs.
 */
function pickTrack(tracks, { now = new Date(), lastTrack = null } = {}) {
  if (!tracks.length) return null;
  const day = Math.floor(now.getTime() / 86400000);
  let i = day % tracks.length;
  if (tracks.length > 1 && tracks[i] === lastTrack) i = (i + 1) % tracks.length;
  return tracks[i];
}

/**
 * Build the audio filter graph (ends in label [a]).
 * musicIdx / voiceIdx are ffmpeg input indexes; music input must be looped
 * and the output clipped with -t totalSec by the caller.
 */
function buildAudioGraph({
  musicIdx,
  voiceIdx = null,
  musicVolume = MUSIC.baseVolume,
  voiceLeadSec = 0.25,
  totalSec,
  fadeOutSec = 1.5,
}) {
  const ln = LOUDNESS;
  const tail =
    `loudnorm=I=${ln.targetLufs}:TP=${ln.truePeakDb}:LRA=${ln.lra},` +
    `aresample=44100,afade=t=out:st=${(totalSec - fadeOutSec).toFixed(3)}:d=${fadeOutSec}`;
  if (voiceIdx === null) {
    // Music alone carries the whole mix, so it is allowed to be louder.
    return `[${musicIdx}:a]volume=${Math.min(1, musicVolume * 1.6).toFixed(2)},${tail}[a]`;
  }
  const d = MUSIC.duck;
  const lead = Math.round(voiceLeadSec * 1000);
  return [
    `[${voiceIdx}:a]adelay=${lead}|${lead},aresample=44100,asplit=2[vsc][vmix]`,
    `[${musicIdx}:a]volume=${(musicVolume * 0.6).toFixed(2)},aresample=44100[bg]`,
    `[bg][vsc]sidechaincompress=threshold=${d.threshold}:ratio=${d.ratio}:attack=${d.attackMs}:release=${d.releaseMs}[duck]`,
    // amix halves each input; volume=2 restores unity (portable vs. normalize=0).
    `[duck][vmix]amix=inputs=2:duration=first:dropout_transition=0,volume=2,${tail}[a]`,
  ].join(';');
}

module.exports = { listLocalTracks, pickTrack, buildAudioGraph, AUDIO_EXT };
