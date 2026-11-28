import {
  LIMITS,
  STREAM_GAME_IDS,
  bannerProblem,
  containsProfanity,
  defaultSettings,
  diffSettings,
  enabledGameCount,
  isValidJoinUrl,
  isValidTrackName,
  normalizeSettings,
} from './stream-settings.model';

describe('stream settings model', () => {
  it('defaults cover all 12 games and satisfy their own limits', () => {
    const d = defaultSettings();
    expect(Object.keys(d.games)).toHaveLength(12);
    expect(normalizeSettings(d)).toEqual(d);
    expect(enabledGameCount(d)).toBe(12);
  });

  it('never carries a stream key or RTMP URL', () => {
    const json = JSON.stringify(defaultSettings()).toLowerCase();
    expect(json).not.toMatch(/rtmp|streamkey|stream_key|secret/);
  });

  describe('clamps', () => {
    it('clamps bot move delay to 500-8000 ms', () => {
      const lo = normalizeSettings({ bot: { moveDelayMs: 1 } });
      const hi = normalizeSettings({ bot: { moveDelayMs: 999999 } });
      expect(lo.bot.moveDelayMs).toBe(LIMITS.moveDelayMs.min);
      expect(hi.bot.moveDelayMs).toBe(LIMITS.moveDelayMs.max);
    });

    it('clamps per-game duration, weight and seconds between games', () => {
      const s = normalizeSettings({
        secondsBetweenGames: 0,
        games: { chess_v1: { maxDurationSec: 99999, weight: 0 } },
      });
      expect(s.secondsBetweenGames).toBe(LIMITS.secondsBetweenGames.min);
      expect(s.games.chess_v1.maxDurationSec).toBe(LIMITS.maxDurationSec.max);
      expect(s.games.chess_v1.weight).toBe(LIMITS.weight.min);
    });

    it('clamps music volume 0-100 and bitrate to the safe range', () => {
      const s = normalizeSettings({
        music: { volume: 500 },
        video: { bitrateKbps: 100000 },
      });
      expect(s.music.volume).toBe(100);
      expect(s.video.bitrateKbps).toBe(LIMITS.bitrateKbps.max);
      expect(
        normalizeSettings({ music: { volume: -5 }, video: { bitrateKbps: 1 } })
          .video.bitrateKbps,
      ).toBe(LIMITS.bitrateKbps.min);
    });

    it('falls back for NaN, strings and unknown enum values', () => {
      const s = normalizeSettings({
        bot: { moveDelayMs: Number.NaN, difficulty: 'godlike' },
        video: { fps: 60, resolution: '4k', preset: 'placebo' },
        sceneLanguage: 'xx',
      });
      expect(s.bot.moveDelayMs).toBe(LIMITS.moveDelayMs.min);
      expect(s.bot.difficulty).toBe('expert');
      expect(s.video).toMatchObject({
        fps: 30,
        resolution: '720p',
        preset: 'veryfast',
      });
      expect(s.sceneLanguage).toBe('en');
    });

    it('drops unknown themes and refills an empty theme list', () => {
      const s = normalizeSettings({
        games: {
          go_v1: { themes: ['zen', 'bogus'] },
          hearts_v1: { themes: [] },
        },
      });
      expect(s.games.go_v1.themes).toEqual(['zen']);
      expect(s.games.hearts_v1.themes.length).toBeGreaterThan(1);
    });

    it('ignores non-object input entirely', () => {
      expect(normalizeSettings('nope')).toEqual(defaultSettings());
      expect(normalizeSettings(null)).toEqual(defaultSettings());
    });
  });

  describe('text and URL rules', () => {
    it('accepts clean banner text and rejects profanity (even obfuscated)', () => {
      expect(bannerProblem('Join the fun!')).toBeNull();
      expect(bannerProblem('what a sh1t game')).toBe('stream.bannerProfanity');
      expect(bannerProblem('f.u.c.k')).toBe('stream.bannerProfanity');
      expect(containsProfanity('Classic chess night')).toBe(false);
    });

    it('rejects long, markup, link and dash banner text', () => {
      expect(bannerProblem('x'.repeat(81))).toBe('stream.bannerTooLong');
      expect(bannerProblem('<b>hi</b>')).toBe('stream.bannerInvalid');
      expect(bannerProblem('go to http://evil.test')).toBe(
        'stream.bannerInvalid',
      );
      expect(bannerProblem('a \u2014 b')).toBe('stream.bannerInvalid');
    });

    it('validates join URLs: empty ok, http(s) only', () => {
      expect(isValidJoinUrl('')).toBe(true);
      expect(isValidJoinUrl('https://arcadeum.games/play')).toBe(true);
      expect(isValidJoinUrl('javascript:alert(1)')).toBe(false);
      expect(isValidJoinUrl('not a url')).toBe(false);
    });

    it('track names are names only (no paths)', () => {
      expect(isValidTrackName('Chill Loop 1.mp3')).toBe(true);
      expect(isValidTrackName('../etc/passwd')).toBe(false);
      expect(isValidTrackName('a/b.mp3')).toBe(false);
      expect(isValidTrackName('')).toBe(false);
    });

    it('keeps the invalid banner/url out of normalised output', () => {
      const s = normalizeSettings({
        overlay: { bannerText: 'fuck', joinUrl: 'ftp://x' },
      });
      expect(s.overlay.bannerText).toBe('');
      expect(s.overlay.joinUrl).toBe('');
    });
  });

  it('diffSettings reports leaf changes only', () => {
    const a = defaultSettings();
    const b = normalizeSettings({
      bot: { moveDelayMs: 3000 },
      games: { chess_v1: { enabled: false } },
    });
    const paths = diffSettings(a, b).map((c) => c.path);
    expect(paths.sort()).toEqual(['bot.moveDelayMs', 'games.chess_v1.enabled']);
    expect(diffSettings(a, a)).toEqual([]);
  });

  it('lists exactly the 12 supported AI-vs-AI games', () => {
    expect(STREAM_GAME_IDS).toHaveLength(12);
    expect(STREAM_GAME_IDS).not.toContain('texas_holdem_v1');
  });
});
