import { loadConfig } from './config';
import { applyRemote, parseCommands, parseRemote } from './remoteConfig';
import type { RemoteSettings } from './remoteConfig';
import { IDS, settings } from './remoteFixture';

const cfg = () => loadConfig({}, []);

describe('parseRemote', () => {
  it('accepts a valid payload', () => {
    const r = parseRemote({ version: 3, config: settings() });
    expect(r.ok && r.version).toBe(3);
  });

  it('rejects out-of-range or malformed values (ignored, never applied)', () => {
    const bad = settings({ bot: { difficulty: 'expert', moveDelayMs: 99999 } });
    expect(parseRemote({ version: 1, config: bad }).ok).toBe(false);
    expect(parseRemote({ version: 1, config: { enabled: 'yes' } }).ok).toBe(
      false,
    );
    expect(parseRemote(null).ok).toBe(false);
    expect(parseRemote({ config: settings() }).ok).toBe(false);
  });

  it('rejects fewer than two enabled games', () => {
    const s = settings();
    IDS.slice(1).forEach((id) => {
      s.games[id as keyof RemoteSettings['games']].enabled = false;
    });
    const r = parseRemote({ version: 1, config: s });
    expect(r.ok).toBe(false);
  });
});

describe('parseCommands', () => {
  it('keeps valid commands and drops junk', () => {
    expect(
      parseCommands([
        { id: 'a', type: 'skip' },
        { id: 'b', type: 'rm -rf' },
        { type: 'stop' },
        'x',
      ]),
    ).toEqual([{ id: 'a', type: 'skip' }]);
    expect(parseCommands({})).toEqual([]);
  });
});

describe('applyRemote (diffing)', () => {
  it('reports nothing for an identical second apply', () => {
    const c = cfg();
    applyRemote(c, settings());
    const again = applyRemote(c, settings());
    expect(again.live).toEqual([]);
    expect(again.nextGame).toEqual([]);
    expect(again.ffmpegRestart).toEqual([]);
  });

  it('applies rotation, difficulty, delay, pacing and overlay for the next game', () => {
    const c = cfg();
    applyRemote(c, settings());
    const s = settings({
      bot: { difficulty: 'medium', moveDelayMs: 3500 },
      secondsBetweenGames: 40,
      overlay: {
        joinUrl: 'https://example.com',
        showQr: false,
        parts: {
          players: true,
          status: true,
          cta: false,
          moves: true,
          arc: true,
        },
        bannerText: 'Hello',
      },
    });
    s.games.chess_v1 = {
      enabled: true,
      weight: 4,
      themes: ['zen'],
      maxDurationSec: 600,
    };
    const r = applyRemote(c, s);
    expect(r.nextGame).toEqual(
      expect.arrayContaining([
        'games',
        'moveDelay',
        'difficulty',
        'secondsBetweenGames',
        'overlay',
      ]),
    );
    expect(r.ffmpegRestart).toEqual([]);
    expect(c.director.moveDelayMs).toBe(3500);
    expect(c.director.botDifficulty).toBe('medium');
    expect(c.director.idleSeconds).toBe(40);
    expect(c.director.games.find((g) => g.id === 'chess_v1')?.weight).toBe(4);
    expect(c.scene.overlay).toEqual({
      joinUrl: 'https://example.com',
      showQr: false,
      banner: 'Hello',
      hide: ['cta'],
    });
  });

  it('removes disabled games from the rotation', () => {
    const c = cfg();
    const s = settings();
    s.games.go_v1.enabled = false;
    applyRemote(c, s);
    expect(c.director.games.map((g) => g.id)).not.toContain('go_v1');
    expect(c.director.games).toHaveLength(11);
  });

  it('flags max duration as live for the running game', () => {
    const c = cfg();
    applyRemote(c, settings());
    const s = settings();
    s.games.chess_v1.maxDurationSec = 300;
    expect(applyRemote(c, s).live).toContain('maxDuration');
    expect(
      c.director.games.find((g) => g.id === 'chess_v1')?.maxDurationMs,
    ).toBe(300_000);
  });

  it('a profile or music change needs a clean ffmpeg restart', () => {
    const c = cfg();
    applyRemote(c, settings());
    const r = applyRemote(
      c,
      settings({
        video: {
          resolution: '1080p',
          fps: 25,
          bitrateKbps: 4500,
          preset: 'fast',
        },
        music: { volume: 60, tracks: ['a.mp3'] },
      }),
    );
    expect(r.ffmpegRestart).toEqual(
      expect.arrayContaining(['videoProfile', 'musicVolume', 'musicTracks']),
    );
    expect(c.profile).toMatchObject({
      width: 1920,
      height: 1080,
      fps: 25,
      videoKbps: 4500,
      preset: 'fast',
    });
    expect(c.audio.musicVolume).toBe(0.6);
    expect(c.audio.trackNames).toEqual(['a.mp3']);
  });

  it('carries the enabled and graceful flags', () => {
    const r = applyRemote(
      cfg(),
      settings({ enabled: false, stopGracefully: true }),
    );
    expect(r).toMatchObject({ enabled: false, stopGracefully: true });
  });
});
