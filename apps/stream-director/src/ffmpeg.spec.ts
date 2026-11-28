import {
  buildFfmpegArgs,
  parseProgressLine,
  redactArgs,
  withNice,
} from './ffmpeg';
import { PROFILES, buildRtmpTarget, loadConfig } from './config';
import { buildConcatList } from './music';
import { nextBackoff } from './backoff';
import type { FfmpegOutput } from './types';

const rtmp: FfmpegOutput = {
  kind: 'rtmp',
  target: 'rtmp://live.example/app/SECRETKEY',
};
const x11 = { mode: 'x11grab' as const, display: ':99' };
const get = (a: string[], flag: string): string => a[a.indexOf(flag) + 1];

describe('buildFfmpegArgs', () => {
  it('builds the 720p30 live command: x264, 2s keyframes, bitrate, flv', () => {
    const a = buildFfmpegArgs({
      profile: PROFILES.standard,
      capture: x11,
      audio: {
        pulseSource: 'arcadeum_live.monitor',
        musicList: '/tmp/m.ffconcat',
      },
      output: rtmp,
    });
    expect(get(a, '-video_size')).toBe('1280x720');
    expect(get(a, '-framerate')).toBe('30');
    expect(get(a, '-c:v')).toBe('libx264');
    expect(get(a, '-preset')).toBe('veryfast');
    expect(get(a, '-g')).toBe('60');
    expect(get(a, '-keyint_min')).toBe('60');
    expect(get(a, '-b:v')).toBe('3500k');
    expect(get(a, '-maxrate')).toBe('3500k');
    expect(get(a, '-bufsize')).toBe('7000k');
    expect(a).toContain('pulse');
    expect(a).toContain('-stream_loop');
    expect(get(a, '-filter_complex')).toMatch(/amix=inputs=2/);
    expect(a.slice(-3)).toEqual([
      '-f',
      'flv',
      'rtmp://live.example/app/SECRETKEY',
    ]);
  });

  it('lite profile is 720p25 ultrafast with a 50 frame GOP', () => {
    const a = buildFfmpegArgs({
      profile: PROFILES.lite,
      capture: x11,
      output: rtmp,
    });
    expect(get(a, '-framerate')).toBe('25');
    expect(get(a, '-preset')).toBe('ultrafast');
    expect(get(a, '-g')).toBe('50');
  });

  it('supports 1080p via STREAM_RESOLUTION', () => {
    const c = loadConfig(
      { STREAM_RESOLUTION: '1920x1080', STREAM_VIDEO_KBPS: '4500' },
      [],
    );
    const a = buildFfmpegArgs({
      profile: c.profile,
      capture: x11,
      output: rtmp,
    });
    expect(get(a, '-video_size')).toBe('1920x1080');
    expect(get(a, '-b:v')).toBe('4500k');
  });

  it('sends a silent track when there are no audio inputs', () => {
    const a = buildFfmpegArgs({
      profile: PROFILES.standard,
      capture: x11,
      output: rtmp,
    });
    expect(a.join(' ')).toContain('anullsrc');
  });

  it('dry run outputs: file with -t, and the null muxer', () => {
    const f = buildFfmpegArgs({
      profile: PROFILES.standard,
      capture: { mode: 'testsrc', display: ':0' },
      output: { kind: 'file', path: '/x/o.mp4', durationSec: 180 },
    });
    expect(get(f, '-t')).toBe('180');
    expect(f[f.length - 1]).toBe('/x/o.mp4');
    expect(f.join(' ')).toContain('testsrc2');
    const n = buildFfmpegArgs({
      profile: PROFILES.standard,
      capture: x11,
      output: { kind: 'null', durationSec: 60 },
    });
    expect(n.slice(-3)).toEqual(['-f', 'null', '-']);
  });

  it('never leaks the stream key in redacted args', () => {
    const a = buildFfmpegArgs({
      profile: PROFILES.standard,
      capture: x11,
      output: rtmp,
    });
    expect(JSON.stringify(redactArgs(a))).not.toContain('SECRETKEY');
  });
});

describe('helpers', () => {
  it('wraps with nice and parses progress', () => {
    expect(withNice('ffmpeg', ['-i'], 10)).toEqual({
      cmd: 'nice',
      args: ['-n', '10', 'ffmpeg', '-i'],
    });
    expect(withNice('ffmpeg', ['-i'], 0)).toEqual({
      cmd: 'ffmpeg',
      args: ['-i'],
    });
    expect(parseProgressLine('frame=120')).toEqual({
      key: 'frame',
      value: 120,
    });
    expect(parseProgressLine('fps=29.97')).toEqual({
      key: 'fps',
      value: 29.97,
    });
    expect(parseProgressLine('bitrate=1k')).toBeNull();
  });

  it('escapes quotes in the concat list; backoff doubles and caps', () => {
    expect(buildConcatList(["/m/it's.mp3"])).toContain(
      "file '/m/it'\\''s.mp3'",
    );
    expect([0, 1, 2, 3].map((n) => nextBackoff(n))).toEqual([
      1000, 2000, 4000, 8000,
    ]);
    expect(nextBackoff(20)).toBe(60000);
  });
});

describe('loadConfig', () => {
  it('defaults to dry run without STREAM_RTMP_URL; key from file or env', () => {
    expect(loadConfig({}, []).dryRun).toBe(true);
    expect(
      loadConfig({ STREAM_RTMP_URL: 'rtmp://h/app' }, ['--dry-run']).dryRun,
    ).toBe(true);
    const c = loadConfig(
      { STREAM_RTMP_URL: 'rtmp://h/app/', STREAM_KEY: 'k1' },
      [],
    );
    expect(c.dryRun).toBe(false);
    expect(c.rtmpTarget).toBe('rtmp://h/app/k1');
    const f = loadConfig(
      { STREAM_RTMP_URL: 'rtmp://h/app', STREAM_KEY_FILE: '/k' },
      [],
      () => 'filekey\n',
    );
    expect(f.rtmpTarget).toBe('rtmp://h/app/filekey');
    expect(buildRtmpTarget('rtmp://h/a', '')).toBe('rtmp://h/a');
  });

  it('validates env with the schema and treats blanks as unset', () => {
    expect(() => loadConfig({ STREAM_FPS: 'abc' }, [])).toThrow(
      /invalid environment/,
    );
    expect(() => loadConfig({ STREAM_MOVE_DELAY_MS: '100' }, [])).toThrow(
      /STREAM_MOVE_DELAY_MS: .*>=500/,
    );
    expect(() => loadConfig({ STREAM_RESOLUTION: 'big' }, [])).toThrow();
    const c = loadConfig({ STREAM_FPS: '', STREAM_MOVE_DELAY_MS: '5000' }, []);
    expect(c.profile.fps).toBe(30);
    expect(c.director.moveDelayMs).toBe(5000);
  });
});
