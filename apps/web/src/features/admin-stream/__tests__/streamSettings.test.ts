import { describe, expect, it } from 'vitest';
import {
  LIMITS,
  formatUptime,
  isSameSettings,
  minToSec,
  parseTrackLines,
  secToMin,
  serverErrorKey,
  setGame,
  validateSettings,
} from '../lib/streamSettings';
import { makeSettings } from './fixtures';

describe('validateSettings', () => {
  it('accepts the defaults', () => {
    expect(validateSettings(makeSettings())).toEqual({});
  });

  it('flags move delay outside 500-8000 ms and non-numbers', () => {
    const s = makeSettings({ bot: { difficulty: 'hard', moveDelayMs: 100 } });
    expect(validateSettings(s)['bot.moveDelayMs']).toMatchObject({
      code: 'range',
      min: 500,
      max: 8000,
    });
    s.bot.moveDelayMs = Number.NaN;
    expect(validateSettings(s)['bot.moveDelayMs'].code).toBe('range');
    s.bot.moveDelayMs = 2500.5;
    expect(validateSettings(s)['bot.moveDelayMs'].code).toBe('integer');
  });

  it('checks volume, bitrate and pause between games', () => {
    const s = makeSettings({
      secondsBetweenGames: 1,
      music: { volume: 101, tracks: [] },
      video: {
        resolution: '720p',
        fps: 30,
        bitrateKbps: 99999,
        preset: 'veryfast',
      },
    });
    const e = validateSettings(s);
    expect(e.secondsBetweenGames.code).toBe('range');
    expect(e['music.volume'].code).toBe('range');
    expect(e['video.bitrateKbps']).toMatchObject({
      max: LIMITS.bitrateKbps.max,
    });
  });

  it('checks per-game weight, duration and themes', () => {
    let s = setGame(makeSettings(), 'chess_v1', 'weight', 0);
    s = setGame(s, 'go_v1', 'maxDurationSec', minToSec(99));
    s = setGame(s, 'hearts_v1', 'themes', []);
    const e = validateSettings(s);
    expect(e['games.chess_v1.weight'].code).toBe('range');
    expect(e['games.go_v1.maxDurationMin'].code).toBe('range');
    expect(e['games.hearts_v1.themes'].code).toBe('themesRequired');
  });

  it('requires at least two enabled games', () => {
    let s = makeSettings();
    for (const id of Object.keys(s.games).slice(1)) {
      s = setGame(s, id as keyof typeof s.games, 'enabled', false);
    }
    expect(validateSettings(s).games.code).toBe('minGames');
  });

  it('rejects links, markup, long dashes and over-long banner text', () => {
    const base = makeSettings();
    const withBanner = (bannerText: string) =>
      validateSettings({ ...base, overlay: { ...base.overlay, bannerText } })[
        'overlay.bannerText'
      ];
    expect(withBanner('Join us!')).toBeUndefined();
    expect(withBanner('see http://x.test').code).toBe('bannerInvalid');
    expect(withBanner('a \u2014 b').code).toBe('bannerInvalid');
    expect(withBanner('x'.repeat(81)).code).toBe('bannerLong');
  });

  it('validates the join URL and track names', () => {
    const base = makeSettings();
    const url = (joinUrl: string) =>
      validateSettings({ ...base, overlay: { ...base.overlay, joinUrl } })[
        'overlay.joinUrl'
      ];
    expect(url('')).toBeUndefined();
    expect(url('https://arcadeum.games')).toBeUndefined();
    expect(url('javascript:alert(1)').code).toBe('urlInvalid');
    const tracks = (t: string[]) =>
      validateSettings({ ...base, music: { ...base.music, tracks: t } })[
        'music.tracks'
      ];
    expect(tracks(['Chill Loop.mp3'])).toBeUndefined();
    expect(tracks(['../secret.mp3']).code).toBe('tracksInvalid');
    expect(tracks(['a/b.mp3']).code).toBe('tracksInvalid');
  });
});

describe('helpers', () => {
  it('converts minutes and seconds', () => {
    expect(minToSec(14)).toBe(840);
    expect(secToMin(840)).toBe(14);
    expect(secToMin(90)).toBe(1.5);
  });

  it('parses one track per line, ignoring blanks', () => {
    expect(parseTrackLines(' a.mp3 \n\n b.mp3\n')).toEqual(['a.mp3', 'b.mp3']);
  });

  it('detects unsaved changes', () => {
    const a = makeSettings();
    expect(isSameSettings(a, makeSettings())).toBe(true);
    expect(isSameSettings(a, setGame(a, 'chess_v1', 'weight', 2))).toBe(false);
  });

  it('maps backend error codes to i18n keys', () => {
    expect(serverErrorKey('stream.bannerProfanity')).toBe('bannerProfanity');
    expect(serverErrorKey('stream.invalidJoinUrl')).toBe('urlInvalid');
    expect(serverErrorKey('stream.minGames')).toBe('minGames');
    expect(serverErrorKey('weird')).toBeNull();
    expect(serverErrorKey(undefined)).toBeNull();
  });

  it('formats uptime', () => {
    expect(formatUptime(null)).toBe('-');
    expect(formatUptime(45)).toBe('45s');
    expect(formatUptime(125)).toBe('2m 5s');
    expect(formatUptime(7300)).toBe('2h 1m');
    expect(formatUptime(200000)).toBe('2d 7h');
  });
});
