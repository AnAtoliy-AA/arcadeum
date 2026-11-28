'use strict';

const fs = require('fs');
const path = require('path');
const { getConfig } = require('./config');

/** Read the history file; returns [] when missing or corrupt. */
function readHistory(historyPath = getConfig().historyPath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Atomic write (tmp + rename) so a crash never leaves a half file. */
function writeHistory(records, historyPath = getConfig().historyPath) {
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  const tmp = `${historyPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(records, null, 2));
  fs.renameSync(tmp, historyPath);
}

/**
 * Record metadata for one posted video.
 * Fields: date, game, scenario, format, hook, voice, cta, lengthClass,
 * durationSec (actual measured length of the posted video), platforms,
 * posts: [{platform, postId}], stats (filled by refresh).
 */
function recordPost(meta, historyPath = getConfig().historyPath) {
  const records = readHistory(historyPath);
  const date = meta.date || new Date().toISOString();
  const id =
    meta.id || `${date.slice(0, 10)}-${meta.game || 'x'}-${records.length}`;
  const record = {
    id,
    date,
    game: meta.game || 'unknown',
    scenario: meta.scenario || null,
    format: meta.format || meta.scenario || 'unknown',
    hook: meta.hook || null,
    voice: meta.voice || null,
    cta: meta.cta || null,
    lengthClass: meta.lengthClass || null,
    durationSec: typeof meta.durationSec === 'number' ? meta.durationSec : null,
    platforms: meta.platforms || [],
    posts: meta.posts || [],
    stats: null,
    statsFetchedAt: null,
  };
  const idx = records.findIndex((r) => r.id === id);
  if (idx >= 0) records[idx] = { ...records[idx], ...record };
  else records.push(record);
  writeHistory(records, historyPath);
  return record;
}

module.exports = { readHistory, writeHistory, recordPost };
