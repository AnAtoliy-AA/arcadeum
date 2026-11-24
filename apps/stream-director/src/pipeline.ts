import * as os from 'os';
import * as path from 'path';
import { StreamRunner } from './streamRunner';
import type { SpawnFn } from './streamRunner';
import { Director } from './director';
import { createBrowser } from './browser';
import { createApi } from './api';
import { listTracks, writeConcatList } from './music';
import { ensureVirtualSink } from './audioSetup';
import type { Health } from './health';
import type {
  Alert,
  AudioInputs,
  FfmpegOutput,
  Logger,
  StreamConfig,
} from './types';

/** Output descriptor for the runner: rtmp, local mp4 or null sink. */
export function outputFor(config: StreamConfig): FfmpegOutput {
  if (!config.dryRun) {
    return { kind: 'rtmp', target: config.rtmpTarget ?? '' };
  }
  const durationSec = config.dry.seconds;
  return config.dry.sink === 'null'
    ? { kind: 'null', durationSec }
    : { kind: 'file', path: config.dry.out, durationSec };
}

/** Audio inputs: pulse monitor (if a sink exists) and the looping music bed. */
function prepareAudio(config: StreamConfig, log: Logger): AudioInputs {
  const audio: AudioInputs = {
    gameVolume: config.audio.gameVolume,
    musicVolume: config.audio.musicVolume,
  };
  const source = config.audio.pulseSource;
  if (source && ensureVirtualSink(source.replace(/\.monitor$/, ''))) {
    audio.pulseSource = source;
  } else if (source) {
    log.warn('PulseAudio not available, streaming without game audio');
  }
  const tracks = listTracks(config.audio.musicDir);
  if (tracks.length) {
    audio.musicList = writeConcatList(
      tracks,
      path.join(os.tmpdir(), 'arcadeum-stream-music.ffconcat'),
    );
    log.info('music bed', { tracks: tracks.length });
  } else {
    log.warn(
      'no music tracks found (set STREAM_MUSIC_DIR to a folder of licensed tracks)',
    );
  }
  return audio;
}

export interface Pipeline {
  director: Director;
  start(onFinished?: () => void): Promise<void>;
  stop(): Promise<void>;
}

/** One start()/stop() unit: ffmpeg runner + browser + director. */
export function createPipeline({
  config,
  log,
  health,
  alert,
  spawnFn,
}: {
  config: StreamConfig;
  log: Logger;
  health: Health;
  alert: Alert;
  spawnFn?: SpawnFn;
}): Pipeline {
  const api = createApi({ be: config.be });
  const browser = createBrowser({ config, log });
  const director = new Director({ config, api, browser, health, log, alert });
  let runner: StreamRunner | null = null;
  let loop: Promise<void> = Promise.resolve();

  return {
    director,
    start(onFinished) {
      const audio = prepareAudio(config, log);
      const r = new StreamRunner({
        config,
        spawnFn,
        log,
        outputFor: () => outputFor(config),
        audioFor: () => audio,
      });
      runner = r;
      r.on('progress', ({ frame, fps }: { frame: number; fps: number }) =>
        health.update({ ffmpegFrames: frame, ffmpegFps: fps }),
      );
      r.on('restart', ({ reason }: { reason: string }) => {
        health.update({
          ffmpegRestarts: r.restarts,
          lastRestartReason: reason,
          lastRestartAt: new Date().toISOString(),
        });
        void alert('ffmpeg-restart', `ffmpeg restarted: ${reason}`);
      });
      r.on('finished', () => onFinished?.());
      r.start();
      director.stopped = false;
      loop = director
        .run()
        .catch((err: Error) =>
          log.error('director crashed', { error: err.message }),
        );
      return Promise.resolve();
    },
    async stop() {
      director.stop();
      await runner?.stop();
      await browser.close();
      await Promise.race([loop, new Promise((r) => setTimeout(r, 5000))]);
    },
  };
}
