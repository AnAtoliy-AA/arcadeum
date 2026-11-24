'use strict';

const os = require('os');
const path = require('path');
const { StreamRunner } = require('./streamRunner');
const { Director } = require('./director');
const { createBrowser } = require('./browser');
const { createApi } = require('./api');
const { listTracks, writeConcatList } = require('./music');
const { ensureVirtualSink } = require('./audioSetup');

/** Output descriptor for the runner: rtmp, local mp4 or null sink. */
function outputFor(config) {
  if (!config.dryRun) return { kind: 'rtmp', target: config.rtmpTarget };
  const base = { durationSec: config.dry.seconds };
  return config.dry.sink === 'null'
    ? { kind: 'null', ...base }
    : { kind: 'file', path: config.dry.out, ...base };
}

/** Audio inputs: pulse monitor (if a sink exists) and the looping music bed. */
function prepareAudio(config, log) {
  const audio = {
    gameVolume: config.audio.gameVolume,
    musicVolume: config.audio.musicVolume,
  };
  if (
    config.audio.pulseSource &&
    ensureVirtualSink(config.audio.pulseSource.replace(/\.monitor$/, ''))
  ) {
    audio.pulseSource = config.audio.pulseSource;
  } else if (config.audio.pulseSource) {
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

/** One start()/stop() unit: ffmpeg runner + browser + director. */
function createPipeline({ config, log, health, alert, spawnFn }) {
  const api = createApi({ be: config.be });
  const browser = createBrowser({ config, log });
  const director = new Director({ config, api, browser, health, log, alert });
  let runner = null;
  let loop = null;

  return {
    director,
    get runner() {
      return runner;
    },
    async start(onFinished) {
      const audio = prepareAudio(config, log);
      runner = new StreamRunner({
        config,
        spawnFn,
        log,
        outputFor: () => outputFor(config),
        audioFor: () => audio,
      });
      runner.on('progress', ({ frame, fps }) =>
        health.update({ ffmpegFrames: frame, ffmpegFps: fps }),
      );
      runner.on('restart', ({ reason }) => {
        health.update({
          ffmpegRestarts: runner.restarts,
          lastRestartReason: reason,
          lastRestartAt: new Date().toISOString(),
        });
        void alert('ffmpeg-restart', `ffmpeg restarted: ${reason}`);
      });
      runner.on('finished', () => onFinished?.());
      runner.start();
      director.stopped = false;
      loop = director
        .run()
        .catch((err) => log.error('director crashed', { error: err.message }));
    },
    async stop() {
      director.stop();
      await runner?.stop();
      await browser.close();
      await Promise.race([loop, new Promise((r) => setTimeout(r, 5000))]);
    },
  };
}

module.exports = { createPipeline, outputFor };
